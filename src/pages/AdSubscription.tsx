import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import PaymentOperators from '@/components/payments/PaymentOperators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, BadgeCheck, Megaphone, ShieldCheck } from 'lucide-react';
import { checkRateLimit, validatePhone } from '@/lib/antiSpam';

const MONTHLY_FEE = 5000;

interface Boutique {
  id: string;
  nom: string;
  subscription_status: string;
  subscription_expires_at: string | null;
}

const statusLabel: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  active: { label: 'Espace publicitaire actif', variant: 'default' },
  pending: { label: 'En attente de paiement', variant: 'secondary' },
  expired: { label: 'Expiré — à renouveler', variant: 'destructive' },
};

const AdSubscription: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading } = useAuth();

  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [boutiqueId, setBoutiqueId] = useState('');
  const [months, setMonths] = useState('1');
  const [operator, setOperator] = useState<string | null>(null);
  const [phone, setPhone] = useState(profile?.telephone ?? '');
  const [step, setStep] = useState<'form' | 'otp' | 'done'>('form');
  const [otp, setOtp] = useState('');
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const expectedOtp = useRef<string>('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) navigate('/auth');
  }, [user, isLoading, navigate]);

  const loadBoutiques = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('boutiques')
      .select('id, nom, subscription_status, subscription_expires_at')
      .eq('owner_user_id', user.id);
    const list = (data || []) as Boutique[];
    setBoutiques(list);
    if (list.length && !boutiqueId) setBoutiqueId(list[0].id);
  };

  useEffect(() => {
    loadBoutiques();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const total = MONTHLY_FEE * Number(months || 1);

  const startPayment = async () => {
    const phoneError = validatePhone(phone);
    if (!operator) {
      toast({ title: 'Opérateur requis', description: 'Choisissez Orange Money, Moov Money ou Wave.', variant: 'destructive' });
      return;
    }
    if (phoneError) {
      toast({ title: 'Numéro invalide', description: phoneError, variant: 'destructive' });
      return;
    }
    setBusy(true);
    const allowed = await checkRateLimit('ad_subscription', 3, 600);
    if (!allowed) {
      setBusy(false);
      toast({ title: 'Trop de tentatives', description: 'Patientez avant de relancer un paiement.', variant: 'destructive' });
      return;
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    expectedOtp.current = code;

    const { data, error } = await supabase
      .from('ad_subscriptions')
      .insert({
        user_id: user!.id,
        boutique_id: boutiqueId || null,
        amount: total,
        months: Number(months),
        operator,
        phone: phone.trim(),
        status: 'pending',
      })
      .select('id')
      .single();

    setBusy(false);
    if (error || !data) {
      toast({ title: 'Erreur', description: error?.message ?? 'Paiement impossible', variant: 'destructive' });
      return;
    }
    setSubscriptionId(data.id);
    setStep('otp');
    toast({ title: 'Code envoyé', description: `Code de validation (démo) : ${code}` });
  };

  const confirmOtp = async () => {
    if (otp !== expectedOtp.current) {
      toast({ title: 'Code incorrect', description: 'Vérifiez le code reçu par SMS.', variant: 'destructive' });
      return;
    }
    setBusy(true);
    const starts = new Date();
    const expires = new Date();
    expires.setMonth(expires.getMonth() + Number(months));

    await supabase
      .from('ad_subscriptions')
      .update({ otp_verified: true, status: 'active', starts_at: starts.toISOString(), expires_at: expires.toISOString() })
      .eq('id', subscriptionId!);

    if (boutiqueId) {
      await supabase
        .from('boutiques')
        .update({ subscription_status: 'active', subscription_expires_at: expires.toISOString() })
        .eq('id', boutiqueId);
    }

    setBusy(false);
    setStep('done');
    loadBoutiques();
    toast({ title: 'Abonnement activé 🎉', description: `Votre espace publicitaire est actif jusqu'au ${expires.toLocaleDateString('fr-FR')}.` });
  };

  const active = boutiques.find((b) => b.id === boutiqueId);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="gradient-hero text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate('/faso-yaar')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2"><Megaphone size={20} /> Espace publicitaire</h1>
            <p className="text-xs opacity-90">5 000 FCFA / mois pour mettre en avant votre boutique</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-4">
        {active && (
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{active.nom}</p>
                <p className="text-xs text-muted-foreground">
                  {active.subscription_expires_at
                    ? `Valide jusqu'au ${new Date(active.subscription_expires_at).toLocaleDateString('fr-FR')}`
                    : 'Aucun abonnement actif'}
                </p>
              </div>
              <Badge variant={statusLabel[active.subscription_status]?.variant ?? 'secondary'}>
                {statusLabel[active.subscription_status]?.label ?? active.subscription_status}
              </Badge>
            </CardContent>
          </Card>
        )}

        {step === 'form' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Souscrire / Renouveler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {boutiques.length > 0 && (
                <div className="space-y-1">
                  <Label>Boutique concernée</Label>
                  <Select value={boutiqueId} onValueChange={setBoutiqueId}>
                    <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                    <SelectContent>
                      {boutiques.map((b) => <SelectItem key={b.id} value={b.id}>{b.nom}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1">
                <Label>Durée</Label>
                <Select value={months} onValueChange={setMonths}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 3, 6, 12].map((m) => (
                      <SelectItem key={m} value={String(m)}>{m} mois — {(MONTHLY_FEE * m).toLocaleString('fr-FR')} FCFA</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Opérateur de paiement</Label>
                <PaymentOperators value={operator} onChange={setOperator} />
              </div>

              <div className="space-y-1">
                <Label>Numéro de téléphone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="70 00 00 00" />
              </div>

              <div className="p-3 rounded-lg bg-accent/30 flex items-center justify-between">
                <span className="text-sm">Total à payer</span>
                <span className="font-bold text-primary">{total.toLocaleString('fr-FR')} FCFA</span>
              </div>

              <Button className="w-full" onClick={startPayment} disabled={busy}>
                {busy ? 'Traitement…' : 'Payer et recevoir le code'}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'otp' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><ShieldCheck size={18} /> Validation par code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Saisissez le code à 6 chiffres envoyé au {phone}.
              </p>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} />)}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button className="w-full" onClick={confirmOtp} disabled={busy || otp.length !== 6}>
                Valider mon abonnement
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep('form')}>Modifier les informations</Button>
            </CardContent>
          </Card>
        )}

        {step === 'done' && (
          <Card>
            <CardContent className="py-10 flex flex-col items-center text-center gap-3">
              <BadgeCheck className="text-primary" size={40} />
              <p className="font-semibold">Espace publicitaire activé</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Votre boutique et vos articles sont désormais mis en avant dans FASO YAAR.
              </p>
              <Button onClick={() => navigate('/faso-yaar')}>Retour au marché</Button>
            </CardContent>
          </Card>
        )}

        <p className="text-[11px] text-muted-foreground text-center">
          Paiement simulé à des fins de démonstration — aucun débit réel n'est effectué.
        </p>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default AdSubscription;
