import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AnnonceCard, { AnnonceOccasion } from './AnnonceCard';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OCCASION_CATEGORIES } from '@/data/burkinaRegions';
import { Recycle } from 'lucide-react';

const ALL = '__all__';

interface AnnonceRow extends AnnonceOccasion {
  visibility?: string;
  boosted_until?: string | null;
}

const AnnoncesGrid: React.FC<{ search?: string }> = ({ search }) => {
  const [annonces, setAnnonces] = useState<AnnonceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [categorie, setCategorie] = useState(ALL);
  const [type, setType] = useState(ALL);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // Flux organique restreint : seules les annonces boostées sont diffusées largement,
      // plus un petit échantillon des annonces récentes non boostées.
      const { data } = await supabase.rpc('get_marketplace_annonces', { _limited_sample: 6 });
      const list = ((data || []) as unknown as AnnonceRow[]).sort((a, b) => {
        const ab = a.visibility === 'boosted' ? 1 : 0;
        const bb = b.visibility === 'boosted' ? 1 : 0;
        if (ab !== bb) return bb - ab;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setAnnonces(list);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = (search || '').trim().toLowerCase();
    return annonces.filter((a) => {
      if (categorie !== ALL && a.categorie !== categorie) return false;
      if (type !== ALL && a.type_annonce !== type) return false;
      if (term && !`${a.titre} ${a.description ?? ''} ${a.ville}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [annonces, categorie, type, search]);

  return (
    <section className="space-y-3">
      <h2 className="font-semibold text-lg">Vente / Troc entre voisins</h2>

      <div className="grid grid-cols-2 gap-2">
        <Select value={categorie} onValueChange={setCategorie}>
          <SelectTrigger><SelectValue placeholder="Catégorie" /></SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value={ALL}>Toutes catégories</SelectItem>
            {OCCASION_CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous types</SelectItem>
            <SelectItem value="vente">Vente</SelectItem>
            <SelectItem value="troc">Troc</SelectItem>
            <SelectItem value="don">Don</SelectItem>
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
            <Recycle className="text-muted-foreground" size={24} />
            <p className="text-sm text-muted-foreground">Aucune annonce pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => <AnnonceCard key={a.id} annonce={a} />)}
        </div>
      )}
    </section>
  );
};

export default AnnoncesGrid;
