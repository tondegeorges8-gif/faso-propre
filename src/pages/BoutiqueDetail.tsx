import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, MapPin, MessageCircle, Package, Phone, Store } from 'lucide-react';
import { useSignedUrls } from '@/hooks/useSignedUrl';
import { MARKETPLACE_BUCKET } from '@/components/marketplace/PhotoUploader';
import AvisSection from '@/components/marketplace/AvisSection';

interface BoutiqueRow {
  id: string; nom: string; categorie: string; ville: string; quartier: string | null;
  adresse: string | null; description: string | null; telephone: string | null;
  whatsapp: string | null; logo_url: string | null; owner_user_id: string | null;
  is_verified: boolean; is_partner: boolean;
}
interface ArticleRow {
  id: string; nom: string; prix: number; photos: string[] | null; photo_url: string | null;
  type_annonce: string; visibility: string;
}

const cleanPhone = (p: string) => p.replace(/[^\d]/g, '');

const BoutiqueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [boutique, setBoutique] = useState<BoutiqueRow | null>(null);
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const { data } = await supabase.from('boutiques').select('*').eq('id', id).maybeSingle();
      setBoutique((data as unknown as BoutiqueRow) ?? null);
      const { data: arts } = await supabase
        .from('articles')
        .select('id, nom, prix, photos, photo_url, type_annonce, visibility')
        .eq('boutique_id', id)
        .eq('is_available', true)
        .order('created_at', { ascending: false });
      setArticles((arts || []) as unknown as ArticleRow[]);
      setLoading(false);
      supabase.rpc('track_boutique_visit', { _boutique_id: id });
    };
    load();
  }, [id]);

  const urls = useSignedUrls(MARKETPLACE_BUCKET, articles.map((a) => a.photos?.[0] ?? a.photo_url));

  const waNumber = boutique?.whatsapp || boutique?.telephone;
  const openWhatsApp = () => {
    if (!waNumber || !boutique) return;
    let num = cleanPhone(waNumber);
    if (num.length === 8) num = `226${num}`;
    const msg = `Bonjour, je vous contacte au sujet de votre boutique "${boutique.nom}" sur Faso Propre (FASO YAAR).`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!boutique) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <main className="container mx-auto px-4 py-12 text-center space-y-3">
          <Store className="mx-auto text-muted-foreground" size={32} />
          <p className="text-muted-foreground">Cette boutique n'existe plus.</p>
          <Button onClick={() => navigate('/faso-yaar')}>Retour au marché</Button>
        </main>
        <BottomNavigation />
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
          <div>
            <h1 className="text-lg font-bold truncate">{boutique.nom}</h1>
            <p className="text-xs opacity-90 flex items-center gap-1">
              <MapPin size={12} /> {boutique.quartier ? `${boutique.quartier}, ` : ''}{boutique.ville}
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 space-y-4">
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex gap-3 items-center">
              <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden flex items-center justify-center shrink-0">
                {boutique.logo_url
                  ? <img src={boutique.logo_url} alt={boutique.nom} className="w-full h-full object-cover" />
                  : <Store className="text-muted-foreground" size={24} />}
              </div>
              <div className="flex-1">
                <h2 className="font-bold">{boutique.nom}</h2>
                {(boutique.is_verified || boutique.is_partner) && (
                  <Badge className="mt-1">{boutique.is_partner ? 'Partenaire' : 'Vérifié'}</Badge>
                )}
              </div>
            </div>
            {boutique.description && <p className="text-sm text-muted-foreground">{boutique.description}</p>}
            {boutique.adresse && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin size={14} /> {boutique.adresse}</p>}

            <div className="grid grid-cols-1 gap-2">
              <Button className="w-full" disabled={!waNumber} onClick={openWhatsApp}>
                <MessageCircle size={16} className="mr-2" /> Discuter sur WhatsApp
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={!boutique.owner_user_id}
                onClick={() => navigate(`/messages?seller=${boutique.owner_user_id}&type=boutique&id=${boutique.id}&subject=${encodeURIComponent(boutique.nom)}`)}
              >
                Discuter dans la messagerie
              </Button>
              {boutique.telephone && (
                <Button variant="ghost" className="w-full" onClick={() => window.open(`tel:${boutique.telephone}`)}>
                  <Phone size={16} className="mr-2" /> {boutique.telephone}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <h2 className="font-semibold">Produits de la boutique ({articles.length})</h2>
        {articles.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Aucun produit publié pour le moment.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {articles.map((a) => {
              const cover = a.photos?.[0] ?? a.photo_url;
              return (
                <Card key={a.id} className="overflow-hidden cursor-pointer" onClick={() => navigate(`/produit/${a.id}`)}>
                  <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                    {cover && urls[cover]
                      ? <img src={urls[cover]} alt={a.nom} loading="lazy" className="w-full h-full object-cover" />
                      : <Package className="text-muted-foreground" size={28} />}
                  </div>
                  <CardContent className="p-3 space-y-1">
                    <p className="text-sm font-medium line-clamp-2">{a.nom}</p>
                    <p className="text-sm font-bold text-primary">
                      {a.type_annonce === 'troc' ? 'Troc' : `${Number(a.prix).toLocaleString('fr-FR')} FCFA`}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <AvisSection targetType="boutique" targetId={boutique.id} />
      </main>

      <BottomNavigation />
    </div>
  );
};

export default BoutiqueDetail;
