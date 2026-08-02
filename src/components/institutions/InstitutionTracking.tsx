import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { INSTITUTIONS } from '@/data/institutions';
import { Building2 } from 'lucide-react';

export interface TrackedSignalement {
  category: string;
  status: string;
}

interface Props {
  signalements: TrackedSignalement[];
}

const InstitutionTracking: React.FC<Props> = ({ signalements }) => {
  const stats = Object.entries(
    signalements.reduce<Record<string, { total: number; resolved: number; inProgress: number; pending: number }>>(
      (acc, s) => {
        const entry = acc[s.category] || { total: 0, resolved: 0, inProgress: 0, pending: 0 };
        entry.total += 1;
        if (s.status === 'RESOLVED') entry.resolved += 1;
        else if (s.status === 'IN_PROGRESS') entry.inProgress += 1;
        else if (s.status === 'PENDING') entry.pending += 1;
        acc[s.category] = entry;
        return acc;
      },
      {}
    )
  ).sort((a, b) => b[1].total - a[1].total);

  if (stats.length === 0) return null;

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 size={18} className="text-primary" />
          Suivi par institution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map(([key, s]) => {
          const inst = INSTITUTIONS[key as keyof typeof INSTITUTIONS];
          const rate = Math.round((s.resolved / s.total) * 100);
          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium flex items-center gap-2 min-w-0">
                  <span>{inst?.icon ?? '🏛️'}</span>
                  <span className="truncate">{inst?.nom ?? key}</span>
                </p>
                <span className="text-xs text-muted-foreground shrink-0">
                  {s.resolved}/{s.total} résolus
                </span>
              </div>
              <Progress value={rate} className="h-2" />
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span className="text-status-pending">En attente : {s.pending}</span>
                <span className="text-status-progress">En cours : {s.inProgress}</span>
                <span className="text-status-resolved">{rate}% résolus</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default InstitutionTracking;
