import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, ArrowUpRight, ArrowDownLeft, Percent } from 'lucide-react';

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  description: string | null;
  withdrawal_phone: string | null;
  withdrawal_network: string | null;
  withdrawal_status: string | null;
  created_at: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'inscription_gain':
        return <ArrowDownLeft className="text-green-600" size={18} />;
      case 'commission':
        return <Percent className="text-blue-600" size={18} />;
      case 'withdrawal':
        return <ArrowUpRight className="text-orange-600" size={18} />;
      default:
        return <History size={18} />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'inscription_gain':
        return 'Inscription';
      case 'commission':
        return 'Commission';
      case 'withdrawal':
        return 'Retrait';
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'secondary', label: 'En attente' },
      completed: { variant: 'default', label: 'Complété' },
      failed: { variant: 'destructive', label: 'Échoué' }
    };
    
    const config = variants[status] || { variant: 'outline' as const, label: status };
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <History size={20} />
          Historique des transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History size={40} className="mx-auto mb-2 opacity-50" />
              <p>Aucune transaction pour le moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div 
                  key={tx.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="p-2 rounded-full bg-background">
                    {getTransactionIcon(tx.transaction_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {getTransactionLabel(tx.transaction_type)}
                      </span>
                      {tx.withdrawal_status && getStatusBadge(tx.withdrawal_status)}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {tx.description || (tx.withdrawal_phone ? `${tx.withdrawal_network} - ${tx.withdrawal_phone}` : '')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(tx.created_at)}
                    </p>
                  </div>
                  <div className={`font-semibold text-sm ${
                    tx.transaction_type === 'withdrawal' ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {tx.transaction_type === 'withdrawal' ? '-' : '+'}
                    {formatMoney(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
