import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Repeat, Sparkles } from 'lucide-react';
import { useSignedUrl } from '@/hooks/useSignedUrl';
import { MARKETPLACE_BUCKET } from './PhotoUploader';

export interface Article {
  id: string;
  boutique_id: string;
  owner_user_id: string;
  nom: string;
  description: string | null;
  categorie: string;
  region: string | null;
  prix: number;
  photo_url: string | null;
  photos?: string[] | null;
  type_annonce?: string;
  etat?: string;
  troc_contre?: string | null;
  is_available: boolean;
  created_at: string;
  visibility?: string;
  boosted_until?: string | null;
}

const isNew = (d: string) => Date.now() - new Date(d).getTime() < 7 * 24 * 3600 * 1000;

const ArticleCard: React.FC<{ article: Article; boutiqueNom?: string }> = ({ article, boutiqueNom }) => {
  const navigate = useNavigate();
  const cover = article.photos?.[0] ?? article.photo_url;
  const url = useSignedUrl(MARKETPLACE_BUCKET, cover);

  return (
    <Card className="overflow-hidden cursor-pointer" onClick={() => navigate(`/produit/${article.id}`)}>
      <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
        {url ? (
          <img src={url} alt={article.nom} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <Package className="text-muted-foreground" size={32} />
        )}
      </div>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">{article.nom}</h3>
          {isNew(article.created_at) && (
            <Badge variant="secondary" className="shrink-0 gap-1 text-[10px]">
              <Sparkles size={10} /> Nouveau
            </Badge>
          )}
        </div>
        {article.type_annonce === 'troc' ? (
          <p className="text-sm font-semibold text-primary flex items-center gap-1">
            <Repeat size={14} /> Troc
          </p>
        ) : (
          <p className="font-bold text-primary text-sm">{Number(article.prix).toLocaleString('fr-FR')} FCFA</p>
        )}
        {boutiqueNom && <p className="text-[11px] font-medium text-primary truncate">{boutiqueNom}</p>}
        {article.region && <p className="text-[11px] text-muted-foreground">Origine : {article.region}</p>}
        <Button size="sm" variant="outline" className="w-full">
          Voir le produit
        </Button>
      </CardContent>
    </Card>
  );
};

export default ArticleCard;
