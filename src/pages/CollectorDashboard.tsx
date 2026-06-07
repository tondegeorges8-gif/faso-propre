import React, { useState, useEffect } from 'react';
import SignedImage from '@/components/ui/SignedImage';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { sendWebhook } from '@/lib/webhook';
import { 
  ArrowLeft,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  Wallet,
  Phone
} from 'lucide-react';

const logo = '/logo.png';

interface Signalement {
  id: string;
  nom_complet: string;
  category: string;
  subcategory: string;
  ville: string;
  arrondissement: string | null;
  secteur: string | null;
  quartier: string | null;
  photo_url: string | null;
  status: string;
  statut_paiement: string;
  montant_total: number;
  commission_montant: number;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
}

const CollectorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [signalements, setSignalements] = useState<Signalement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    assigned: 0,
    completed: 0,
    totalEarnings: 0,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchSignalements();
    }
  }, [user]);

  const fetchSignalements = async () => {
    setIsLoading(true);
    try {
      // Fetch paid signalements (collectors can see these)
      const { data, error } = await supabase
        .from('signalements')
        .select('*')
        .eq('statut_paiement', 'paye')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const signalementsData = (data || []) as Signalement[];
      setSignalements(signalementsData);

      // Calculate stats
      setStats({
        pending: signalementsData.filter(s => s.status === 'PENDING').length,
        assigned: signalementsData.filter(s => s.status === 'IN_PROGRESS').length,
        completed: signalementsData.filter(s => s.status === 'RESOLVED').length,
        totalEarnings: signalementsData
          .filter(s => s.status === 'RESOLVED')
          .reduce((acc, s) => acc + (s.montant_total - s.commission_montant), 0),
      });
    } catch (error) {
      console.error('Error fetching signalements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptMission = async (signalementId: string) => {
    try {
      const { error } = await supabase
        .from('signalements')
        .update({ status: 'IN_PROGRESS' })
        .eq('id', signalementId);

      if (error) throw error;
      fetchSignalements();
    } catch (error) {
      console.error('Error accepting mission:', error);
    }
  };

  const handleCompleteMission = async (signalementId: string) => {
    try {
      const { error } = await supabase
        .from('signalements')
        .update({ status: 'RESOLVED' })
        .eq('id', signalementId);

      if (error) throw error;
      fetchSignalements();
    } catch (error) {
      console.error('Error completing mission:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: { label: '⏳ En attente', className: 'bg-status-pending/10 text-status-pending' },
      IN_PROGRESS: { label: '🚛 En cours', className: 'bg-status-progress/10 text-status-progress' },
      RESOLVED: { label: '✅ Terminé', className: 'bg-status-resolved/10 text-status-resolved' },
    };
    const info = statusMap[status] || statusMap.PENDING;
    return <Badge variant="outline" className={info.className}>{info.label}</Badge>;
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-secondary-foreground/10"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft size={20} />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-card overflow-hidden">
                  <img src={logo} alt="Faso Propre" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Espace Collecteur</h1>
                  <p className="text-xs opacity-80">Missions de collecte</p>
                </div>
              </div>
            </div>
            <Truck size={24} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="pt-4 pb-4 text-center">
              <Clock size={24} className="mx-auto text-status-pending mb-2" />
              <p className="text-2xl font-bold text-status-pending">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">En attente</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-4 pb-4 text-center">
              <Truck size={24} className="mx-auto text-status-progress mb-2" />
              <p className="text-2xl font-bold text-status-progress">{stats.assigned}</p>
              <p className="text-xs text-muted-foreground">En cours</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-4 pb-4 text-center">
              <CheckCircle size={24} className="mx-auto text-status-resolved mb-2" />
              <p className="text-2xl font-bold text-status-resolved">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Terminés</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-4 pb-4 text-center">
              <Wallet size={24} className="mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-primary">{stats.totalEarnings.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">FCFA gagnés</p>
            </CardContent>
          </Card>
        </div>

        {/* Available Missions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Missions disponibles</CardTitle>
            <CardDescription>Signalements payés en attente de collecte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {signalements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Truck size={48} className="mx-auto opacity-30 mb-3" />
                <p>Aucune mission disponible pour le moment</p>
                <p className="text-sm mt-1">Les nouvelles missions apparaîtront ici</p>
              </div>
            ) : (
              signalements.map((sig) => (
                <div key={sig.id} className="border rounded-lg overflow-hidden">
                  <div className="flex gap-3 p-3">
                    {sig.photo_url && (
                      <SignedImage 
                        bucket="signalements-photos"
                        path={sig.photo_url}
                        alt="Signalement"
                        className="w-20 h-20 object-cover rounded-lg shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{sig.subcategory}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin size={12} />
                            {sig.ville}
                            {sig.quartier && `, ${sig.quartier}`}
                          </p>
                        </div>
                        {getStatusBadge(sig.status)}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(sig.created_at)}
                        </p>
                        <p className="text-sm font-semibold text-primary">
                          {(sig.montant_total - sig.commission_montant).toLocaleString()} FCFA
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t bg-muted/30 px-3 py-2 flex gap-2">
                    {sig.status === 'PENDING' && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAcceptMission(sig.id)}
                      >
                        <Truck size={14} className="mr-1" />
                        Accepter
                      </Button>
                    )}
                    {sig.status === 'IN_PROGRESS' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-status-resolved text-status-resolved"
                        onClick={() => handleCompleteMission(sig.id)}
                      >
                        <CheckCircle size={14} className="mr-1" />
                        Marquer terminé
                      </Button>
                    )}
                    {sig.latitude && sig.longitude && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          window.open(
                            `https://www.google.com/maps?q=${sig.latitude},${sig.longitude}`,
                            '_blank'
                          );
                        }}
                      >
                        <MapPin size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Commission Info */}
        <Card className="shadow-card border-primary/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Wallet size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-medium">Commission Faso Propre</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Une commission de <span className="font-semibold text-primary">10%</span> est 
                  prélevée sur chaque mission terminée pour maintenir la plateforme.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CollectorDashboard;
