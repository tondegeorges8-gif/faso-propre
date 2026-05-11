import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, TrendingUp, TrendingDown, AlertTriangle, Leaf, X, BarChart3, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RegionData {
  name: string;
  count: number;
  resolved: number;
  pending: number;
  cx: number;
  cy: number;
}

// Approximate positions of Burkina Faso regions on a normalized grid (0-100)
const REGION_POSITIONS: Record<string, { cx: number; cy: number }> = {
  'Ouagadougou': { cx: 52, cy: 52 },
  'Bobo-Dioulasso': { cx: 22, cy: 72 },
  'Koudougou': { cx: 42, cy: 50 },
  'Ouahigouya': { cx: 45, cy: 25 },
  'Banfora': { cx: 18, cy: 82 },
  'Kaya': { cx: 55, cy: 38 },
  'Tenkodogo': { cx: 68, cy: 58 },
  'Dédougou': { cx: 28, cy: 42 },
  'Fada N\'Gourma': { cx: 80, cy: 50 },
  'Dori': { cx: 65, cy: 18 },
  'Manga': { cx: 55, cy: 68 },
  'Gaoua': { cx: 18, cy: 90 },
  'Djibo': { cx: 50, cy: 20 },
  'Kongoussi': { cx: 50, cy: 35 },
  'Ziniaré': { cx: 55, cy: 46 },
  'Houndé': { cx: 28, cy: 62 },
  'Léo': { cx: 38, cy: 72 },
  'Pô': { cx: 48, cy: 78 },
  'Diébougou': { cx: 20, cy: 85 },
  'Kombissiri': { cx: 50, cy: 62 },
  'Zorgo': { cx: 62, cy: 48 },
  'Boulsa': { cx: 62, cy: 40 },
  'Bogandé': { cx: 78, cy: 35 },
  'Koupéla': { cx: 65, cy: 50 },
  'Pouytenga': { cx: 63, cy: 45 },
  'Garango': { cx: 68, cy: 55 },
  'Reo': { cx: 38, cy: 55 },
  'Tougan': { cx: 30, cy: 30 },
  'Nouna': { cx: 22, cy: 35 },
  'Solenzo': { cx: 25, cy: 45 },
  'Boromo': { cx: 30, cy: 55 },
  'Orodara': { cx: 15, cy: 72 },
  'Toma': { cx: 32, cy: 38 },
};

const getColor = (count: number, maxCount: number): string => {
  if (count === 0) return 'hsl(var(--muted))';
  const ratio = count / Math.max(maxCount, 1);
  if (ratio > 0.6) return 'hsl(0, 75%, 50%)'; // Red - dirty
  if (ratio > 0.3) return 'hsl(35, 90%, 55%)'; // Orange - moderate
  return 'hsl(140, 65%, 45%)'; // Green - clean
};

const getStatusLabel = (count: number, maxCount: number): string => {
  if (count === 0) return 'Aucun signalement';
  const ratio = count / Math.max(maxCount, 1);
  if (ratio > 0.6) return 'Zone critique';
  if (ratio > 0.3) return 'Zone modérée';
  return 'Zone propre';
};

