import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { REPORT_CATEGORIES, REPORT_STATUSES } from '@/data/burkinaFaso';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  MapPin,
  Calendar,
  CreditCard,
  Filter,
  Plus
} from 'lucide-react';

const logo = '/logo.png';

interface Signalement {
  id: string;
  category: string;
  subcategory: string;
  ville: string;
  arrondissement: string | null;
  secteur: string | null;
  quartier: string | null;
  sous_quartier: string | null;
  photo_url: string | null;
  description: string | null;
  status: string;
  statut_paiement: string;
  montant_total: number;
  commission_montant: number;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
}

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [signalements, setSignalements] = useState<Signalement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

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
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('signalements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSignalements((data || []) as Signalement[]);
    } catch (error) {
      console.error('Error fetching signalements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = (signalementId: string, amount: number) => {
    // Placeholder for Orange Money / Moov Money integration
    alert(`Paiement de ${amount} FCFA via Orange Money / Moov Money\n\nCommission plateforme (10%): ${(amount * 0.1).toFixed(0)} FCFA\nMontant collecteur: ${(amount * 0.9).toFixed(0)} FCFA\n\nCette fonctionnalité sera bientôt disponible.`);
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = REPORT_STATUSES[status as keyof typeof REPORT_STATUSES];
    if (!statusInfo) return null;
    
    return (
      <Badge 
        variant="outline" 
        className={`bg-${statusInfo.color}/10 text-${statusInfo.color} border-${statusInfo.color}/30`}
        style={{ 
          backgroundColor: `hsl(var(--${statusInfo.color}) / 0.1)`,
          color: `hsl(var(--${statusInfo.color}))`,
          borderColor: `hsl(var(--${statusInfo.color}) / 0.3)`
        }}
      >
        {statusInfo.emoji} {statusInfo.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatLocation = (sig: Signalement) => {
    const parts = [sig.ville];
    if (sig.arrondissement) parts.push(sig.arrondissement);
    if (sig.secteur) parts.push(sig.secteur);
    if (sig.quartier) parts.push(sig.quartier);
    if (sig.sous_quartier) parts.push(sig.sous_quartier);
    return parts.join(' → ');
  };

  const filteredSignalements = signalements.filter(sig => {
    if (filter === 'all') return true;
    return sig.status === filter;
  });

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
      <header className="gradient-hero text-primary-foreground shadow-lg sticky top-0 z-10">
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
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-card overflow-hidden">
                  <img src={logo} alt="Faso Propre" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-lg font-bold">Mes signalements</h1>
              </div>
            </div>
            <Badge variant="secondary" className="bg-primary-foreground/20">
              {signalements.length}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-4">
        {/* Filter Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Tous ({signalements.length})
          </Button>
          <Button
            variant={filter === 'PENDING' ? 'default' : 'outline'}
            size="sm"
            className={filter === 'PENDING' ? '' : 'border-status-pending text-status-pending'}
            onClick={() => setFilter('PENDING')}
          >
            En attente ({signalements.filter(s => s.status === 'PENDING').length})
          </Button>
          <Button
            variant={filter === 'IN_PROGRESS' ? 'default' : 'outline'}
            size="sm"
            className={filter === 'IN_PROGRESS' ? '' : 'border-status-progress text-status-progress'}
            onClick={() => setFilter('IN_PROGRESS')}
          >
            En cours ({signalements.filter(s => s.status === 'IN_PROGRESS').length})
          </Button>
          <Button
            variant={filter === 'RESOLVED' ? 'default' : 'outline'}
            size="sm"
            className={filter === 'RESOLVED' ? '' : 'border-status-resolved text-status-resolved'}
            onClick={() => setFilter('RESOLVED')}
          >
            Résolus ({signalements.filter(s => s.status === 'RESOLVED').length})
          </Button>
        </div>

        {/* Signalements List */}
        {filteredSignalements.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <Filter size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? "Vous n'avez pas encore de signalements" 
                  : "Aucun signalement avec ce statut"}
              </p>
              {filter === 'all' && (
                <Button 
                  className="mt-4"
                  onClick={() => navigate('/new-report')}
                >
                  Créer mon premier signalement
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSignalements.map((sig) => {
              const category = REPORT_CATEGORIES[sig.category as keyof typeof REPORT_CATEGORIES];
              
              return (
                <Card key={sig.id} className="shadow-card overflow-hidden">
                  <div className="flex">
                    {/* Photo */}
                    {sig.photo_url && (
                      <div className="w-28 shrink-0">
                        <img 
                          src={sig.photo_url} 
                          alt="Signalement"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">
                            {category?.icon} {sig.subcategory}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin size={12} />
                            {formatLocation(sig)}
                          </p>
                        </div>
                        {getStatusBadge(sig.status)}
                      </div>
                      
                      {sig.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {sig.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(sig.created_at)}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          {sig.latitude && sig.longitude && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2"
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
                          
                          {sig.statut_paiement === 'en_attente' && (
                            <Button
                              size="sm"
                              className="h-8"
                              onClick={() => handlePayment(sig.id, 5000)}
                            >
                              <CreditCard size={14} className="mr-1" />
                              Payer l'enlèvement
                            </Button>
                          )}
                          
                          {sig.statut_paiement === 'paye' && (
                            <Badge variant="outline" className="bg-primary/10 text-primary">
                              ✓ Payé
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* FAB */}
        <Button
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          onClick={() => navigate('/new-report')}
        >
          <Plus size={24} />
        </Button>
      </main>
    </div>
  );
};

export default Reports;
