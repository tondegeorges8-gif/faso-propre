import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Package, Sparkles } from 'lucide-react';

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
  is_available: boolean;
  created_at: string;
}

const isNew = (d: string) => Date.now() - new Date(d).getTime() < 7 * 24 * 3600 * 1000;

const ArticleCard: React.FC<{ article: Article }> = ({ article }) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
        {article.photo_url ? (
          <img src={article.photo_url} alt={article.nom} loading="lazy" className="w-full h-full object-cover" />
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
        <p className="font-bold text-primary text-sm">{article.prix.toLocaleString('fr-FR')} FCFA</p>
        {article.region && <p className="text-[11px] text-muted-foreground">Origine : {article.region}</p>}
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() =>
            navigate(`/messages?seller=${article.owner_user_id}&type=article&id=${article.id}&subject=${encodeURIComponent(article.nom)}`)
          }
        >
          <MessageCircle size={14} className="mr-1" />
          Contacter
        </Button>
      </CardContent>
    </Card>
  );
};

export default ArticleCard;
