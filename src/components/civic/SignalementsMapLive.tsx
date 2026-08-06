import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { INSTITUTIONS } from '@/data/institutions';

interface Pin {
  id: string;
  latitude: number;
  longitude: number;
  ville: string;
  category: string;
  status: string;
  created_at: string;
}

// Limites approximatives du Burkina Faso
const BOUNDS = { minLat: 9.3, maxLat: 15.1, minLng: -5.6, maxLng: 2.5 };

const STATUS_META: Record<string, { label: string; className: string; dot: string }> = {
  RESOLVED: { label: 'Nettoyé', className: 'bg-green-500/10 text-green-700', dot: 'fill-green-500' },
  IN_PROGRESS: { label: 'En cours', className: 'bg-orange-500/10 text-orange-700', dot: 'fill-orange-500' },
  PENDING: { label: 'Signalé', className: 'bg-blue-500/10 text-blue-700', dot: 'fill-blue-500' },
};

const metaFor = (status: string) => STATUS_META[status] ?? STATUS_META.PENDING;

const SignalementsMapLive: React.FC = () => {
  const [pins, setPins] = useState<Pin[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [selected, setSelected] = useState<Pin | null>(null);

  const load = async () => {
    const { data } = await supabase.rpc('get_public_signalement_pins');
    setPins((data || []) as Pin[]);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel('map-signalements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'signalements' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const visible = useMemo(
    () => (filter === 'ALL' ? pins : pins.filter((p) => metaFor(p.status).label === filter)),
    [pins, filter],
  );

  const project = (p: Pin) => ({
    x: ((Number(p.longitude) - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100,
    y: ((BOUNDS.maxLat - Number(p.latitude)) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100,
  });

  const counts = {
    Signalé: pins.filter((p) => metaFor(p.status).label === 'Signalé').length,
    'En cours': pins.filter((p) => metaFor(p.status).label === 'En cours').length,
    Nettoyé: pins.filter((p) => metaFor(p.status).label === 'Nettoyé').length,
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin size={20} className="text-primary" />
          Carte des signalements en temps réel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant={filter === 'ALL' ? 'default' : 'outline'} onClick={() => setFilter('ALL')}>
            Tous ({pins.length})
          </Button>
          {(['Signalé', 'En cours', 'Nettoyé'] as const).map((s) => (
            <Button key={s} size="sm" variant={filter === s ? 'default' : 'outline'} onClick={() => setFilter(s)}>
              {s} ({counts[s]})
            </Button>
          ))}
        </div>

        <div className="relative w-full rounded-xl border bg-muted/30 overflow-hidden" style={{ aspectRatio: '4 / 3' }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            {[20, 40, 60, 80].map((v) => (
              <g key={v}>
                <line x1={v} y1={0} x2={v} y2={100} stroke="hsl(var(--border))" strokeWidth={0.2} />
                <line x1={0} y1={v} x2={100} y2={v} stroke="hsl(var(--border))" strokeWidth={0.2} />
              </g>
            ))}
            {visible.map((p) => {
              const { x, y } = project(p);
              return (
                <circle
                  key={p.id}
                  cx={x}
                  cy={y}
                  r={1.6}
                  className={`${metaFor(p.status).dot} cursor-pointer`}
                  onClick={() => setSelected(p)}
                />
              );
            })}
          </svg>
          {visible.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
              Aucun signalement géolocalisé pour ce filtre
            </div>
          )}
        </div>

        {selected && (
          <div className="p-3 rounded-lg border space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm">{INSTITUTIONS[selected.category]?.name ?? selected.category}</p>
              <Badge className={metaFor(selected.status).className} variant="secondary">
                {metaFor(selected.status).label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {selected.ville} · {new Date(selected.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
        )}

        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Signalé</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> En cours</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Nettoyé</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignalementsMapLive;
