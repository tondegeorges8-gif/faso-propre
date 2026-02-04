import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoyaltyPointsCard from '@/components/loyalty/LoyaltyPointsCard';
import RewardsShop from '@/components/loyalty/RewardsShop';
import { ArrowLeft, Star, Gift, History, TrendingUp, TrendingDown } from 'lucide-react';

interface Transaction {
  id: string;
  points: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
}

const logo = '/logo.png';

const LoyaltyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [userPoints, setUserPoints] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      // Fetch points
      const { data: pointsData } = await supabase
        .from('user_loyalty_points')
        .select('total_points')
        .eq('user_id', user.id)
        .maybeSingle();

      setUserPoints(pointsData?.total_points || 0);

      // Fetch transactions
      const { data: txData } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      setTransactions((txData || []) as Transaction[]);
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string, points: number) => {
    if (points > 0) {
      return <TrendingUp size={16} className="text-green-500" />;
    }
    return <TrendingDown size={16} className="text-red-500" />;
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'signalement': return 'Signalement';
      case 'referral': return 'Parrainage';
      case 'redemption': return 'Échange';
      case 'bonus': return 'Bonus';
      default: return type;
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft size={20} />
              </Button>
              <div className="w-10 h-10 rounded-full bg-white overflow-hidden">
                <img src={logo} alt="Faso Propre" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Points Fidélité</h1>
                <p className="text-xs opacity-80">Faso Propre Rewards</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
              <Star size={16} />
              <span className="font-bold">{userPoints}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="rewards" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Star size={16} />
              <span className="hidden sm:inline">Aperçu</span>
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Gift size={16} />
              <span className="hidden sm:inline">Récompenses</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History size={16} />
              <span className="hidden sm:inline">Historique</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <LoyaltyPointsCard onViewRewards={() => {}} />
          </TabsContent>

          <TabsContent value="rewards">
            <RewardsShop 
              userPoints={userPoints} 
              onRedemption={fetchData}
            />
          </TabsContent>

          <TabsContent value="history">
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <History size={20} />
                  Historique des points
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Star size={40} className="mx-auto mb-2 opacity-50" />
                    <p>Aucune transaction pour le moment</p>
                    <p className="text-sm">Faites un signalement pour gagner vos premiers points !</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map(tx => (
                      <div 
                        key={tx.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center">
                            {getTransactionIcon(tx.transaction_type, tx.points)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {getTransactionLabel(tx.transaction_type)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {tx.description || formatDate(tx.created_at)}
                            </p>
                          </div>
                        </div>
                        <span className={`font-bold ${tx.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.points > 0 ? '+' : ''}{tx.points}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default LoyaltyPage;
