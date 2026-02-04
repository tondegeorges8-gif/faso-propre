import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Gift, TrendingUp, ChevronRight } from 'lucide-react';

interface UserPoints {
  total_points: number;
  lifetime_earned: number;
  lifetime_spent: number;
}

interface LoyaltyPointsCardProps {
  onViewRewards?: () => void;
  compact?: boolean;
}

const LoyaltyPointsCard: React.FC<LoyaltyPointsCardProps> = ({ 
  onViewRewards,
  compact = false 
}) => {
  const { user } = useAuth();
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPoints();
    }
  }, [user]);

  const fetchPoints = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_loyalty_points')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      setPoints(data ? {
        total_points: data.total_points,
        lifetime_earned: data.lifetime_earned,
        lifetime_spent: data.lifetime_spent
      } : {
        total_points: 0,
        lifetime_earned: 0,
        lifetime_spent: 0
      });
    } catch (error) {
      console.error('Error fetching loyalty points:', error);
      setPoints({ total_points: 0, lifetime_earned: 0, lifetime_spent: 0 });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="pt-4">
          <div className="h-16 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div 
        className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20 cursor-pointer hover:bg-amber-500/20 transition-colors"
        onClick={onViewRewards}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
            <Star className="text-white" size={20} />
          </div>
          <div>
            <p className="font-bold text-lg">{points?.total_points || 0}</p>
            <p className="text-xs text-muted-foreground">Points Faso Propre</p>
          </div>
        </div>
        <ChevronRight size={20} className="text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="shadow-card overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Star size={28} />
            </div>
            <div>
              <p className="text-sm opacity-90">Vos Points Fidélité</p>
              <p className="text-3xl font-bold">{points?.total_points || 0}</p>
            </div>
          </div>
          <Badge className="bg-white/20 text-white border-0">
            Faso Propre
          </Badge>
        </div>
      </div>
      
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
              <TrendingUp size={16} />
              <span className="text-lg font-bold">{points?.lifetime_earned || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total gagné</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <Gift size={16} />
              <span className="text-lg font-bold">{points?.lifetime_spent || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground">Échangé</p>
          </div>
        </div>

        <div className="p-3 bg-accent/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">
            💡 Comment gagner des points ?
          </p>
          <ul className="text-xs space-y-1">
            <li>• +10 points par signalement payé</li>
            <li>• +50 points par parrainage</li>
            <li>• Bonus spéciaux des sponsors</li>
          </ul>
        </div>

        {onViewRewards && (
          <Button 
            className="w-full"
            variant="outline"
            onClick={onViewRewards}
          >
            <Gift size={16} className="mr-2" />
            Voir les récompenses
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default LoyaltyPointsCard;
