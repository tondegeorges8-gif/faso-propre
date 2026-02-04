import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Gift, Star, ShoppingBag, Check, AlertCircle } from 'lucide-react';

interface Reward {
  id: string;
  name: string;
  description: string | null;
  points_cost: number;
  image_url: string | null;
  stock_quantity: number | null;
  sponsor: {
    name: string;
    logo_url: string | null;
  } | null;
}

interface RewardsShopProps {
  userPoints: number;
  onRedemption?: () => void;
}

const RewardsShop: React.FC<RewardsShopProps> = ({ userPoints, onRedemption }) => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('loyalty_rewards')
        .select(`
          id,
          name,
          description,
          points_cost,
          image_url,
          stock_quantity,
          sponsor:sponsors(name, logo_url)
        `)
        .eq('is_active', true)
        .order('points_cost', { ascending: true });

      if (error) throw error;
      
      setRewards((data || []).map(r => ({
        ...r,
        sponsor: Array.isArray(r.sponsor) ? r.sponsor[0] : r.sponsor
      })) as Reward[]);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!user || !selectedReward) return;
    
    if (userPoints < selectedReward.points_cost) {
      toast.error('Points insuffisants pour cette récompense');
      return;
    }

    setRedeeming(true);
    
    try {
      // Get current points data
      const { data: currentData } = await supabase
        .from('user_loyalty_points')
        .select('lifetime_spent')
        .eq('user_id', user.id)
        .single();

      // Deduct points
      const { error: pointsError } = await supabase
        .from('user_loyalty_points')
        .update({ 
          total_points: userPoints - selectedReward.points_cost,
          lifetime_spent: (currentData?.lifetime_spent || 0) + selectedReward.points_cost
        })
        .eq('user_id', user.id);

      if (pointsError) throw pointsError;

      // Log transaction
      const { error: txError } = await supabase
        .from('loyalty_transactions')
        .insert({
          user_id: user.id,
          points: -selectedReward.points_cost,
          transaction_type: 'redemption',
          description: `Échange: ${selectedReward.name}`
        });

      if (txError) throw txError;

      toast.success(`Félicitations ! Vous avez échangé "${selectedReward.name}"`);
      setSelectedReward(null);
      onRedemption?.();
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.error('Erreur lors de l\'échange');
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-4">
              <div className="h-24 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <Card className="shadow-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShoppingBag size={20} />
            Boutique Récompenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg mb-4">
            <span className="text-sm">Votre solde</span>
            <div className="flex items-center gap-1">
              <Star size={16} className="text-amber-500" />
              <span className="font-bold">{userPoints} points</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {rewards.map(reward => {
          const canAfford = userPoints >= reward.points_cost;
          const outOfStock = reward.stock_quantity !== null && reward.stock_quantity <= 0;
          
          return (
            <Card 
              key={reward.id} 
              className={`shadow-card overflow-hidden transition-all ${
                canAfford && !outOfStock ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'
              }`}
              onClick={() => canAfford && !outOfStock && setSelectedReward(reward)}
            >
              <div className="aspect-square bg-muted relative">
                {reward.image_url ? (
                  <img 
                    src={reward.image_url} 
                    alt={reward.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Gift size={40} className="text-muted-foreground" />
                  </div>
                )}
                
                {reward.sponsor && (
                  <Badge 
                    variant="secondary" 
                    className="absolute top-2 left-2 text-xs"
                  >
                    {reward.sponsor.name}
                  </Badge>
                )}
                
                {outOfStock && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Badge variant="destructive">Épuisé</Badge>
                  </div>
                )}
              </div>
              
              <CardContent className="p-3">
                <h3 className="font-medium text-sm line-clamp-2 mb-2">
                  {reward.name}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-600">
                    <Star size={14} />
                    <span className="font-bold text-sm">{reward.points_cost}</span>
                  </div>
                  {canAfford && !outOfStock ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <AlertCircle size={16} className="text-muted-foreground" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {rewards.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <Gift size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Aucune récompense disponible pour le moment
            </p>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={!!selectedReward} onOpenChange={() => setSelectedReward(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'échange</DialogTitle>
            <DialogDescription>
              Voulez-vous échanger {selectedReward?.points_cost} points contre cette récompense ?
            </DialogDescription>
          </DialogHeader>
          
          {selectedReward && (
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-1">{selectedReward.name}</h3>
              {selectedReward.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedReward.description}
                </p>
              )}
              <div className="flex items-center gap-1 text-amber-600">
                <Star size={16} />
                <span className="font-bold">{selectedReward.points_cost} points</span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReward(null)}>
              Annuler
            </Button>
            <Button onClick={handleRedeem} disabled={redeeming}>
              {redeeming ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  Échange...
                </>
              ) : (
                <>
                  <Gift size={16} className="mr-2" />
                  Confirmer l'échange
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RewardsShop;
