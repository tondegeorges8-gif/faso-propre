import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import PaymentOperators from '@/components/payments/PaymentOperators';
import { BURKINA_CITIES } from '@/data/burkinaCities';
import { METIERS } from '@/data/metiers';
import { ArrowLeft, Camera, FileText, IdCard, Check, GraduationCap } from 'lucide-react';
import { z } from 'zod';

type Plan = 'non_certifie' | 'certifie';

const PLANS: Record<Plan, { label: string; price: number; description: string }> = {
  non_certifie: {
    label: 'Sans diplôme (Non certifié)',
    price: 10000,
    description: 'Abonnement 6 mois — photo du visage + CNIB',
  },
  certifie: {
    label: 'Avec diplôme (Certifié)',
    price: 25000,
    description: 'Abonnement 6 mois — photo du visage + diplôme (PDF) + CNIB',
  },
};

const schema = z.object({
  nom: z.string().trim().min(2, 'Nom requis'),
  prenom: z.string().trim().min(2, 'Prénom requis'),
  telephone: z.string().trim().regex(/^\+226\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/, 'Format: +226 XX XX XX XX'),
  email: z.string().trim().email('Email invalide'),
  ville: z.string().min(1, 'Ville requise'),
});

const FileField: React.FC<{
  id: string;
  label: string;
  accept: string;
  icon: React.ElementType;
  file: File | null;
  onFile: (f: File | null) => void;
  capture?: boolean;
}> = ({ id, label, accept, icon: Icon, file, onFile, capture }) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label} *</Label>
    <label
      htmlFor={id}
      className="flex items-center gap-3 rounded-lg border-2 border-dashed border-border p-4 cursor-pointer hover:border-primary/50 transition-colors"
    >
      <Icon className="text-muted-foreground" size={22} />
      <span className="text-sm text-muted-foreground truncate">
        {file ? file.name : 'Appuyez pour prendre ou importer le fichier'}
      </span>
      {file && <Check size={18} className="ml-auto text-primary" />}
    </label>
    <input
      id={id}
      type="file"
      accept={accept}
      capture={capture ? 'user' : undefined}
      className="hidden"
      onChange={(e) => onFile(e.target.files?.[0] ?? null)}
    />
  </div>
);

