import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Megaphone, Store } from 'lucide-react';
import { BOUTIQUE_CATEGORIES } from '@/data/boutiqueCategories';
import { BURKINA_CITIES } from '@/data/burkinaCities';
import { getQuartiers } from '@/data/burkinaQuartiers';
import { BURKINA_REGIONS } from '@/data/burkinaRegions';
import { sanitizeText, validatePhone, validateText, checkRateLimit } from '@/lib/antiSpam';

const BoutiqueNew: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading } = useAuth();

  const [nom, setNom] = useState('');
  const [categorie, setCategorie] = useState('');
  const [ville, setVille] = useState('');
  const [quartier, setQuartier] = useState('');
  const [region, setRegion] = useState('');
  const [adresse, setAdresse] = useState('');
  const [telephone, setTelephone] = useState(profile?.telephone ?? '');
  const [whatsapp, setWhatsapp] = useState('');
  const [description, setDescription] = useState('');
  const [produits, setProduits] = useState('');
  const [saving, setSaving] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) navigate('/auth');
  }, [user, isLoading, navigate]);

  const quartiers = ville ? getQuartiers(ville) : [];

  const submit = async () => {
    const nomError = validateText(nom, { min: 3, max: 80, label: 'Le nom de la boutique' });
    const phoneError = validatePhone(telephone);
    if (nomError) return toast({ title: 'Nom de boutique invalide', description: nomError, variant: 'destructive' });
    if (!categorie) return toast({ title: 'Corps de métier requis', description: 'Choisissez le secteur de votre boutique.', variant: 'destructive' });
    if (!ville) return toast({ title: 'Ville requise', description: 'Indiquez la ville de votre boutique.', variant: 'destructive' });
    if (phoneError) return toast({ title: 'Téléphone invalide', description: phoneError, variant: 'destructive' });

    setSaving(true);
    const allowed = await checkRateLimit('boutique_create', 3, 900);
    if (!allowed) {
      setSaving(false);
      return toast({ title: 'Trop de tentatives', description: 'Patientez avant de créer une autre boutique.', variant: 'destructive' });
    }

    const { data, error } = await supabase
      .from('boutiques')
      .insert({
        owner_user_id: user!.id,
        nom: sanitizeText(nom),
        categorie,
        ville,
        quartier: quartier || null,
        region: region || null,
        adresse: adresse ? sanitizeText(adresse) : null,
        telephone: telephone.trim(),
        whatsapp: (whatsapp || telephone).trim(),
        description: description ? sanitizeText(description) : null,
        produits: produits ? sanitizeText(produits) : null,
        is_active: true,
      })
      .select('id')
      .single();

    setSaving(false);
    if (error || !data) {
      return toast({ title: 'Erreur', description: error?.message ?? 'Création impossible', variant: 'destructive' });
    }
    setCreatedId(data.id);
    toast({ title: 'Boutique créée 🎉', description: 'Vous pouvez maintenant publier vos produits.' });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="gradient-hero text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate('/faso-yaar')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2"><Store size={20} /> Créer ma boutique</h1>
            <p className="text-xs opacity-90">Indispensable avant de publier vos produits</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-4">
        {createdId ? (
          <Card>
            <CardContent className="py-8 space-y-4 text-center">
              <Store className="mx-auto text-primary" size={40} />
              <p className="font-semibold">Votre boutique est en ligne</p>
              <p className="text-sm text-muted-foreground">
                Souhaitez-vous la booster dans l'Espace Pub pour être vue en priorité ? C'est optionnel.
              </p>
              <div className="grid gap-2">
                <Button onClick={() => navigate(`/abonnement-pub?boutique=${createdId}`)}>
                  <Megaphone size={16} className="mr-1" /> Booster dans l'Espace Pub
                </Button>
                <Button variant="outline" onClick={() => navigate(`/produit/nouveau?boutique=${createdId}`)}>
                  Publier un premier produit
                </Button>
                <Button variant="ghost" onClick={() => navigate('/faso-yaar')}>Plus tard</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-lg">Informations de la boutique</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Nom de la boutique *</Label>
                <Input maxLength={80} value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex : Quincaillerie Wend-Kuuni" />
              </div>

              <div className="space-y-1">
                <Label>Secteur / Corps de métier *</Label>
                <Select value={categorie} onValueChange={setCategorie}>
                  <SelectTrigger><SelectValue placeholder="Choisir un corps de métier" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {BOUTIQUE_CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                <Label>Région</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger><SelectValue placeholder="Région" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {BURKINA_REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Adresse / Repère</Label>
                <Input maxLength={120} value={adresse} onChange={(e) => setAdresse(e.target.value)} placeholder="Ex : face au marché de Gounghin" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Téléphone *</Label>
                  <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="70 00 00 00" />
                </div>
                <div className="space-y-1">
                  <Label>WhatsApp</Label>
                  <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Idem si vide" />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Produits / Services proposés</Label>
                <Input maxLength={150} value={produits} onChange={(e) => setProduits(e.target.value)} placeholder="Ex : ciment, fer, peinture" />
              </div>

              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea maxLength={600} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Présentez votre boutique en quelques mots…" />
              </div>

              <Button className="w-full" onClick={submit} disabled={saving}>
                {saving ? 'Création…' : 'Créer ma boutique'}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default BoutiqueNew;
