import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Eye, MapPin, Megaphone, Package, Plus, Store, Trash2 } from 'lucide-react';
import { useSignedUrls } from '@/hooks/useSignedUrl';
import { MARKETPLACE_BUCKET } from '@/components/marketplace/PhotoUploader';

interface BoutiqueRow {
  id: string; nom: string; categorie: string; ville: string; quartier: string | null;
  telephone: string | null; whatsapp: string | null; visits_count: number;
}
interface ArticleRow {
  id: string; nom: string; prix: number; photos: string[] | null; photo_url: string | null;
  visibility: string; views_count: number; clicks_count: number; boosted_until: string | null;
  type_annonce: string; is_available: boolean;
}
interface AnnonceRow {
  id: string; titre: string; prix: number | null; visibility: string;
  views_count: number; clicks_count: number; type_annonce: string; is_active: boolean;
}

const MaBoutique: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [boutique, setBoutique] = useState<BoutiqueRow | null>(null);
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [annonces, setAnnonces] = useState<AnnonceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data: b } = await supabase
      .from('boutiques')
      .select('id, nom, categorie, ville, quartier, telephone, whatsapp, visits_count')
      .eq('owner_user_id', user.id)
      .maybeSingle();
    setBoutique((b as BoutiqueRow) ?? null);

    const { data: a } = await supabase
      .from('articles')
      .select('id, nom, prix, photos, photo_url, visibility, views_count, clicks_count, boosted_until, type_annonce, is_available')
      .eq('owner_user_id', user.id)
      .order('created_at', { ascending: false });
    setArticles((a || []) as unknown as ArticleRow[]);

    const { data: an } = await supabase
      .from('annonces_occasion')
      .select('id, titre, prix, visibility, views_count, clicks_count, type_annonce, is_active')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setAnnonces((an || []) as unknown as AnnonceRow[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const covers = articles.map((a) => a.photos?.[0] ?? a.photo_url);
  const urls = useSignedUrls(MARKETPLACE_BUCKET, covers);

  const removeArticle = async (id: string) => {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) return toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    toast({ title: 'Produit supprimé' });
    load();
  };

  const removeAnnonce = async (id: string) => {
    const { error } = await supabase.from('annonces_occasion').delete().eq('id', id);
    if (error) return toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    toast({ title: 'Annonce supprimée' });
    load();
  };

  const visibilityBadge = (v: string) =>
    v === 'boosted'
      ? <Badge className="text-[10px]">En cours de diffusion</Badge>
      : <Badge variant="secondary" className="text-[10px]">Visibilité limitée</Badge>;

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="gradient-hero text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-lg font-bold">Ma boutique</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 space-y-4">
        {!boutique ? (
          <Card className="border-dashed">
            <CardContent className="py-10 flex flex-col items-center text-center gap-3">
              <Store className="text-muted-foreground" size={28} />
              <p className="text-muted-foreground">Vous n'avez pas encore de boutique.</p>
              <Button onClick={() => navigate('/boutique/nouvelle')}>Créer ma boutique</Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-bold text-lg">{boutique.nom}</h2>
                <Badge variant="outline" className="gap-1"><Eye size={12} /> {boutique.visits_count} visites</Badge>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin size={14} /> {boutique.quartier ? `${boutique.quartier}, ` : ''}{boutique.ville}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => navigate(`/boutique/${boutique.id}`)}>
                  Voir la vitrine publique
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/espace-pub')}>
                  <Megaphone size={14} className="mr-1" /> Espace pub
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Mes produits ({articles.length})</h2>
          <Button size="sm" onClick={() => navigate('/produit/nouveau')}><Plus size={14} className="mr-1" /> Ajouter</Button>
        </div>

        {articles.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun produit publié.</p>
        ) : (
          <div className="space-y-3">
            {articles.map((a) => {
              const cover = a.photos?.[0] ?? a.photo_url;
              return (
                <Card key={a.id}>
                  <CardContent className="p-3 flex gap-3">
                    <button className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0" onClick={() => navigate(`/produit/${a.id}`)}>
                      {cover && urls[cover]
                        ? <img src={urls[cover]} alt={a.nom} className="w-full h-full object-cover" />
                        : <Package className="text-muted-foreground m-auto" size={20} />}
                    </button>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="font-medium text-sm line-clamp-1">{a.nom}</p>
                      <p className="text-sm text-primary font-semibold">
                        {a.type_annonce === 'troc' ? 'Troc' : `${Number(a.prix).toLocaleString('fr-FR')} FCFA`}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        {visibilityBadge(a.visibility)}
                        <span className="text-[11px] text-muted-foreground">{a.views_count} vues · {a.clicks_count} clics</span>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" variant="outline" onClick={() => navigate(`/abonnement-pub?type=article&id=${a.id}`)}>
                          <Megaphone size={13} className="mr-1" /> Booster
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeArticle(a.id)}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <h2 className="font-semibold">Mes annonces Vente / Troc ({annonces.length})</h2>
          <Button size="sm" variant="outline" onClick={() => navigate('/annonces/nouvelle')}><Plus size={14} className="mr-1" /> Ajouter</Button>
        </div>

        {annonces.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune annonce publiée.</p>
        ) : (
          <div className="space-y-3">
            {annonces.map((an) => (
              <Card key={an.id}>
                <CardContent className="p-3 space-y-1">
                  <p className="font-medium text-sm">{an.titre}</p>
                  <p className="text-sm text-primary font-semibold">
                    {an.type_annonce === 'troc' ? 'Troc' : `${Number(an.prix ?? 0).toLocaleString('fr-FR')} FCFA`}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {visibilityBadge(an.visibility)}
                    <span className="text-[11px] text-muted-foreground">{an.views_count} vues · {an.clicks_count} clics</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeAnnonce(an.id)}>
                      <Trash2 size={13} className="mr-1" /> Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default MaBoutique;
