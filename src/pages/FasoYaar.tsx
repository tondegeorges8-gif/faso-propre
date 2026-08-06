import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BOUTIQUE_CATEGORIES, getBoutiqueCategorie } from '@/data/boutiqueCategories';
import { BURKINA_CITIES } from '@/data/burkinaCities';
import { getQuartiers } from '@/data/burkinaQuartiers';
import BoutiqueCard, { Boutique } from '@/components/boutiques/BoutiqueCard';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ArrowLeft, Store, MapPin } from 'lucide-react';

const ALL = '__all__';

const FasoYaar: React.FC = () => {
  const navigate = useNavigate();
  const { categorie } = useParams<{ categorie?: string }>();

  const [ville, setVille] = useState<string>(ALL);
  const [quartier, setQuartier] = useState<string>(ALL);
  const [search, setSearch] = useState('');
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeCategorie = getBoutiqueCategorie(categorie);

  useEffect(() => {
    const fetchBoutiques = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('boutiques')
        .select('*')
        .eq('is_active', true)
        .order('nom');
      if (!error && data) setBoutiques(data as unknown as Boutique[]);
      setIsLoading(false);
    };
    fetchBoutiques();
  }, []);

  useEffect(() => {
    setQuartier(ALL);
  }, [ville]);

  const quartiers = useMemo(() => (ville === ALL ? [] : getQuartiers(ville)), [ville]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return boutiques.filter((b) => {
      if (activeCategorie && b.categorie !== activeCategorie.id) return false;
      if (ville !== ALL && b.ville !== ville) return false;
      if (quartier !== ALL && b.quartier !== quartier) return false;
      if (term) {
        const haystack = `${b.nom} ${b.produits ?? ''} ${b.description ?? ''} ${b.quartier ?? ''} ${b.ville}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [boutiques, activeCategorie, ville, quartier, search]);

  const countFor = (id: string) =>
    boutiques.filter(
      (b) =>
        b.categorie === id &&
        (ville === ALL || b.ville === ville) &&
        (quartier === ALL || b.quartier === quartier),
    ).length;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="gradient-hero text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            {activeCategorie && (
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => navigate('/faso-yaar')}
              >
                <ArrowLeft size={20} />
              </Button>
            )}
            <div>
              <h1 className="text-xl font-bold">FASO YAAR</h1>
              <p className="text-xs opacity-90">
                {activeCategorie ? activeCategorie.name : 'Les boutiques de proximité au Burkina Faso'}
              </p>
            </div>
          </div>

          {/* Recherche globale */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              className="pl-10 bg-card text-foreground"
              placeholder="Rechercher une boutique ou un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filtres géographiques */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Select value={ville} onValueChange={setVille}>
              <SelectTrigger className="bg-card text-foreground">
                <SelectValue placeholder="Ville" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value={ALL}>Toutes les villes</SelectItem>
                {BURKINA_CITIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={quartier} onValueChange={setQuartier} disabled={quartiers.length === 0}>
              <SelectTrigger className="bg-card text-foreground">
                <SelectValue placeholder="Quartier / Secteur" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value={ALL}>Tous les quartiers</SelectItem>
                {quartiers.map((q) => (
                  <SelectItem key={q} value={q}>{q}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-4">
        {!activeCategorie ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/annonces/nouvelle')}>
                <Recycle size={16} className="mr-1" /> Vendre / Troquer
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/messages')}>
                <MessagesSquare size={16} className="mr-1" /> Messagerie
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/prestataires')}>
                <Wrench size={16} className="mr-1" /> Services de proximité
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/abonnement-pub')}>
                <Megaphone size={16} className="mr-1" /> Espace pub 5 000 F
              </Button>
            </div>

            <PromosFlash />

            <h2 className="font-semibold text-lg">Catégories de boutiques</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BOUTIQUE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/faso-yaar/${cat.id}`)}
                  className="text-left"
                >
                  <Card className="hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-4 flex items-start gap-3">
                      <span className="text-3xl">{cat.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold leading-tight">{cat.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{cat.description}</p>
                        <p className="text-xs text-primary font-medium mt-2">
                          {countFor(cat.id)} boutique{countFor(cat.id) > 1 ? 's' : ''}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>

            {search.trim() && (
              <div className="space-y-3 pt-2">
                <h2 className="font-semibold text-lg">Résultats de recherche</h2>
                {filtered.length === 0 ? (
                  <EmptyState message="Aucune boutique ne correspond à votre recherche." />
                ) : (
                  filtered.map((b) => <BoutiqueCard key={b.id} boutique={b} />)
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin size={16} />
              {ville === ALL ? 'Tout le Burkina Faso' : `${ville}${quartier !== ALL ? ` — ${quartier}` : ''}`}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState message="Aucune boutique enregistrée pour le moment dans cette catégorie." />
            ) : (
              <div className="space-y-3">
                {filtered.map((b) => <BoutiqueCard key={b.id} boutique={b} />)}
              </div>
            )}
          </>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <Card className="border-dashed">
    <CardContent className="py-12 flex flex-col items-center text-center gap-3">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
        <Store className="text-muted-foreground" size={26} />
      </div>
      <p className="text-muted-foreground max-w-xs">{message}</p>
      <p className="text-xs text-muted-foreground">
        Revenez bientôt, de nouvelles boutiques arrivent chaque semaine.
      </p>
    </CardContent>
  </Card>
);

export default FasoYaar;
