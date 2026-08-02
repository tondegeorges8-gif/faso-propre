import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { REPORT_STATUSES } from '@/data/institutions';
import { History, Loader2 } from 'lucide-react';

interface StatusHistoryEntry {
  id: string;
  old_status: string | null;
  new_status: string;
  created_at: string;
}

const label = (status: string | null) => {
  if (!status) return 'Création';
  const info = REPORT_STATUSES[status as keyof typeof REPORT_STATUSES];
  return info ? `${info.emoji} ${info.label}` : status;
};

const StatusHistory: React.FC<{ signalementId: string }> = ({ signalementId }) => {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<StatusHistoryEntry[] | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && entries === null) {
      setLoading(true);
      const { data, error } = await supabase
        .from('signalement_status_history')
        .select('id, old_status, new_status, created_at')
        .eq('signalement_id', signalementId)
        .order('created_at', { ascending: true });
      if (error) console.error('Status history error:', error);
      setEntries((data as StatusHistoryEntry[]) ?? []);
      setLoading(false);
    }
  };

  return (
    <div>
      <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={toggle}>
        <History size={14} className="mr-1" />
        {open ? 'Masquer l’historique' : 'Historique du statut'}
      </Button>

      {open && (
        <div className="mt-2 pl-3 border-l-2 border-primary/30 space-y-2">
          {loading && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" /> Chargement…
            </p>
          )}
          {!loading && entries?.length === 0 && (
            <p className="text-xs text-muted-foreground">Aucun changement enregistré</p>
          )}
          {!loading &&
            entries?.map((e) => (
              <div key={e.id} className="text-xs">
                <p className="font-medium">
                  {e.old_status ? `${label(e.old_status)} → ${label(e.new_status)}` : label(e.new_status)}
                </p>
                <p className="text-muted-foreground">
                  {new Date(e.created_at).toLocaleString('fr-FR')}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default StatusHistory;
