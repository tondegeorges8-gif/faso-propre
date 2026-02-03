import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { INSTITUTIONS, REPORT_STATUSES } from '@/data/institutions';
import { useFounderAccess } from '@/hooks/useFounderAccess';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Settings, 
  LogOut, 
  MapPin,
  Clock,
  Phone,
  Truck,
  CreditCard,
  Crown
} from 'lucide-react';

const logo = '/logo.png';

interface Signalement {
  id: string;
  category: string;
  subcategory: string;
  ville: string;
  quartier: string | null;
  photo_url: string | null;
  status: string;
  statut_paiement: string;
  montant_total: number;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, logout, isAuthenticated, isLoading } = useAuth();
  const { isFounder } = useFounderAccess();
  const [userSignalements, setUserSignalements] = useState<Signalement[]>([]);
  const [loadingSignalements, setLoadingSignalements] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserSignalements();
    }
  }, [user]);

  const fetchUserSignalements = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('signalements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserSignalements((data || []) as Signalement[]);
    } catch (error) {
      console.error('Error fetching signalements:', error);
    } finally {
      setLoadingSignalements(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handlePayment = (signalementId: string, amount: number) => {
    // Placeholder for Orange Money / Moov Money integration
    alert(`Paiement de ${amount} FCFA via Orange Money / Moov Money\n\nCette fonctionnalité sera bientôt disponible.`);
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

  const stats = {
    total: userSignalements.length,
    pending: userSignalements.filter(r => r.status === 'PENDING').length,
    inProgress: userSignalements.filter(r => r.status === 'IN_PROGRESS').length,
    resolved: userSignalements.filter(r => r.status === 'RESOLVED').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-card overflow-hidden">
                <img src={logo} alt="Faso Propre" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-xl font-bold">Faso Propre</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => navigate('/settings')}
              >
                <Settings size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={handleLogout}
              >
                <LogOut size={20} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card className="shadow-card animate-slide-up">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 border-4 border-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {profile.prenoms[0]}{profile.nom[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">
                  {profile.prenoms} {profile.nom}
                </h2>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Phone size={14} />
                  {profile.telephone}
                </p>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-3xl font-bold text-primary">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-3xl font-bold text-status-pending">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">En attente</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-3xl font-bold text-status-progress">{stats.inProgress}</p>
              <p className="text-sm text-muted-foreground">En cours</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-3xl font-bold text-status-resolved">{stats.resolved}</p>
              <p className="text-sm text-muted-foreground">Résolus</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button 
              className="h-auto py-4 flex flex-col gap-2 bg-primary hover:bg-primary/90"
              onClick={() => navigate('/new-report')}
            >
              <Plus size={24} />
              <span>Nouveau signalement</span>
            </Button>
            <Button 
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2 border-primary text-primary hover:bg-primary/5"
              onClick={() => navigate('/reports')}
            >
              <Clock size={24} />
              <span>Mes signalements</span>
            </Button>
          </CardContent>
        </Card>

        {/* Collector Access */}
        <Card className="shadow-card border-secondary/50">
          <CardContent className="pt-4 pb-4 space-y-3">
            <Button
              variant="outline"
              className="w-full h-auto py-4 border-secondary text-secondary-foreground hover:bg-secondary/10"
              onClick={() => navigate('/collector')}
            >
              <Truck size={24} className="mr-2" />
              <div className="text-left">
                <p className="font-medium">Espace Prestataire</p>
                <p className="text-xs opacity-70">Gérer les missions de collecte</p>
              </div>
            </Button>

            {/* Founder Access - Only visible to founders */}
            {isFounder && (
              <Button
                variant="outline"
                className="w-full h-auto py-4 border-primary text-primary hover:bg-primary/10"
                onClick={() => navigate('/founder')}
              >
                <Crown size={24} className="mr-2" />
                <div className="text-left">
                  <p className="font-medium">Espace Fondateur</p>
                  <p className="text-xs opacity-70">Tableau de bord administratif</p>
                </div>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Numéros d'urgence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(INSTITUTIONS).map(([key, institution]) => (
              <div 
                key={key}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{institution.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{institution.nom}</p>
                    <p className="text-xs text-muted-foreground">{institution.options.length} types</p>
                  </div>
                </div>
                <a 
                  href={`tel:${institution.phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-1 text-primary hover:underline text-sm"
                >
                  <Phone size={14} />
                  {institution.phone}
                </a>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Reports */}
        {userSignalements.length > 0 && (
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Signalements récents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {userSignalements.slice(0, 3).map((report) => {
                const institution = INSTITUTIONS[report.category as keyof typeof INSTITUTIONS];
                return (
                  <div 
                    key={report.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    {report.photo_url && (
                      <img 
                        src={report.photo_url} 
                        alt="Report" 
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {institution?.icon} {report.subcategory}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {report.ville}{report.quartier ? `, ${report.quartier}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(report.status)}
                      {report.statut_paiement === 'en_attente' && report.montant_total > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 border-primary text-primary"
                          onClick={() => handlePayment(report.id, report.montant_total)}
                        >
                          <CreditCard size={12} className="mr-1" />
                          Payer
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
