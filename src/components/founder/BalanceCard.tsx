import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, Users, Percent } from 'lucide-react';

interface BalanceCardProps {
  currentBalance: number;
  totalInscriptions: number;
  totalInscriptionGains: number;
  totalCommissions: number;
  totalWithdrawn: number;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  currentBalance,
  totalInscriptions,
  totalInscriptionGains,
  totalCommissions,
  totalWithdrawn
}) => {
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  return (
    <div className="space-y-4">
      {/* Main Balance Card */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet size={24} />
            Mon Solde
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{formatMoney(currentBalance)}</p>
          <p className="text-sm opacity-80 mt-1">Solde disponible pour retrait</p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="shadow-card">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users size={16} />
              <span className="text-xs">Inscriptions</span>
            </div>
            <p className="text-2xl font-bold text-primary">{totalInscriptions}</p>
            <p className="text-xs text-muted-foreground">+500 FCFA/user</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp size={16} />
              <span className="text-xs">Gains Inscriptions</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{formatMoney(totalInscriptionGains)}</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Percent size={16} />
              <span className="text-xs">Commissions 10%</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{formatMoney(totalCommissions)}</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Wallet size={16} />
              <span className="text-xs">Total Retiré</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{formatMoney(totalWithdrawn)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BalanceCard;
