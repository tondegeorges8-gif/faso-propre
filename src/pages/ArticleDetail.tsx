import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, MapPin, MessageCircle, Package, Repeat, Store } from 'lucide-react';
import { useSignedUrls } from '@/hooks/useSignedUrl';
import { MARKETPLACE_BUCKET } from '@/components/marketplace/PhotoUploader';
import { ARTICLE_CATEGORIES } from '@/data/burkinaRegions';
import AvisSection from '@/components/marketplace/AvisSection';
import VariantSheet from '@/components/marketplace/VariantSheet';
import { useCart, type ArticleVariant } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const ETAT_LABEL: Record<string, string> = {
  neuf: 'Neuf',
  tres_bon: 'Très bon état',
  bon: 'Bon état',
  occasion: 'Occasion',
  a_reparer: 'À réparer',
};

interface ArticleDetailData {
  id: string;
  nom: string;
  description: string | null;
  categorie: string;
  region: string | null;
  prix: number;
  photos: string[] | null;
  photo_url: string | null;
  type_annonce: string;
  etat: string;
  troc_contre: string | null;
  boutique_id: string;
  owner_user_id: string;
  variants?: unknown;
}

interface BoutiqueInfo {
  id: string; nom: string; ville: string; quartier: string | null;
  telephone: string | null; whatsapp: string | null; categorie: string;
}

const cleanPhone = (p: string) => p.replace(/[^\d]/g, '');

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ArticleDetailData | null>(null);
  const [boutique, setBoutique] = useState<BoutiqueInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [variantOpen, setVariantOpen] = useState(false);
  const { user } = useAuth();
  const { addToCart } = useCart();

  const variants: ArticleVariant[] = Array.isArray(article?.variants)
    ? (article!.variants as Array<{ label?: string; prix?: number }>)
        .filter((v) => typeof v?.label === 'string')
        .map((v) => ({ label: v.label as string, prix: Number(v.prix ?? article!.prix) }))
    : [];

  const handleAdd = async (variant: ArticleVariant | null) => {
    if (!user) { navigate('/auth'); return; }
    if (!article) return;
    try {
      await addToCart(article.id, 1, variant);
      setVariantOpen(false);
      toast({ title: 'Ajouté au panier', description: article.nom });
    } catch (e) {
      toast({ title: 'Erreur', description: (e as Error).message, variant: 'destructive' });
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const { data } = await supabase.from('articles').select('*').eq('id', id).maybeSingle();
      if (data) {
        setArticle(data as unknown as ArticleDetailData);
        const { data: b } = await supabase
          .from('boutiques')
          .select('id, nom, ville, quartier, telephone, whatsapp, categorie')
          .eq('id', (data as { boutique_id: string }).boutique_id)
          .maybeSingle();
        if (b) setBoutique(b as BoutiqueInfo);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const paths = (article?.photos?.length ? article.photos : [article?.photo_url]).filter(Boolean) as string[];
  const urls = useSignedUrls(MARKETPLACE_BUCKET, paths);
  const categorie = ARTICLE_CATEGORIES.find((c) => c.id === article?.categorie);

  const waNumber = boutique?.whatsapp || boutique?.telephone;
  const openWhatsApp = () => {
    if (!waNumber || !article) return;
    let num = cleanPhone(waNumber);
    if (num.length === 8) num = `226${num}`;
    const msg = `Bonjour, je suis intéressé(e) par votre produit "${article.nom}" vu sur Faso Propre (FASO YAAR).`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <main className="container mx-auto px-4 py-12 text-center space-y-3">
          <Package className="mx-auto text-muted-foreground" size={32} />
          <p className="text-muted-foreground">Ce produit n'existe plus.</p>
          <Button onClick={() => navigate('/faso-yaar')}>Retour au marché</Button>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-40">
      <header className="gradient-hero text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-lg font-bold truncate">{article.nom}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 space-y-4">
        <div className="rounded-xl overflow-hidden bg-muted aspect-square flex items-center justify-center">
          {urls[paths[active]] ? (
            <img src={urls[paths[active]]} alt={article.nom} className="w-full h-full object-cover" />
          ) : (
            <Package className="text-muted-foreground" size={40} />
          )}
        </div>

        {paths.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {paths.map((p, i) => (
              <button key={p} onClick={() => setActive(i)} className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 ${i === active ? 'border-primary' : 'border-transparent'}`}>
                {urls[p] && <img src={urls[p]} alt={`${article.nom} ${i + 1}`} className="w-full h-full object-cover" />}
              </button>
            ))}
          </div>
        )}

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-lg font-bold leading-tight">{article.nom}</h2>
                {boutique && (
                  <button type="button" onClick={() => navigate(`/boutique/${boutique.id}`)} className="text-xs text-primary font-medium underline-offset-2 hover:underline">
                    {boutique.nom}
                  </button>
                )}
              </div>
              <Badge variant={article.type_annonce === 'troc' ? 'secondary' : 'default'} className="shrink-0">
                {article.type_annonce === 'troc' ? 'Troc' : 'Vente'}
              </Badge>
            </div>

            {article.type_annonce === 'troc' ? (
              <p className="text-sm flex items-center gap-2 text-primary font-semibold">
                <Repeat size={16} /> Échange contre : {article.troc_contre}
              </p>
            ) : (
              <p className="text-2xl font-bold text-primary">{Number(article.prix).toLocaleString('fr-FR')} FCFA</p>
            )}

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{ETAT_LABEL[article.etat] ?? article.etat}</Badge>
              {categorie && <Badge variant="outline">{categorie.icon} {categorie.name}</Badge>}
              {article.region && <Badge variant="outline">Origine : {article.region}</Badge>}
            </div>

            {article.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-line">{article.description}</p>
            )}
          </CardContent>
        </Card>

        {boutique && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Store size={18} className="text-primary" />
                <span className="font-semibold">{boutique.nom}</span>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin size={14} /> {boutique.quartier ? `${boutique.quartier}, ` : ''}{boutique.ville}
              </p>
              <Button className="w-full" size="lg" disabled={!waNumber} onClick={openWhatsApp}>
                <MessageCircle size={18} className="mr-2" />
                DISCUTER AVEC LE MARCHAND
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/messages?seller=${article.owner_user_id}&type=article&id=${article.id}&subject=${encodeURIComponent(article.nom)}`)}
              >
                Message dans l'application
              </Button>
            </CardContent>
          </Card>
        )}

        <AvisSection targetType="article" targetId={article.id} />
      </main>

      {article.type_annonce !== 'troc' && (
        <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border bg-card px-4 py-3 grid grid-cols-2 gap-2">
          <Button variant="outline" size="lg" onClick={() => setVariantOpen(true)}>CHOISIR</Button>
          <Button size="lg" onClick={() => navigate('/panier')}>COMMANDER</Button>
        </div>
      )}

      <VariantSheet
        open={variantOpen}
        onOpenChange={setVariantOpen}
        variants={variants}
        onAdd={handleAdd}
        basePrice={Number(article.prix)}
        productName={article.nom}
      />

      <BottomNavigation />
    </div>
  );
};

export default ArticleDetail;
