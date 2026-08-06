import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Timer } from 'lucide-react';

interface Promo {
  id: string;
  titre: string;
  description: string | null;
  reduction_pct: number | null;
  prix_promo: number | null;
  image_url: string | null;
  ends_at: string;
}

const countdown = (end: string) => {
  const ms = new Date(end).getTime() - Date.now();
  if (ms <= 0) return 'Terminée';
  const h = Math.floor(ms / 3600000);
  const d = Math.floor(h / 24);
  if (d >= 1) return `${d} j restant${d > 1 ? 's' : ''}`;
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}min`;
};

const PromosFlash: React.FC = () => {
  const [promos, setPromos] = useState<Promo[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('promos_flash')
        .select('id, titre, description, reduction_pct, prix_promo, image_url, ends_at')
        .eq('is_active', true)
        .gt('ends_at', new Date().toISOString())
        .order('ends_at')
        .limit(10);
      setPromos((data || []) as Promo[]);
    };
    load();
  }, []);

  if (promos.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="font-semibold text-lg flex items-center gap-2">
        <Zap size={18} className="text-primary" />
        Bons plans & promos flash
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
        {promos.map((p) => (
          <Card key={p.id} className="min-w-[220px] max-w-[220px] overflow-hidden shrink-0">
            <div className="h-24 bg-muted overflow-hidden">
              {p.image_url && <img src={p.image_url} alt={p.titre} loading="lazy" className="w-full h-full object-cover" />}
            </div>
            <CardContent className="p-3 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm leading-tight line-clamp-2">{p.titre}</h3>
                {p.reduction_pct ? <Badge className="shrink-0">-{p.reduction_pct}%</Badge> : null}
              </div>
              {p.prix_promo != null && (
                <p className="text-sm font-bold text-primary">{p.prix_promo.toLocaleString('fr-FR')} FCFA</p>
              )}
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Timer size={11} /> {countdown(p.ends_at)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default PromosFlash;
