import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, MapPin, BadgeCheck } from 'lucide-react';
import { getMetierIcon, getMetierName } from '@/data/metiers';
import type { Prestataire } from '@/hooks/usePrestataires';

interface Props {
  prestataire: Prestataire;
}

const PrestataireCard: React.FC<Props> = ({ prestataire: p }) => {
  const initials = `${p.prenoms?.[0] ?? ''}${p.nom?.[0] ?? ''}`.toUpperCase();

  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="flex gap-3">
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
              {p.is_verified && <BadgeCheck size={16} className="text-primary shrink-0" />}
            </div>

            <div className="flex flex-wrap items-center gap-1 mt-1">
              <Badge variant="secondary" className="text-xs">
                {getMetierIcon(p.metier)} {getMetierName(p.metier)}
              </Badge>
              {p.specialite && (
                <span className="text-xs text-muted-foreground truncate">{p.specialite}</span>
              )}
            </div>

            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin size={12} />
              {[p.quartier, p.ville].filter(Boolean).join(' · ')}
            </p>

            {p.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
            )}
          </div>
        </div>

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
