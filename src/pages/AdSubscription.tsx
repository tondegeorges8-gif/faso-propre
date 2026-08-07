import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { AD_PRESETS, COMMISSION_RATE, commissionFor, dailyRate, daysForAmount, formatDuration } from '@/lib/adPricing';

interface Boutique {
  id: string;
  nom: string;
  subscription_status: string;
  subscription_expires_at: string | null;
}

interface ArticleLite { id: string; nom: string }

const statusLabel: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  active: { label: 'Espace publicitaire actif', variant: 'default' },
  pending: { label: 'En attente de paiement', variant: 'secondary' },
  expired: { label: 'Expiré — à renouveler', variant: 'destructive' },
};

const AdSubscription: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, profile, isLoading } = useAuth();

  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [articles, setArticles] = useState<ArticleLite[]>([]);
  const [boutiqueId, setBoutiqueId] = useState(params.get('boutique') ?? '');
  const [targetType, setTargetType] = useState(params.get('article') ? 'article' : 'boutique');
  const [articleId, setArticleId] = useState(params.get('article') ?? '');
  const [amount, setAmount] = useState('1000');
  const [operator, setOperator] = useState<string | null>(null);
  const [phone, setPhone] = useState(profile?.telephone ?? '');
  const [ussd, setUssd] = useState('');
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

    const { data: arts } = await supabase
      .from('articles')
      .select('id, nom')
      .eq('owner_user_id', user.id)
      .order('created_at', { ascending: false });
    setArticles((arts || []) as ArticleLite[]);
  };

  useEffect(() => {
    loadBoutiques();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const numericAmount = Number(amount || 0);
  const days = useMemo(() => daysForAmount(numericAmount), [numericAmount]);
  const commission = commissionFor(numericAmount);

  const startPayment = async () => {
    const phoneError = validatePhone(phone);
    if (numericAmount < 1000 || days <= 0) {
      return toast({ title: 'Montant insuffisant', description: 'Le montant minimum est de 1 000 FCFA (1 jour).', variant: 'destructive' });
    }
    if (targetType === 'article' && !articleId) {
      return toast({ title: 'Produit requis', description: 'Choisissez le produit à booster.', variant: 'destructive' });
    }
    if (!operator) {
      return toast({ title: 'Opérateur requis', description: 'Choisissez Orange Money, Moov Money ou Wave.', variant: 'destructive' });
    }
    if (phoneError) {
      return toast({ title: 'Numéro invalide', description: phoneError, variant: 'destructive' });
    }
    setBusy(true);
    const allowed = await checkRateLimit('ad_subscription', 3, 600);
    if (!allowed) {
      setBusy(false);
      return toast({ title: 'Trop de tentatives', description: 'Patientez avant de relancer un paiement.', variant: 'destructive' });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    expectedOtp.current = code;

    const { data, error } = await supabase
      .from('ad_subscriptions')
      .insert({
        user_id: user!.id,
        boutique_id: boutiqueId || null,
        article_id: targetType === 'article' ? articleId : null,
        target_type: targetType,
        amount: numericAmount,
        days,
        months: Math.max(1, Math.ceil(days / 30)),
        commission_rate: COMMISSION_RATE,
        operator,
        phone: phone.trim(),
        status: 'pending',
      })
      .select('id')
      .single();

    setBusy(false);
    if (error || !data) {
      return toast({ title: 'Erreur', description: error?.message ?? 'Paiement impossible', variant: 'destructive' });
    }
    setSubscriptionId(data.id);
    setStep('otp');
    toast({ title: 'Code envoyé', description: `Code de validation (démo) : ${code}` });
  };

  const confirmOtp = async () => {
    if (otp !== expectedOtp.current) {
      return toast({ title: 'Code incorrect', description: 'Vérifiez le code reçu par SMS.', variant: 'destructive' });
    }
    setBusy(true);
    const starts = new Date();
    const expires = new Date();
    expires.setDate(expires.getDate() + days);

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
    toast({ title: 'Publicité activée 🎉', description: `Votre mise en avant est active jusqu'au ${expires.toLocaleDateString('fr-FR')}.` });
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
            <p className="text-xs opacity-90">À partir de 1 000 FCFA — durée calculée automatiquement</p>
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
                    : 'Aucune publicité active'}
                </p>
              </div>
              <Badge variant={statusLabel[active.subscription_status]?.variant ?? 'secondary'}>
                {statusLabel[active.subscription_status]?.label ?? active.subscription_status}
              </Badge>
            </CardContent>
          </Card>
        )}

        {step === 'form' && (
          <>
            {boutiques.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-6 text-center space-y-3">
                  <p className="text-sm text-muted-foreground">Créez d'abord votre boutique pour la mettre en avant.</p>
                  <Button onClick={() => navigate('/boutique/nouvelle')}>Créer une boutique</Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-lg">Booster ma visibilité</CardTitle></CardHeader>
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
                  <Label>Que souhaitez-vous mettre en avant ?</Label>
                  <Select value={targetType} onValueChange={setTargetType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boutique">Ma boutique</SelectItem>
                      <SelectItem value="article">Un produit précis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {targetType === 'article' && (
                  <div className="space-y-1">
                    <Label>Produit à booster</Label>
                    <Select value={articleId} onValueChange={setArticleId}>
                      <SelectTrigger><SelectValue placeholder="Choisir un produit" /></SelectTrigger>
                      <SelectContent className="max-h-72">
                        {articles.map((a) => <SelectItem key={a.id} value={a.id}>{a.nom}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Montant de la publicité (FCFA)</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {AD_PRESETS.map((p) => (
                      <button
                        key={p.amount}
                        type="button"
                        onClick={() => setAmount(String(p.amount))}
                        className={`rounded-lg border-2 px-2 py-2 text-[11px] font-medium transition-colors ${
                          Number(amount) === p.amount ? 'border-primary text-primary' : 'border-border text-muted-foreground'
                        }`}
                      >
                        {p.label}
                        <span className="block text-[10px] opacity-80">{p.amount.toLocaleString('fr-FR')} F</span>
                      </button>
                    ))}
                  </div>
                  <Input type="number" min={1000} step={500} value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>

                <div className="p-3 rounded-lg bg-accent/30 space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Durée calculée automatiquement</span>
                    <span className="font-bold text-primary">{formatDuration(days)}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Tarif appliqué : {dailyRate(numericAmount).toLocaleString('fr-FR')} FCFA / jour ({days} jour{days > 1 ? 's' : ''}).
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Dont commission plateforme ({Math.round(COMMISSION_RATE * 100)}%) : {commission.toLocaleString('fr-FR')} FCFA.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Opérateur de paiement</Label>
                  <PaymentOperators value={operator} onChange={setOperator} />
                </div>

                <div className="space-y-1">
                  <Label>Numéro de téléphone / compte</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="70 00 00 00" />
                </div>

                <div className="space-y-1">
                  <Label>Code USSD de confirmation</Label>
                  <Input value={ussd} onChange={(e) => setUssd(e.target.value)} placeholder="Ex : *144*4*6#" />
                  <p className="text-[11px] text-muted-foreground">
                    Composez le code USSD de votre opérateur pour autoriser le débit, puis validez.
                  </p>
                </div>

                <Button className="w-full" onClick={startPayment} disabled={busy}>
                  {busy ? 'Traitement…' : `Payer ${numericAmount.toLocaleString('fr-FR')} FCFA et recevoir le code`}
                </Button>
              </CardContent>
            </Card>
          </>
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
                Valider votre paiement
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep('form')}>Modifier les informations</Button>
            </CardContent>
          </Card>
        )}

        {step === 'done' && (
          <Card>
            <CardContent className="py-10 flex flex-col items-center text-center gap-3">
              <BadgeCheck className="text-primary" size={40} />
              <p className="font-semibold">Publicité activée</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Votre {targetType === 'article' ? 'produit' : 'boutique'} est mis en avant pendant {formatDuration(days)} dans FASO YAAR.
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
