import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, MessageCircle, Recycle, Repeat } from 'lucide-react';

export interface AnnonceOccasion {
  id: string;
  user_id: string;
  titre: string;
  description: string | null;
  categorie: string;
  type_annonce: string;
  etat: string;
  prix: number | null;
  troc_contre: string | null;
  ville: string;
  quartier: string | null;
  region: string | null;
  photo_url: string | null;
  contact_telephone: string | null;
  created_at: string;
}

const AnnonceCard: React.FC<{ annonce: AnnonceOccasion }> = ({ annonce }) => {
  const navigate = useNavigate();
  const isTroc = annonce.type_annonce === 'troc';

  return (
    <Card className="overflow-hidden cursor-pointer" onClick={() => navigate(`/annonce/${annonce.id}`)}>
      <CardContent className="p-3">
        <div className="flex gap-3">
          <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
            {annonce.photo_url ? (
              <img src={annonce.photo_url} alt={annonce.titre} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <Recycle className="text-muted-foreground" size={24} />
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm leading-tight line-clamp-2">{annonce.titre}</h3>
              <Badge variant={isTroc ? 'secondary' : 'default'} className="shrink-0 gap-1 text-[10px]">
                {isTroc ? <Repeat size={10} /> : null}
                {isTroc ? 'Troc' : 'Vente'}
              </Badge>
            </div>
            <p className="text-sm font-bold text-primary">
              {isTroc ? `Contre : ${annonce.troc_contre || 'à discuter'}` : `${(annonce.prix ?? 0).toLocaleString('fr-FR')} FCFA`}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin size={12} />
              {annonce.quartier ? `${annonce.quartier}, ` : ''}
              {annonce.ville} · État : {annonce.etat}
            </p>
          </div>
        </div>
        {annonce.description && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{annonce.description}</p>
        )}
        <Button
          size="sm"
          variant="outline"
          className="w-full mt-3"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/messages?seller=${annonce.user_id}&type=annonce&id=${annonce.id}&subject=${encodeURIComponent(annonce.titre)}`);
          }}
        >
          <MessageCircle size={14} className="mr-1" />
          Contacter le vendeur
        </Button>
      </CardContent>
    </Card>
  );
};

export default AnnonceCard;
