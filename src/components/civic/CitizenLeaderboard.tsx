import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal } from 'lucide-react';

interface Row {
  rang: number;
  pseudo: string;
  resolus: number;
  total: number;
}

const CitizenLeaderboard: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.rpc('get_citizen_leaderboard', { _limit: 10 });
      setRows((data || []) as Row[]);
    };
    load();
  }, []);

  if (rows.length === 0) return null;

  const medal = (i: number) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`);

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy size={20} className="text-primary" />
          Classement des citoyens engagés
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map((r, i) => (
          <div key={`${r.pseudo}-${i}`} className="flex items-center gap-3 py-2 border-b last:border-0">
            <span className="w-7 text-center font-semibold">{medal(i)}</span>
            <span className="flex-1 truncate text-sm font-medium">{r.pseudo}</span>
            <Badge variant="secondary" className="gap-1">
              <Medal size={12} /> {r.resolus} résolus
            </Badge>
            <span className="text-xs text-muted-foreground w-16 text-right">{r.total} signal.</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CitizenLeaderboard;
