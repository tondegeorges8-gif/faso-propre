import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, MapPin, MessageCircle, Phone, Recycle, Repeat, User } from 'lucide-react';
import AnnonceCard, { AnnonceOccasion } from '@/components/marketplace/AnnonceCard';
import ImageLightbox from '@/components/marketplace/ImageLightbox';
import { OCCASION_CATEGORIES } from '@/data/burkinaRegions';

const ETAT_LABEL: Record<string, string> = {
  neuf: 'Neuf',
  tres_bon: 'Très bon état',
  bon: 'Bon état',
  occasion: 'Occasion',
  a_reparer: 'À réparer',
};

const cleanPhone = (p: string) => p.replace(/[^\d]/g, '');

const AnnonceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [annonce, setAnnonce] = useState<AnnonceOccasion | null>(null);
  const [autres, setAutres] = useState<AnnonceOccasion[]>([]);
  const [vendeur, setVendeur] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const { data } = await supabase.from('annonces_occasion').select('*').eq('id', id).maybeSingle();
      if (data) {
        const a = data as unknown as AnnonceOccasion;
        setAnnonce(a);
        const [{ data: others }, { data: prof }] = await Promise.all([
          supabase.from('annonces_occasion').select('*')
            .eq('user_id', a.user_id).eq('is_active', true).neq('id', a.id)
            .order('created_at', { ascending: false }).limit(6),
          supabase.from('profiles').select('nom, prenoms').eq('user_id', a.user_id).maybeSingle(),
        ]);
        setAutres((others || []) as unknown as AnnonceOccasion[]);
        if (prof) setVendeur(`${(prof as { prenoms: string }).prenoms} ${(prof as { nom: string }).nom}`);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const waNumber = annonce?.contact_telephone;
  const openWhatsApp = () => {
    if (!waNumber || !annonce) return;
    let num = cleanPhone(waNumber);
    if (num.length === 8) num = `226${num}`;
    const msg = `Bonjour, je suis intéressé(e) par votre annonce "${annonce.titre}" vue sur Faso Propre (FASO YAAR).`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!annonce) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <main className="container mx-auto px-4 py-12 text-center space-y-3">
          <Recycle className="mx-auto text-muted-foreground" size={32} />
          <p className="text-muted-foreground">Cette annonce n'existe plus.</p>
          <Button onClick={() => navigate('/faso-yaar')}>Retour au marché</Button>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  const isTroc = annonce.type_annonce === 'troc';
  const categorie = OCCASION_CATEGORIES.find((c) => c.id === annonce.categorie);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="gradient-hero text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-lg font-bold truncate">{annonce.titre}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 space-y-4">
        <button
          type="button"
          className="w-full rounded-xl overflow-hidden bg-muted aspect-square flex items-center justify-center"
          onClick={() => annonce.photo_url && setLightbox(true)}
        >
          {annonce.photo_url ? (
            <img src={annonce.photo_url} alt={annonce.titre} className="w-full h-full object-cover" />
          ) : (
            <Recycle className="text-muted-foreground" size={40} />
          )}
        </button>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-bold leading-tight">{annonce.titre}</h2>
              <Badge variant={isTroc ? 'secondary' : 'default'} className="shrink-0">
                {annonce.type_annonce === 'don' ? 'Don' : isTroc ? 'Troc' : 'Vente'}
              </Badge>
            </div>

            {isTroc ? (
              <p className="text-sm flex items-center gap-2 text-primary font-semibold">
                <Repeat size={16} /> Échange contre : {annonce.troc_contre || 'à discuter'}
              </p>
            ) : annonce.type_annonce === 'don' ? (
              <p className="text-2xl font-bold text-primary">Gratuit</p>
            ) : (
              <p className="text-2xl font-bold text-primary">{(annonce.prix ?? 0).toLocaleString('fr-FR')} FCFA</p>
            )}

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{ETAT_LABEL[annonce.etat] ?? annonce.etat}</Badge>
              {categorie && <Badge variant="outline">{categorie.icon} {categorie.name}</Badge>}
              {annonce.region && <Badge variant="outline">Origine : {annonce.region}</Badge>}
            </div>

            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin size={14} /> {annonce.quartier ? `${annonce.quartier}, ` : ''}{annonce.ville}
            </p>

            {annonce.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-line">{annonce.description}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <User size={18} className="text-primary" />
              <span className="font-semibold">{vendeur ?? 'Vendeur'}</span>
            </div>
            <Button className="w-full" size="lg" disabled={!waNumber} onClick={openWhatsApp}>
              <MessageCircle size={18} className="mr-2" /> DISCUTER SUR WHATSAPP
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(`/messages?seller=${annonce.user_id}&type=annonce&id=${annonce.id}&subject=${encodeURIComponent(annonce.titre)}`)}
            >
              Message dans l'application
            </Button>
            {annonce.contact_telephone && (
              <Button variant="ghost" className="w-full" onClick={() => window.open(`tel:${annonce.contact_telephone}`)}>
                <Phone size={16} className="mr-2" /> {annonce.contact_telephone}
              </Button>
            )}
          </CardContent>
        </Card>

        {autres.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-semibold">Autres annonces de ce vendeur</h2>
            <div className="space-y-3">
              {autres.map((a) => <AnnonceCard key={a.id} annonce={a} />)}
            </div>
          </section>
        )}
      </main>

      <ImageLightbox
        src={annonce.photo_url}
        alt={annonce.titre}
        open={lightbox}
        onOpenChange={setLightbox}
      />

      <BottomNavigation />
    </div>
  );
};

export default AnnonceDetail;
