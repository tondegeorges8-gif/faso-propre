import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Recycle } from 'lucide-react';
import { BURKINA_CITIES } from '@/data/burkinaCities';
import { getQuartiers } from '@/data/burkinaQuartiers';
import { BURKINA_REGIONS, OCCASION_CATEGORIES } from '@/data/burkinaRegions';
import { HONEYPOT_NAME, checkRateLimit, isBotSubmission, sanitizeText, validatePhone, validateText } from '@/lib/antiSpam';

const AnnonceNew: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const startedAt = useRef(Date.now());
  const [honeypot, setHoneypot] = useState('');

  const [type, setType] = useState('vente');
  const [titre, setTitre] = useState('');
  const [categorie, setCategorie] = useState('');
  const [etat, setEtat] = useState('bon');
  const [prix, setPrix] = useState('');
  const [trocContre, setTrocContre] = useState('');
  const [ville, setVille] = useState('');
  const [quartier, setQuartier] = useState('');
  const [region, setRegion] = useState('');
  const [description, setDescription] = useState('');
  const [telephone, setTelephone] = useState(profile?.telephone ?? '');
  const [saving, setSaving] = useState(false);

  const quartiers = useMemo(() => (ville ? getQuartiers(ville) : []), [ville]);

  const submit = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (isBotSubmission({ [HONEYPOT_NAME]: honeypot }, startedAt.current)) {
      toast({ title: 'Envoi bloqué', description: 'Comportement suspect détecté.', variant: 'destructive' });
      return;
    }
    const errors = [
      validateText(titre, { min: 3, max: 100, label: 'Le titre' }),
      description ? validateText(description, { min: 5, max: 800, label: 'La description' }) : null,
      validatePhone(telephone),
      !categorie ? 'Choisissez une catégorie.' : null,
      !ville ? 'Choisissez une ville.' : null,
      type === 'vente' && (!prix || Number(prix) <= 0) ? 'Indiquez un prix valide.' : null,
      type === 'troc' && !trocContre.trim() ? 'Indiquez contre quoi vous souhaitez échanger.' : null,
    ].filter(Boolean) as string[];

    if (errors.length) {
      toast({ title: 'Formulaire incomplet', description: errors[0], variant: 'destructive' });
      return;
    }

    setSaving(true);
    const allowed = await checkRateLimit('annonce_occasion', 3, 900);
    if (!allowed) {
      setSaving(false);
      toast({ title: 'Limite atteinte', description: 'Maximum 3 annonces par 15 minutes.', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('annonces_occasion').insert({
      user_id: user.id,
      titre: sanitizeText(titre),
      description: description ? sanitizeText(description) : null,
      categorie,
      type_annonce: type,
      etat,
      prix: type === 'vente' ? Number(prix) : null,
      troc_contre: type === 'troc' ? sanitizeText(trocContre) : null,
      ville,
      quartier: quartier || null,
      region: region || null,
      contact_telephone: telephone.trim(),
    });
    setSaving(false);

    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Annonce publiée', description: 'Merci de contribuer au réemploi 🌱' });
    navigate('/faso-yaar');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="gradient-hero text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate('/faso-yaar')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Recycle size={20} /> Publier une annonce
            </h1>
            <p className="text-xs opacity-90">Troc et objets d'occasion — économie circulaire</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Honeypot anti-bot */}
            <input
              type="text"
              name={HONEYPOT_NAME}
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Type d'annonce</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vente">Vente</SelectItem>
                    <SelectItem value="troc">Troc / Échange</SelectItem>
                    <SelectItem value="don">Don</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>État</Label>
                <Select value={etat} onValueChange={setEtat}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neuf">Neuf</SelectItem>
                    <SelectItem value="tres_bon">Très bon</SelectItem>
                    <SelectItem value="bon">Bon</SelectItem>
                    <SelectItem value="a_reparer">À réparer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Titre *</Label>
              <Input maxLength={100} value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Ex : Réfrigérateur 150L en bon état" />
            </div>

            <div className="space-y-1">
              <Label>Catégorie *</Label>
              <Select value={categorie} onValueChange={setCategorie}>
                <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  {OCCASION_CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {type === 'vente' ? (
              <div className="space-y-1">
                <Label>Prix (FCFA) *</Label>
                <Input type="number" min={0} value={prix} onChange={(e) => setPrix(e.target.value)} />
              </div>
            ) : type === 'troc' ? (
              <div className="space-y-1">
                <Label>Échange contre *</Label>
                <Input maxLength={100} value={trocContre} onChange={(e) => setTrocContre(e.target.value)} placeholder="Ex : un ventilateur" />
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Ville *</Label>
                <Select value={ville} onValueChange={(v) => { setVille(v); setQuartier(''); }}>
                  <SelectTrigger><SelectValue placeholder="Ville" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {BURKINA_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Quartier</Label>
                <Select value={quartier} onValueChange={setQuartier} disabled={quartiers.length === 0}>
                  <SelectTrigger><SelectValue placeholder="Quartier" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {quartiers.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Région d'origine</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger><SelectValue placeholder="Région" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {BURKINA_REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea maxLength={800} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez l'objet, son état, son usage…" />
            </div>

            <div className="space-y-1">
              <Label>Téléphone de contact *</Label>
              <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="70 00 00 00" />
            </div>

            <Button className="w-full" onClick={submit} disabled={saving}>
              {saving ? 'Publication…' : 'Publier mon annonce'}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              Maximum 3 annonces par 15 minutes. Les contenus abusifs sont supprimés.
            </p>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default AnnonceNew;