const BurkinaCleanlinessMap: React.FC = () => {
  const [regionData, setRegionData] = useState<RegionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('map-signalements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'signalements' }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await supabase.rpc('get_public_cleanliness_stats');

      if (!data) { setLoading(false); return; }

      const grouped: Record<string, { count: number; resolved: number; pending: number }> = {};
      (data as Array<{ ville: string; total: number; resolved: number; pending: number }>).forEach((s) => {
        grouped[s.ville] = {
          count: Number(s.total) || 0,
          resolved: Number(s.resolved) || 0,
          pending: Number(s.pending) || 0,
        };
      });

      const regions: RegionData[] = Object.entries(REGION_POSITIONS).map(([name, pos]) => ({
        name,
        count: grouped[name]?.count || 0,
        resolved: grouped[name]?.resolved || 0,
        pending: grouped[name]?.pending || 0,
        cx: pos.cx,
        cy: pos.cy,
      }));

      // Sort by count descending
      regions.sort((a, b) => b.count - a.count);
      setRegionData(regions);
    } catch (e) {
      console.error('Map data error:', e);
    } finally {
      setLoading(false);
    }
  };

  const maxCount = useMemo(() => Math.max(...regionData.map(r => r.count), 1), [regionData]);
  const totalReports = useMemo(() => regionData.reduce((s, r) => s + r.count, 0), [regionData]);
  const totalResolved = useMemo(() => regionData.reduce((s, r) => s + r.resolved, 0), [regionData]);
  const dirtiest = useMemo(() => regionData.filter(r => r.count > 0).slice(0, 5), [regionData]);
  const cleanest = useMemo(() => [...regionData].sort((a, b) => a.count - b.count).filter(r => r.count >= 0).slice(0, 5), [regionData]);

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="shadow-card cursor-pointer hover:shadow-lg transition-shadow border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin size={24} className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base">🗺️ Carte de Propreté du Burkina</h3>
                <p className="text-xs text-muted-foreground">Voir les zones propres et sales en temps réel</p>
              </div>
              <Eye size={20} className="text-muted-foreground" />
            </div>
            {/* Mini stats */}
            <div className="flex gap-2 mt-3">
              <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-200">
                <AlertTriangle size={10} className="mr-1" /> {totalReports - totalResolved} en attente
              </Badge>
              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-200">
                <Leaf size={10} className="mr-1" /> {totalResolved} résolus
              </Badge>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 gradient-hero text-primary-foreground">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <MapPin size={20} /> Tableau de Bord — Propreté du Burkina Faso
          </DialogTitle>
          <p className="text-xs text-primary-foreground/70">
            Données en temps réel • {totalReports} signalements au total
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <div className="p-4 space-y-4">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-2">
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-3 text-center">
                  <AlertTriangle size={18} className="mx-auto text-red-500 mb-1" />
                  <p className="text-lg font-bold text-red-600">{totalReports - totalResolved}</p>
                  <p className="text-[10px] text-red-500">En attente</p>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-3 text-center">
                  <Leaf size={18} className="mx-auto text-green-500 mb-1" />
                  <p className="text-lg font-bold text-green-600">{totalResolved}</p>
                  <p className="text-[10px] text-green-500">Résolus</p>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3 text-center">
                  <BarChart3 size={18} className="mx-auto text-blue-500 mb-1" />
                  <p className="text-lg font-bold text-blue-600">{totalReports}</p>
                  <p className="text-[10px] text-blue-500">Total</p>
                </CardContent>
              </Card>
            </div>

            {/* SVG Map */}
            <Card>
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  🗺️ Carte interactive
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="relative bg-muted/30 rounded-lg overflow-hidden" style={{ paddingBottom: '80%' }}>
                  <svg
                    viewBox="0 0 100 100"
                    className="absolute inset-0 w-full h-full"
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
                  >
                    {/* Simplified Burkina outline */}
                    <path
                      d="M8,15 L35,10 L55,12 L75,8 L90,15 L92,30 L88,45 L90,55 L85,65 L75,70 L65,75 L55,80 L45,85 L35,82 L25,90 L15,88 L10,78 L8,65 L12,50 L10,35 Z"
                      fill="hsl(var(--muted) / 0.3)"
                      stroke="hsl(var(--border))"
                      strokeWidth="0.5"
                    />
                    
                    {/* Region dots */}
                    {regionData.map((region) => {
                      const radius = Math.max(1.5, Math.min(4, 1.5 + (region.count / maxCount) * 3));
                      const color = getColor(region.count, maxCount);
                      return (
                        <g
                          key={region.name}
                          className="cursor-pointer"
                          onClick={() => setSelectedRegion(region)}
                        >
                          {/* Pulse animation for critical zones */}
                          {region.count / maxCount > 0.6 && (
                            <circle
                              cx={region.cx}
                              cy={region.cy}
                              r={radius + 1}
                              fill="none"
                              stroke={color}
                              strokeWidth="0.3"
                              opacity="0.5"
                            >
                              <animate attributeName="r" from={radius} to={radius + 3} dur="2s" repeatCount="indefinite" />
                              <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
                            </circle>
                          )}
                          <circle
                            cx={region.cx}
                            cy={region.cy}
                            r={radius}
                            fill={color}
                            stroke="white"
                            strokeWidth="0.4"
                            opacity="0.9"
                          />
                          {region.count > 0 && (
                            <text
                              x={region.cx}
                              y={region.cy + 0.5}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize="1.8"
                              fill="white"
                              fontWeight="bold"
                            >
                              {region.count}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-2 text-[10px]">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(140, 65%, 45%)' }} />
                    <span>Propre</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(35, 90%, 55%)' }} />
                    <span>Modéré</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(0, 75%, 50%)' }} />
                    <span>Critique</span>
                  </div>
                </div>

                {/* Selected region detail */}
                {selectedRegion && (
                  <div className="mt-3 p-3 rounded-lg border bg-card animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-sm">{selectedRegion.name}</h4>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedRegion(null)}>
                        <X size={14} />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-1.5 rounded bg-muted/50">
                        <p className="font-bold">{selectedRegion.count}</p>
                        <p className="text-muted-foreground">Total</p>
                      </div>
                      <div className="text-center p-1.5 rounded bg-red-50">
                        <p className="font-bold text-red-600">{selectedRegion.pending}</p>
                        <p className="text-muted-foreground">En attente</p>
                      </div>
                      <div className="text-center p-1.5 rounded bg-green-50">
                        <p className="font-bold text-green-600">{selectedRegion.resolved}</p>
                        <p className="text-muted-foreground">Résolus</p>
                      </div>
                    </div>
                    <Badge className="mt-2 text-[10px]" variant="outline" style={{ borderColor: getColor(selectedRegion.count, maxCount) }}>
                      {getStatusLabel(selectedRegion.count, maxCount)}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rankings */}
            <div className="grid grid-cols-2 gap-3">
              {/* Most reported */}
              <Card className="border-red-200">
                <CardHeader className="pb-1 pt-3 px-3">
                  <CardTitle className="text-xs flex items-center gap-1 text-red-600">
                    <TrendingUp size={14} /> Zones critiques
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 pt-1">
                  {dirtiest.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Aucune donnée</p>
                  ) : (
                    <div className="space-y-1.5">
                      {dirtiest.map((r, i) => (
                        <div key={r.name} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 truncate">
                            <span className="font-bold text-red-500">{i + 1}.</span>
                            <span className="truncate">{r.name}</span>
                          </span>
                          <Badge variant="destructive" className="text-[10px] h-5 px-1.5">{r.count}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cleanest */}
              <Card className="border-green-200">
                <CardHeader className="pb-1 pt-3 px-3">
                  <CardTitle className="text-xs flex items-center gap-1 text-green-600">
                    <TrendingDown size={14} /> Zones propres
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 pt-1">
                  {cleanest.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Aucune donnée</p>
                  ) : (
                    <div className="space-y-1.5">
                      {cleanest.map((r, i) => (
                        <div key={r.name} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 truncate">
                            <span className="font-bold text-green-500">{i + 1}.</span>
                            <span className="truncate">{r.name}</span>
                          </span>
                          <Badge className="text-[10px] h-5 px-1.5 bg-green-100 text-green-700 border-green-200" variant="outline">{r.count}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Public message */}
            <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-3 text-center">
                <p className="text-xs font-medium text-primary">
                  🤝 Citoyens, journalistes, autorités — <strong>vous n'êtes pas seuls.</strong>
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Ces données sont publiques et mises à jour en temps réel pour une transparence totale.
                </p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default BurkinaCleanlinessMap;
