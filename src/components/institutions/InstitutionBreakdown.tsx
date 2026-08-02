import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { INSTITUTIONS } from '@/data/institutions';

interface InstitutionBreakdownProps {
  counts: Record<string, number>;
}

const InstitutionBreakdown: React.FC<InstitutionBreakdownProps> = ({ counts }) => {
  const entries = Object.entries(INSTITUTIONS).filter(([key]) => (counts[key] || 0) > 0);
  const total = entries.reduce((sum, [key]) => sum + (counts[key] || 0), 0);

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Mes signalements par institution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun signalement enregistré pour le moment.
          </p>
        ) : (
          entries.map(([key, inst]) => {
            const count = counts[key] || 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 truncate">
                    <span className="text-lg">{inst.icon}</span>
                    <span className="truncate">{inst.nom}</span>
                  </span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default InstitutionBreakdown;
