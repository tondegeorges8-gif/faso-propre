import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, MapPin, BadgeCheck, Navigation } from 'lucide-react';
import { getMetierIcon, getMetierName } from '@/data/metiers';
import { formatDistance, type Prestataire } from '@/hooks/usePrestataires';

interface Props {
  prestataire: Prestataire;
  distanceKm?: number | null;
}

export const AvailabilityDot: React.FC<{ available: boolean }> = ({ available }) => (
  <span className="inline-flex items-center gap-1 text-xs">
    <span
      className={`h-2.5 w-2.5 rounded-full ${available ? 'bg-status-resolved' : 'bg-destructive'}`}
      aria-hidden
    />
    <span className={available ? 'text-status-resolved' : 'text-destructive'}>
      {available ? 'Disponible' : 'Occupé'}
    </span>
  </span>
);

const PrestataireCard: React.FC<Props> = ({ prestataire: p, distanceKm }) => {
  const navigate = useNavigate();
  const initials = `${p.prenoms?.[0] ?? ''}${p.nom?.[0] ?? ''}`.toUpperCase();

  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <button
          className="flex gap-3 w-full text-left"
          onClick={() => navigate(`/prestataires/fiche/${p.id}`)}
        >
          <Avatar className="h-14 w-14 shrink-0">
            <AvatarImage src={p.photo_url ?? undefined} alt={`${p.prenoms} ${p.nom}`} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials || '👤'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="font-semibold truncate">
                {p.prenoms} {p.nom}
              </h3>
              {p.is_verified && (
                <Badge variant="secondary" className="gap-1 text-[10px] px-1.5 py-0 shrink-0">
                  <BadgeCheck size={12} className="text-primary" />
                  Vérifié
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {getMetierIcon(p.metier)} {getMetierName(p.metier)}
              </Badge>
              <AvailabilityDot available={p.is_available} />
            </div>

            {p.specialite && (
              <p className="text-xs text-muted-foreground truncate mt-1">{p.specialite}</p>
            )}

            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin size={12} />
              {[p.quartier, p.ville].filter(Boolean).join(' · ')}
              {distanceKm != null && (
                <span className="inline-flex items-center gap-1 text-primary font-medium">
                  <Navigation size={12} />
                  {formatDistance(distanceKm)}
                </span>
              )}
            </p>

            {p.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
            )}
          </div>
        </button>

        <Button asChild className="w-full mt-3" size="sm">
          <a href={`tel:${p.telephone.replace(/\s/g, '')}`}>
            <Phone size={16} className="mr-2" />
            Appeler {p.telephone}
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

export default PrestataireCard;
