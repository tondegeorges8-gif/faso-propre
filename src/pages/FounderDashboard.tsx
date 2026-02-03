import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFounderAccess } from '@/hooks/useFounderAccess';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BalanceCard from '@/components/founder/BalanceCard';
import WithdrawalForm from '@/components/founder/WithdrawalForm';
import TransactionHistory from '@/components/founder/TransactionHistory';
import InstitutionStats from '@/components/founder/InstitutionStats';
import { 
  ArrowLeft, 
  Shield, 
  Wallet, 
  Building2, 
  History,
  AlertTriangle
} from 'lucide-react';

const logo = '/logo.png';

interface FounderBalance {
  current_balance: number;
  total_inscriptions: number;
  total_inscription_gains: number;
  total_commissions: number;
  total_withdrawn: number;
}

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

interface InstitutionStat {
  institution_id: string;
  total_signalements: number;
  paid_signalements: number;
  total_revenue: number;
}

const FounderDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { isFounder, isLoading: founderLoading } = useFounderAccess();
  
  const [balance, setBalance] = useState<FounderBalance>({
    current_balance: 0,
    total_inscriptions: 0,
    total_inscription_gains: 0,
    total_commissions: 0,
    total_withdrawn: 0
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [institutionStats, setInstitutionStats] = useState<InstitutionStat[]>([]);
  const [loading, setLoading] = useState(true);

  const isLoading = authLoading || founderLoading;

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (!isLoading && user && isFounder) {
      fetchFounderData();
    }
  }, [user, isFounder, isLoading]);

  const fetchFounderData = async () => {
    try {
      // Fetch balance from view
      const { data: balanceData } = await supabase
        .from('founder_balance')
        .select('*')
        .single();

      if (balanceData) {
        setBalance({
          current_balance: Number(balanceData.current_balance) || 0,
          total_inscriptions: Number(balanceData.total_inscriptions) || 0,
          total_inscription_gains: Number(balanceData.total_inscription_gains) || 0,
          total_commissions: Number(balanceData.total_commissions) || 0,
          total_withdrawn: Number(balanceData.total_withdrawn) || 0
        });
      }

      // Fetch transactions
      const { data: txData } = await supabase
        .from('founder_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (txData) {
        setTransactions(txData as Transaction[]);
      }

      // Fetch institution stats from signalements
      const { data: signalements } = await supabase
        .from('signalements')
        .select('category, statut_paiement, montant_total');

      if (signalements) {
        const statsMap = new Map<string, InstitutionStat>();
        
        signalements.forEach((s) => {
          const existing = statsMap.get(s.category) || {
            institution_id: s.category,
            total_signalements: 0,
            paid_signalements: 0,
            total_revenue: 0
          };
          
          existing.total_signalements++;
          if (s.statut_paiement === 'paye') {
            existing.paid_signalements++;
            existing.total_revenue += Number(s.montant_total) || 0;
          }
          
          statsMap.set(s.category, existing);
        });
        
        setInstitutionStats(Array.from(statsMap.values()));
      }
    } catch (error) {
      console.error('Error fetching founder data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (amount: number, phone: string, network: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('founder_transactions')
        .insert({
          transaction_type: 'withdrawal',
          amount,
          withdrawal_phone: phone,
          withdrawal_network: network,
          withdrawal_status: 'pending',
          description: `Retrait ${network === 'orange_money' ? 'Orange Money' : 'Moov Money'} vers ${phone}`
        });

      if (error) throw error;

      // Refresh data
      await fetchFounderData();
      return true;
    } catch (error) {
      console.error('Withdrawal error:', error);
      return false;
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Vérification des accès...</p>
        </div>
      </div>
    );
  }

  // Access denied screen
  if (!isFounder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-destructive" size={40} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Accès Refusé</h1>
          <p className="text-muted-foreground mb-6">
            Cette page est réservée exclusivement au fondateur de la plateforme.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={18} className="mr-2" />
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary via-primary/90 to-secondary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft size={20} />
              </Button>
              <div className="w-10 h-10 rounded-full bg-card overflow-hidden">
                <img src={logo} alt="Faso Propre" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Tableau de Bord Fondateur</h1>
                <p className="text-xs opacity-80 flex items-center gap-1">
                  <Shield size={12} />
                  Accès Ultra-Privé
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="balance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="balance" className="flex items-center gap-2">
              <Wallet size={16} />
              <span className="hidden sm:inline">Solde</span>
            </TabsTrigger>
            <TabsTrigger value="institutions" className="flex items-center gap-2">
              <Building2 size={16} />
              <span className="hidden sm:inline">Institutions</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History size={16} />
              <span className="hidden sm:inline">Historique</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="balance" className="space-y-6">
            <BalanceCard
              currentBalance={balance.current_balance}
              totalInscriptions={balance.total_inscriptions}
              totalInscriptionGains={balance.total_inscription_gains}
              totalCommissions={balance.total_commissions}
              totalWithdrawn={balance.total_withdrawn}
            />
            <WithdrawalForm 
              currentBalance={balance.current_balance}
              onWithdraw={handleWithdraw}
            />
          </TabsContent>

          <TabsContent value="institutions">
            <InstitutionStats stats={institutionStats} />
          </TabsContent>

          <TabsContent value="history">
            <TransactionHistory transactions={transactions} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default FounderDashboard;
