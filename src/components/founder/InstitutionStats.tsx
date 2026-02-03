import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building2, FileText, CreditCard } from 'lucide-react';
import { INSTITUTIONS } from '@/data/institutions';

interface InstitutionStat {
  institution_id: string;
  total_signalements: number;
  paid_signalements: number;
  total_revenue: number;
}

interface InstitutionStatsProps {
  stats: InstitutionStat[];
}

const InstitutionStats: React.FC<InstitutionStatsProps> = ({ stats }) => {
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 size={20} />
          Statistiques par Institution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {Object.values(INSTITUTIONS).map((institution) => {
              const stat = stats.find(s => s.institution_id === institution.id) || {
                institution_id: institution.id,
                total_signalements: 0,
                paid_signalements: 0,
                total_revenue: 0
              };

              return (
                <div 
                  key={institution.id}
                  className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                      style={{ backgroundColor: institution.couleur + '20' }}
                    >
                      {institution.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold">{institution.nom}</h4>
                      <p className="text-xs text-muted-foreground">{institution.phone}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded bg-muted/50">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <FileText size={12} />
                        <span className="text-xs">Total</span>
                      </div>
                      <p className="font-bold text-lg">{stat.total_signalements}</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <CreditCard size={12} />
                        <span className="text-xs">Payés</span>
                      </div>
                      <p className="font-bold text-lg text-green-600">{stat.paid_signalements}</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <span className="text-xs">Revenus</span>
                      </div>
                      <p className="font-bold text-sm text-primary">{formatMoney(stat.total_revenue)}</p>
                    </div>
                  </div>

                  {/* Options disponibles */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {institution.options.slice(0, 3).map((option, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {option}
                      </Badge>
                    ))}
                    {institution.options.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{institution.options.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default InstitutionStats;
