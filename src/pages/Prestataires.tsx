import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Search, Users, Settings2, Navigation, BadgeCheck } from 'lucide-react';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import PrestataireCard from '@/components/prestataires/PrestataireCard';
import { METIERS, CATEGORIES_METIERS, getMetier, getMetiersByCategorie } from '@/data/metiers';
import { QUARTIERS_BY_CITY } from '@/data/burkinaQuartiers';
import { BURKINA_CITIES } from '@/data/burkinaCities';
import { usePrestataires, haversineKm } from '@/hooks/usePrestataires';
import { useUserPosition } from '@/hooks/useUserPosition';
import { useUserRole } from '@/hooks/useUserRole';

const ALL = '__all__';

const Prestataires: React.FC = () => {
  const navigate = useNavigate();
  const { metier } = useParams();
  const { isAdmin, isFounder } = useUserRole();
  const { prestataires, isLoading } = usePrestataires(metier);
  const { position, isLocating, locate, clear } = useUserPosition();

  const [ville, setVille] = useState<string>(ALL);
  const [quartier, setQuartier] = useState<string>(ALL);
  const [search, setSearch] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);

  const currentMetier = metier ? getMetier(metier) : undefined;

  const villes = useMemo(() => {
    const fromData = prestataires.map((p) => p.ville).filter(Boolean);
    return Array.from(new Set([...fromData, ...BURKINA_CITIES])).sort((a, b) =>
      a.localeCompare(b, 'fr')
    );
  }, [prestataires]);

  const quartiers = useMemo(() => {
    const fromData = prestataires
      .filter((p) => ville === ALL || p.ville === ville)
      .map((p) => p.quartier)
      .filter(Boolean) as string[];
    const known = ville !== ALL ? QUARTIERS_BY_CITY[ville] ?? [] : Object.values(QUARTIERS_BY_CITY).flat();
    return Array.from(new Set([...fromData, ...known])).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [prestataires, ville]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    const list = prestataires
      .filter((p) => {
        if (ville !== ALL && p.ville !== ville) return false;
        if (quartier !== ALL && p.quartier !== quartier) return false;
        if (onlyAvailable && !p.is_available) return false;
        if (onlyVerified && !p.is_verified) return false;
        if (!term) return true;
        return [p.nom, p.prenoms, p.specialite, p.quartier, p.ville, p.metier]
          .filter(Boolean)
          .some((v) => (v as string).toLowerCase().includes(term));
      })
      .map((p) => ({
        p,
        distance:
          position && p.latitude != null && p.longitude != null
            ? haversineKm(position.lat, position.lng, p.latitude, p.longitude)
            : null,
      }));

    if (position) {
      list.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }
    return list;
  }, [prestataires, ville, quartier, search, onlyAvailable, onlyVerified, position]);

  const countsByMetier = useMemo(() => {
    const map: Record<string, number> = {};
    prestataires.forEach((p) => {
      map[p.metier] = (map[p.metier] ?? 0) + 1;
    });
    return map;
  }, [prestataires]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="gradient-hero text-primary-foreground px-4 py-6">
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-white/10"
            onClick={() => (metier ? navigate('/prestataires') : navigate('/dashboard'))}
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold flex-1">
            {currentMetier ? currentMetier.name : 'Annuaire des prestataires'}
          </h1>
          {(isAdmin || isFounder) && (
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-white/10"
              onClick={() => navigate('/admin/prestataires')}
            >
              <Settings2 size={20} />
            </Button>
          )}
        </div>
        <p className="text-sm opacity-90">
          {currentMetier
            ? currentMetier.description
            : 'Trouvez un professionnel près de chez vous, partout au Burkina Faso'}
        </p>
      </header>

      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Catégories métiers */}
        {!metier && (
          <section className="space-y-4">
            {CATEGORIES_METIERS.map((cat) => (
              <div key={cat.id}>
                <h2 className="font-semibold mb-2 text-sm">
                  {cat.icon} {cat.name}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {getMetiersByCategorie(cat.id).map((m) => (
                    <button key={m.id} onClick={() => navigate(`/prestataires/${m.id}`)} className="text-left">
                      <Card className="shadow-card h-full hover:border-primary transition-colors">
                        <CardContent className="p-3">
                          <div className="text-2xl mb-1">{m.icon}</div>
                          <div className="font-semibold text-sm leading-tight">{m.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {countsByMetier[m.id] ?? 0} prestataire{(countsByMetier[m.id] ?? 0) > 1 ? 's' : ''}
                          </div>
                        </CardContent>
                      </Card>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Filtres */}
        <section className="space-y-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un prestataire..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Select
              value={ville}
              onValueChange={(v) => {
                setVille(v);
                setQuartier(ALL);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ville" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value={ALL}>Toutes les villes</SelectItem>
                {villes.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={quartier} onValueChange={setQuartier}>
              <SelectTrigger>
                <SelectValue placeholder="Quartier" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value={ALL}>Tous les quartiers</SelectItem>
                {quartiers.map((q) => (
                  <SelectItem key={q} value={q}>{q}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={position ? 'default' : 'outline'}
              size="sm"
              onClick={() => (position ? clear() : locate())}
              disabled={isLocating}
            >
              <Navigation size={14} className="mr-1" />
              {isLocating ? 'Localisation...' : position ? 'Tri par proximité actif' : 'Près de moi'}
            </Button>
            <Button
              variant={onlyAvailable ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOnlyAvailable((v) => !v)}
            >
              🟢 Disponibles
            </Button>
            <Button
              variant={onlyVerified ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOnlyVerified((v) => !v)}
            >
              <BadgeCheck size={14} className="mr-1" /> Vérifiés
            </Button>
          </div>

          {(ville !== ALL || quartier !== ALL) && (
            <div className="flex items-center gap-2 flex-wrap">
              {ville !== ALL && <Badge variant="secondary">{ville}</Badge>}
              {quartier !== ALL && <Badge variant="secondary">{quartier}</Badge>}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setVille(ALL);
                  setQuartier(ALL);
                }}
              >
                Réinitialiser
              </Button>
            </div>
          )}
        </section>

        {/* Liste */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users size={16} />
            {filtered.length} prestataire{filtered.length > 1 ? 's' : ''}
          </div>

          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Chargement...</p>
          ) : filtered.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="p-6 text-center text-muted-foreground text-sm">
                Aucun prestataire trouvé pour cette zone.
              </CardContent>
            </Card>
          ) : (
            filtered.map(({ p, distance }) => (
              <PrestataireCard key={p.id} prestataire={p} distanceKm={distance} />
            ))
          )}
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Prestataires;
