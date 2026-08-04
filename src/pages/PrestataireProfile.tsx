import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Phone, MessageCircle, MapPin, BadgeCheck, Navigation, Star } from 'lucide-react';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { AvailabilityDot } from '@/components/prestataires/PrestataireCard';
import { getMetierIcon, getMetierName } from '@/data/metiers';
import { haversineKm, formatDistance, type Prestataire } from '@/hooks/usePrestataires';
import { useUserPosition } from '@/hooks/useUserPosition';

const PrestataireProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prestataire, setPrestataire] = useState<Prestataire | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { position, isLocating, locate } = useUserPosition();

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const { data } = await supabase.from('prestataires').select('*').eq('id', id).maybeSingle();
      setPrestataire((data as Prestataire) ?? null);
      setIsLoading(false);
    };
    load();
  }, [id]);

  const distance =
    position && prestataire?.latitude != null && prestataire?.longitude != null
      ? haversineKm(position.lat, position.lng, prestataire.latitude, prestataire.longitude)
      : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Chargement...
      </div>
    );
  }

  if (!prestataire) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-muted-foreground">Prestataire introuvable.</p>
        <Button onClick={() => navigate('/prestataires')}>Retour à l'annuaire</Button>
      </div>
    );
  }

  const p = prestataire;
  const initials = `${p.prenoms?.[0] ?? ''}${p.nom?.[0] ?? ''}`.toUpperCase();
  const tel = p.telephone.replace(/\s/g, '');
  const wa = (p.whatsapp || p.telephone).replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="gradient-hero text-primary-foreground px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-white/10"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-lg font-bold flex-1">Fiche prestataire</h1>
        </div>

        <div className="flex items-center gap-3">
          <Avatar className="h-20 w-20 border-2 border-white/40">
            <AvatarImage src={p.photo_url ?? undefined} alt={`${p.prenoms} ${p.nom}`} />
            <AvatarFallback className="bg-white/20 text-primary-foreground text-xl font-semibold">
              {initials || '👤'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="text-xl font-bold truncate">
              {p.prenoms} {p.nom}
            </h2>
            <p className="text-sm opacity-90">
              {getMetierIcon(p.metier)} {getMetierName(p.metier)}
            </p>
            {p.is_verified && (
              <Badge variant="secondary" className="mt-1 gap-1 text-xs">
                <BadgeCheck size={12} className="text-primary" /> Vérifié
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        <Card className="shadow-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Statut</span>
              <AvailabilityDot available={p.is_available} />
            </div>

            {p.specialite && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">Spécialité</span>
                <span className="text-sm text-muted-foreground text-right">{p.specialite}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">Localisation</span>
              <span className="text-sm text-muted-foreground text-right flex items-center gap-1">
                <MapPin size={14} />
                {[p.quartier, p.ville].filter(Boolean).join(' · ')}
              </span>
            </div>

            {p.rating != null && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Note</span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Star size={14} className="text-status-progress" /> {p.rating}/5
                </span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">Distance</span>
              {distance != null ? (
                <span className="text-sm text-primary font-medium">{formatDistance(distance)}</span>
              ) : (
                <Button size="sm" variant="outline" onClick={locate} disabled={isLocating}>
                  <Navigation size={14} className="mr-1" />
                  {isLocating ? 'Localisation...' : 'Calculer'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {p.description && (
          <Card className="shadow-card">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-1">À propos</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{p.description}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button asChild>
            <a href={`tel:${tel}`}>
              <Phone size={16} className="mr-2" /> Appeler
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">
              <MessageCircle size={16} className="mr-2" /> WhatsApp
            </a>
          </Button>
        </div>

        {p.latitude != null && p.longitude != null && (
          <Button asChild variant="secondary" className="w-full">
            <a
              href={`https://www.google.com/maps?q=${p.latitude},${p.longitude}`}
              target="_blank"
              rel="noreferrer"
            >
              <MapPin size={16} className="mr-2" /> Voir sur la carte
            </a>
          </Button>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default PrestataireProfile;
