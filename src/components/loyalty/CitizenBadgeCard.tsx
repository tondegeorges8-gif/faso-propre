import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award, Medal, Trophy, Lock, type LucideIcon } from 'lucide-react';

type BadgeTier = {
  key: 'bronze' | 'silver' | 'gold';
  label: string;
  threshold: number;
  Icon: LucideIcon;
  gradient: string;
  ring: string;
};

const TIERS: BadgeTier[] = [
  { key: 'bronze', label: 'Citoyen de Bronze', threshold: 5, Icon: Award, gradient: 'from-amber-700 to-amber-500', ring: 'ring-amber-600/40' },
  { key: 'silver', label: 'Citoyen d\'Argent', threshold: 20, Icon: Medal, gradient: 'from-slate-400 to-slate-200', ring: 'ring-slate-400/40' },
  { key: 'gold', label: 'Citoyen d\'Or', threshold: 50, Icon: Trophy, gradient: 'from-yellow-500 to-yellow-300', ring: 'ring-yellow-500/40' },
];

const CitizenBadgeCard: React.FC = () => {
  const { user } = useAuth();
  const [resolvedCount, setResolvedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchCount = async () => {
      const { count } = await supabase
        .from('signalements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'RESOLVED');
      setResolvedCount(count || 0);
      setLoading(false);
    };

    fetchCount();

    const channel = supabase
      .channel('badge-signalements')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'signalements', filter: `user_id=eq.${user.id}` },
        () => fetchCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const currentTier = [...TIERS].reverse().find(t => resolvedCount >= t.threshold) || null;
  const nextTier = TIERS.find(t => resolvedCount < t.threshold) || null;
  const progress = nextTier
    ? Math.min(100, Math.round((resolvedCount / nextTier.threshold) * 100))
    : 100;

  return (
    <Card className="shadow-card overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy size={20} className="text-primary" />
          Mes badges de citoyenneté
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <div className="h-24 bg-muted/40 rounded animate-pulse" />
        ) : (
          <>
            <div className="text-center space-y-1">
              <p className="text-3xl font-bold">{resolvedCount}</p>
              <p className="text-xs text-muted-foreground">
                signalement{resolvedCount > 1 ? 's' : ''} résolu{resolvedCount > 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {TIERS.map(tier => {
                const unlocked = resolvedCount >= tier.threshold;
                const Icon = tier.Icon;
                return (
                  <div
                    key={tier.key}
                    className={`flex flex-col items-center text-center p-3 rounded-lg border ${
                      unlocked ? `ring-2 ${tier.ring} bg-muted/30` : 'opacity-50 bg-muted/20'
                    }`}
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br ${tier.gradient} text-white mb-2 ${
                        unlocked ? '' : 'grayscale'
                      }`}
                    >
                      {unlocked ? <Icon size={28} /> : <Lock size={22} />}
                    </div>
                    <p className="text-xs font-semibold leading-tight">{tier.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {tier.threshold} résolus
                    </p>
                  </div>
                );
              })}
            </div>

            {nextTier ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Prochain : <span className="font-medium text-foreground">{nextTier.label}</span>
                  </span>
                  <span className="font-medium">
                    {resolvedCount}/{nextTier.threshold}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            ) : (
              <div className="text-center text-sm font-medium text-primary">
                🎉 Bravo, vous avez atteint le plus haut niveau !
              </div>
            )}

            <div className="p-3 bg-accent/30 rounded-lg text-xs text-muted-foreground">
              💡 Chaque signalement marqué <span className="font-semibold text-foreground">résolu</span> par l'institution vous rapproche du badge suivant.
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CitizenBadgeCard;
