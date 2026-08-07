import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import PhotoUploader from '@/components/marketplace/PhotoUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Megaphone, PackagePlus, Store } from 'lucide-react';
import { ARTICLE_CATEGORIES, BURKINA_REGIONS } from '@/data/burkinaRegions';
import { checkRateLimit, sanitizeText, validateText } from '@/lib/antiSpam';

interface Boutique { id: string; nom: string }

const ETATS = [
  { id: 'neuf', name: 'Neuf' },
  { id: 'tres_bon', name: 'Très bon état' },
  { id: 'bon', name: 'Bon état' },
  { id: 'occasion', name: 'Occasion' },
  { id: 'a_reparer', name: 'À réparer' },
];

const ArticleNew: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, isLoading } = useAuth();

  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const [boutiqueId, setBoutiqueId] = useState(params.get('boutique') ?? '');
  const [type, setType] = useState('vente');
  const [etat, setEtat] = useState('neuf');
  const [nom, setNom] = useState('');
  const [categorie, setCategorie] = useState('');
  const [prix, setPrix] = useState('');
  const [trocContre, setTrocContre] = useState('');
  const [region, setRegion] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) navigate('/auth');
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('boutiques')
      .select('id, nom')
      .eq('owner_user_id', user.id)
      .then(({ data }) => {
        const list = (data || []) as Boutique[];
        setBoutiques(list);
        if (list.length && !boutiqueId) setBoutiqueId(list[0].id);
        setLoadingShops(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const submit = async () => {
    const nomError = validateText(nom, { min: 3, max: 100, label: 'Le titre du produit' });
    if (!boutiqueId) return toast({ title: 'Boutique requise', description: 'Choisissez la boutique du produit.', variant: 'destructive' });
    if (nomError) return toast({ title: 'Titre invalide', description: nomError, variant: 'destructive' });
    if (!categorie) return toast({ title: 'Catégorie requise', description: 'Choisissez une catégorie.', variant: 'destructive' });
    if (photos.length === 0) return toast({ title: 'Photo obligatoire', description: 'Ajoutez au moins une photo du matériel.', variant: 'destructive' });
    if (type === 'vente' && (!prix || Number(prix) <= 0)) return toast({ title: 'Prix requis', description: 'Indiquez le prix de vente.', variant: 'destructive' });
    if (type === 'troc' && !trocContre.trim()) return toast({ title: 'Échange requis', description: 'Indiquez ce que vous souhaitez en échange.', variant: 'destructive' });

    setSaving(true);
    const allowed = await checkRateLimit('article_create', 10, 900);
    if (!allowed) {
      setSaving(false);
      return toast({ title: 'Trop de publications', description: 'Patientez quelques minutes.', variant: 'destructive' });
    }

    const { data, error } = await supabase
      .from('articles')
      .insert({
        boutique_id: boutiqueId,
        owner_user_id: user!.id,
        nom: sanitizeText(nom),
        description: description ? sanitizeText(description) : null,
        categorie,
        region: region || null,
        prix: type === 'vente' ? Number(prix) : 0,
        type_annonce: type,
        etat,
        troc_contre: type === 'troc' ? sanitizeText(trocContre) : null,
        photos,
        photo_url: photos[0],
        is_available: true,
      })
      .select('id')
      .single();

    setSaving(false);
    if (error || !data) {
      return toast({ title: 'Erreur', description: error?.message ?? 'Publication impossible', variant: 'destructive' });
    }
    setCreatedId(data.id);
    toast({ title: 'Produit publié 🎉', description: 'Il est visible par tous les clients de FASO YAAR.' });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="gradient-hero text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate('/faso-yaar')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2"><PackagePlus size={20} /> Vendre / Troquer</h1>
            <p className="text-xs opacity-90">Publiez un produit dans votre boutique</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-4">
        {createdId ? (
          <Card>
            <CardContent className="py-8 space-y-4 text-center">
              <PackagePlus className="mx-auto text-primary" size={40} />
              <p className="font-semibold">Produit en ligne</p>
              <div className="grid gap-2">
                <Button onClick={() => navigate(`/produit/${createdId}`)}>Voir la fiche produit</Button>
                <Button variant="outline" onClick={() => navigate(`/abonnement-pub?boutique=${boutiqueId}&article=${createdId}`)}>
                  <Megaphone size={16} className="mr-1" /> Booster ce produit
                </Button>
                <Button variant="ghost" onClick={() => navigate('/faso-yaar')}>Retour au marché</Button>
              </div>
            </CardContent>
          </Card>
        ) : loadingShops ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : boutiques.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 flex flex-col items-center text-center gap-3">
              <Store className="text-muted-foreground" size={32} />
              <p className="font-semibold">Vous n'avez pas encore de boutique</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                La création d'une boutique est obligatoire avant de publier un produit en vente ou en troc.
              </p>
              <Button onClick={() => navigate('/boutique/nouvelle')}>
                <Store size={16} className="mr-1" /> Créer une boutique
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-lg">Détails du produit</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Boutique *</Label>
                <Select value={boutiqueId} onValueChange={setBoutiqueId}>
                  <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                  <SelectContent>
                    {boutiques.map((b) => <SelectItem key={b.id} value={b.id}>{b.nom}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Type d'annonce *</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vente">Vente</SelectItem>
                      <SelectItem value="troc">Troc / Échange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>État du matériel *</Label>
                  <Select value={etat} onValueChange={setEtat}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ETATS.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Titre du produit *</Label>
                <Input maxLength={100} value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex : Réfrigérateur 150L" />
              </div>

              <div className="space-y-1">
                <Label>Catégorie *</Label>
                <Select value={categorie} onValueChange={setCategorie}>
                  <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {ARTICLE_CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {type === 'vente' ? (
                <div className="space-y-1">
                  <Label>Prix (FCFA) *</Label>
                  <Input type="number" min={0} value={prix} onChange={(e) => setPrix(e.target.value)} />
                </div>
              ) : (
                <div className="space-y-1">
                  <Label>Échange contre *</Label>
                  <Input maxLength={100} value={trocContre} onChange={(e) => setTrocContre(e.target.value)} placeholder="Ex : un ventilateur" />
                </div>
              )}

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
                <Label>Description / Qualité</Label>
                <Textarea maxLength={800} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez le produit, sa qualité, son usage…" />
              </div>

              <div className="space-y-1">
                <Label>Photos du matériel *</Label>
                {user && <PhotoUploader userId={user.id} value={photos} onChange={setPhotos} />}
              </div>

              <Button className="w-full" onClick={submit} disabled={saving}>
                {saving ? 'Publication…' : 'Publier le produit'}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default ArticleNew;
