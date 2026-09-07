import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ArticleCard, { Article } from './ArticleCard';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ARTICLE_CATEGORIES, BURKINA_REGIONS } from '@/data/burkinaRegions';
import { Package } from 'lucide-react';

const ALL = '__all__';

const ProductsGrid: React.FC<{ boutiqueIds?: string[]; search?: string }> = ({ boutiqueIds, search }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [categorie, setCategorie] = useState(ALL);
  const [region, setRegion] = useState(ALL);
  const [tri, setTri] = useState('recent');
  const [boutiqueNames, setBoutiqueNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let list: Article[];
      if (boutiqueIds?.length) {
        // Vue boutique : tous les produits de la boutique
        const { data } = await supabase
          .from('articles').select('*').eq('is_available', true)
          .in('boutique_id', boutiqueIds)
          .order('created_at', { ascending: false }).limit(60);
        list = (data || []) as unknown as Article[];
      } else {
        // Flux public : visibilité restreinte — produits boostés + petit échantillon organique
        const { data } = await supabase.rpc('get_marketplace_articles', { _limited_sample: 6 });
        list = ((data || []) as unknown as Article[]).sort((a, b) => {
          const ab = a.visibility === 'boosted' ? 1 : 0;
          const bb = b.visibility === 'boosted' ? 1 : 0;
          if (ab !== bb) return bb - ab;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      }
      setArticles(list);
      const ids = [...new Set(list.map((a) => a.boutique_id).filter(Boolean))];
      if (ids.length) {
        const { data: bs } = await supabase.from('boutiques').select('id, nom').in('id', ids);
        const map: Record<string, string> = {};
        (bs || []).forEach((b) => { map[b.id] = b.nom; });
        setBoutiqueNames(map);
      }
      setLoading(false);
    };
    load();
  }, [JSON.stringify(boutiqueIds)]);

  const filtered = useMemo(() => {
    const term = (search || '').trim().toLowerCase();
    let list = articles.filter((a) => {
      if (categorie !== ALL && a.categorie !== categorie) return false;
      if (region !== ALL && a.region !== region) return false;
      if (term && !`${a.nom} ${a.description ?? ''}`.toLowerCase().includes(term)) return false;
      return true;
    });
    if (tri === 'prix_asc') list = [...list].sort((a, b) => Number(a.prix) - Number(b.prix));
    if (tri === 'prix_desc') list = [...list].sort((a, b) => Number(b.prix) - Number(a.prix));
    return list;
  }, [articles, categorie, region, tri, search]);

  return (
    <section className="space-y-3">
      <h2 className="font-semibold text-lg">Produits en vente & troc</h2>

      <div className="grid grid-cols-3 gap-2">
        <Select value={categorie} onValueChange={setCategorie}>
          <SelectTrigger><SelectValue placeholder="Catégorie" /></SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value={ALL}>Toutes catégories</SelectItem>
            {ARTICLE_CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger><SelectValue placeholder="Région" /></SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value={ALL}>Toutes régions</SelectItem>
            {BURKINA_REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={tri} onValueChange={setTri}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Nouveautés</SelectItem>
            <SelectItem value="prix_asc">Prix croissant</SelectItem>
            <SelectItem value="prix_desc">Prix décroissant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 flex flex-col items-center text-center gap-2">
            <Package className="text-muted-foreground" size={24} />
            <p className="text-sm text-muted-foreground">Aucun produit publié pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((a) => <ArticleCard key={a.id} article={a} boutiqueNom={boutiqueNames[a.boutique_id]} />)}
        </div>
      )}
    </section>
  );
};

export default ProductsGrid;
