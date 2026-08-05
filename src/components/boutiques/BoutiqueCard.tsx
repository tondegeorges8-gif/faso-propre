import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, MapPin, BadgeCheck, Store } from 'lucide-react';

export interface Boutique {
  id: string;
  nom: string;
  categorie: string;
  ville: string;
  quartier: string | null;
  adresse: string | null;
  telephone: string | null;
  whatsapp: string | null;
  description: string | null;
  produits: string | null;
  logo_url: string | null;
  is_verified: boolean;
  is_partner: boolean;
}

const cleanPhone = (p: string) => p.replace(/[^\d+]/g, '');

const BoutiqueCard: React.FC<{ boutique: Boutique }> = ({ boutique }) => {
  const phone = boutique.telephone ? cleanPhone(boutique.telephone) : null;
  const wa = boutique.whatsapp || boutique.telephone;
  const waNumber = wa ? cleanPhone(wa).replace(/^\+/, '') : null;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
            {boutique.logo_url ? (
              <img src={boutique.logo_url} alt={boutique.nom} className="w-full h-full object-cover" />
            ) : (
              <Store className="text-muted-foreground" size={24} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold leading-tight truncate">{boutique.nom}</h3>
              {(boutique.is_verified || boutique.is_partner) && (
                <Badge className="shrink-0 gap-1">
                  <BadgeCheck size={12} />
                  {boutique.is_partner ? 'Partenaire' : 'Vérifié'}
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin size={14} />
              {boutique.quartier ? `${boutique.quartier}, ` : ''}
              {boutique.ville}
            </p>

            {boutique.produits && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{boutique.produits}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            className="flex-1"
            size="sm"
            disabled={!phone}
            onClick={() => phone && (window.location.href = `tel:${phone}`)}
          >
            <Phone size={16} className="mr-1" />
            Appeler
          </Button>
          <Button
            className="flex-1"
            size="sm"
            variant="outline"
            disabled={!waNumber}
            onClick={() => waNumber && window.open(`https://wa.me/${waNumber}`, '_blank')}
          >
            <MessageCircle size={16} className="mr-1" />
            WhatsApp
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BoutiqueCard;
