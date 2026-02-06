import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFounderAccess } from '@/hooks/useFounderAccess';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BalanceCard from '@/components/founder/BalanceCard';
import WithdrawalForm from '@/components/founder/WithdrawalForm';
import TransactionHistory from '@/components/founder/TransactionHistory';
import InstitutionStats from '@/components/founder/InstitutionStats';
import FounderLockScreen from '@/components/founder/FounderLockScreen';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { 
  ArrowLeft, 
  Shield, 
  Wallet, 
  Building2, 
  History,
  AlertTriangle,
  Users,
  Star,
  TrendingUp,
  FileText
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
  
  // Écran de verrouillage
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem('founder_access') === 'granted';
  });
  
  const [balance, setBalance] = useState<FounderBalance>({
    current_balance: 0,
    total_inscriptions: 0,
    total_inscription_gains: 0,
    total_commissions: 0,
    total_withdrawn: 0
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [institutionStats, setInstitutionStats] = useState<InstitutionStat[]>([]);
  const [last30DaysStats, setLast30DaysStats] = useState({
    totalCollectes: 0,
    totalRevenus: 0
  });
  const [loading, setLoading] = useState(true);

  const isLoading = authLoading || founderLoading;

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (!isLoading && user && isFounder && isUnlocked) {
      fetchFounderData();
    }
  }, [user, isFounder, isLoading, isUnlocked]);

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
        .select('category, statut_paiement, montant_total, created_at');

      if (signalements) {
        const statsMap = new Map<string, InstitutionStat>();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        let collectes30Days = 0;
        let revenus30Days = 0;
        
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
          
          // Stats 30 derniers jours
          if (new Date(s.created_at) >= thirtyDaysAgo) {
            collectes30Days++;
            if (s.statut_paiement === 'paye') {
              revenus30Days += Number(s.montant_total) || 0;
            }
          }
        });
        
        setInstitutionStats(Array.from(statsMap.values()));
        setLast30DaysStats({
          totalCollectes: collectes30Days,
          totalRevenus: revenus30Days
        });
      }
    } catch (error) {
      console.error('Error fetching founder data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (amount: number, phone: string, network: string): Promise<boolean> => {
    const networkLabels: Record<string, string> = {
      orange_money: 'Orange Money',
      moov_money: 'Moov Money',
      telecel_faso: 'Telecel Faso',
      wave_burkina: 'Wave Burkina',
      coris_bank: 'Coris Bank International'
    };
    
    try {
      const { error } = await supabase
        .from('founder_transactions')
        .insert({
          transaction_type: 'withdrawal',
          amount,
          withdrawal_phone: phone,
          withdrawal_network: network,
          withdrawal_status: 'pending',
          description: `Retrait ${networkLabels[network] || network} vers ${phone}`
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

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  if (isLoading) {
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

  // Écran de verrouillage
  if (!isUnlocked) {
    return <FounderLockScreen onUnlock={() => setIsUnlocked(true)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary via-primary/90 to-secondary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Solde actuel - Cliquable */}
        <Card 
          className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => navigate('/founder')}
        >
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <Wallet size={28} />
              </div>
              <div>
                <p className="text-sm opacity-80">💰 Mon Solde Actuel</p>
                <p className="text-3xl font-bold">{formatMoney(balance.current_balance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Admin Links */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col gap-2"
            onClick={() => navigate('/sponsors')}
          >
            <Users size={24} />
            <span className="text-sm">Gérer Partenaires</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col gap-2"
            onClick={() => navigate('/loyalty')}
          >
            <Star size={24} />
            <span className="text-sm">Programme Fidélité</span>
          </Button>
        </div>

        {/* Historique 30 jours */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp size={20} />
              📅 Historique (30 derniers jours)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                <span className="text-sm">Collectes totales</span>
              </div>
              <span className="font-bold text-lg">{last30DaysStats.totalCollectes} signalements</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Wallet size={18} className="text-status-resolved" />
                <span className="text-sm">Revenus générés</span>
              </div>
              <span className="font-bold text-lg text-status-resolved">{formatMoney(last30DaysStats.totalRevenus)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Onglets */}
        <Tabs defaultValue="retrait" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="retrait" className="flex items-center gap-2">
              <Wallet size={16} />
              <span className="hidden sm:inline">Retrait</span>
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

          <TabsContent value="retrait" className="space-y-6">
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

      <BottomNavigation />
    </div>
  );
};

export default FounderDashboard;