const PrestataireSignup: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('+226 ');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ville, setVille] = useState('');
  const [metier, setMetier] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [cnib, setCnib] = useState<File | null>(null);
  const [diplome, setDiplome] = useState<File | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formatPhone = (value: string) => {
    let cleaned = value.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+226')) cleaned = '+226' + cleaned.replace(/^\+?226?/, '');
    const digits = cleaned.slice(4).slice(0, 8);
    let formatted = '+226';
    for (let i = 0; i < digits.length; i += 2) formatted += ' ' + digits.slice(i, i + 2);
    return formatted;
  };

  const uploadDoc = async (userId: string, file: File, kind: string) => {
    const ext = file.name.split('.').pop();
    const path = `${userId}/${kind}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('prestataire-docs').upload(path, file);
    if (error) throw error;
    return path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan) return;

    const validation = schema.safeParse({ nom, prenom, telephone, email, ville });
    if (!validation.success) {
      toast({ title: 'Erreur de validation', description: validation.error.errors[0].message, variant: 'destructive' });
      return;
    }
    if (!photo || !cnib || (plan === 'certifie' && !diplome)) {
      toast({ title: 'Documents manquants', description: 'Veuillez joindre tous les documents demandés.', variant: 'destructive' });
      return;
    }
    if (!operator) {
      toast({ title: 'Paiement', description: 'Choisissez votre opérateur de paiement mobile.', variant: 'destructive' });
      return;
    }
    if (!isAuthenticated && password.length < 6) {
      toast({ title: 'Mot de passe', description: 'Minimum 6 caractères.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      let userId = user?.id ?? null;

      if (!userId) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/prestataire/inscription` },
        });
        if (signUpError) throw signUpError;

        if (!signUpData.session) {
          const { data: signInData } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
          userId = signInData?.user?.id ?? null;
        } else {
          userId = signUpData.user?.id ?? null;
        }

        if (!userId) {
          toast({
            title: 'Confirmez votre email',
            description: 'Votre compte est créé. Confirmez votre email puis revenez ici pour finaliser votre dossier.',
          });
          setIsLoading(false);
          return;
        }

        await supabase.from('profiles').insert({
          user_id: userId,
          nom: nom.trim(),
          prenoms: prenom.trim(),
          telephone: telephone.trim(),
          email: email.trim(),
        });
        await supabase.from('user_roles').insert({ user_id: userId, role: 'prestataire' });
      }

      const photoPath = await uploadDoc(userId, photo, 'visage');
      const cnibPath = await uploadDoc(userId, cnib, 'cnib');
      const diplomePath = diplome ? await uploadDoc(userId, diplome, 'diplome') : null;

      const { error: appError } = await supabase.from('prestataire_applications').insert({
        user_id: userId,
        nom: nom.trim(),
        prenom: prenom.trim(),
        telephone: telephone.trim(),
        email: email.trim(),
        ville,
        metier: metier || null,
        subscription_type: plan,
        amount: PLANS[plan].price,
        photo_visage_url: photoPath,
        cnib_url: cnibPath,
        diplome_url: diplomePath,
        payment_operator: operator,
        status: 'pending',
      });
      if (appError) throw appError;

      toast({
        title: 'Dossier envoyé',
        description: 'Votre inscription prestataire est en cours de validation.',
      });
      navigate('/profile');
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : "Échec de l'inscription",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-hero text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => (plan ? setPlan(null) : navigate('/auth'))}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Inscription Prestataire</h1>
            <p className="text-xs opacity-90">Abonnement 6 mois — soyez visible et contacté</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg space-y-4">
        {!plan ? (
          <>
            <h2 className="font-semibold">Choisissez votre formule</h2>
            {(Object.keys(PLANS) as Plan[]).map((key) => (
              <button key={key} type="button" className="w-full text-left" onClick={() => setPlan(key)}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        {key === 'certifie' ? <GraduationCap size={18} /> : <IdCard size={18} />}
                        {PLANS[key].label}
                      </CardTitle>
                      <Badge>{PLANS[key].price.toLocaleString('fr-FR')} FCFA</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{PLANS[key].description}</CardDescription>
                  </CardContent>
                </Card>
              </button>
            ))}
          </>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-lg">{PLANS[plan].label}</CardTitle>
                <Badge>{PLANS[plan].price.toLocaleString('fr-FR')} FCFA / 6 mois</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom *</Label>
                  <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom *</Label>
                  <Input id="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tel">Numéro de téléphone *</Label>
                  <Input id="tel" type="tel" value={telephone} onChange={(e) => setTelephone(formatPhone(e.target.value))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                {!isAuthenticated && (
                  <div className="space-y-2">
                    <Label htmlFor="pwd">Mot de passe *</Label>
                    <Input id="pwd" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <p className="text-xs text-muted-foreground">Minimum 6 caractères</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Ville *</Label>
                  <Select value={ville} onValueChange={setVille}>
                    <SelectTrigger><SelectValue placeholder="Choisir une ville" /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      {BURKINA_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Corps de métier</Label>
                  <Select value={metier} onValueChange={setMetier}>
                    <SelectTrigger><SelectValue placeholder="Choisir un métier" /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      {METIERS.map((m) => <SelectItem key={m.id} value={m.id}>{m.icon} {m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <FileField
                  id="photo"
                  label="Photo claire de votre visage"
                  accept="image/*"
                  icon={Camera}
                  file={photo}
                  onFile={setPhoto}
                  capture
                />

                {plan === 'certifie' && (
                  <FileField
                    id="diplome"
                    label="Diplôme (PDF)"
                    accept="application/pdf"
                    icon={FileText}
                    file={diplome}
                    onFile={setDiplome}
                  />
                )}

                <FileField
                  id="cnib"
                  label="Carte Nationale d'Identité Burkinabè (CNIB)"
                  accept="image/*,application/pdf"
                  icon={IdCard}
                  file={cnib}
                  onFile={setCnib}
                />

                <div className="space-y-2 pt-2">
                  <Label>Paiement de l'abonnement ({PLANS[plan].price.toLocaleString('fr-FR')} FCFA) *</Label>
                  <PaymentOperators value={operator} onChange={setOperator} />
                  <p className="text-xs text-muted-foreground">
                    Sélectionnez votre opérateur, puis effectuez le dépôt au numéro indiqué après validation du dossier.
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Envoi en cours...' : 'Valider mon inscription'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default PrestataireSignup;
