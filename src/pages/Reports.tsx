import React, { useState, useEffect } from 'react';
import SignedImage from '@/components/ui/SignedImage';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { INSTITUTIONS, REPORT_STATUSES } from '@/data/institutions';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSignedUrl } from '@/hooks/useSignedUrl';
import { 
  ArrowLeft, 
  MapPin,
  Calendar,
  Filter,
  Trash2,
  Mic,
  ExternalLink
} from 'lucide-react';
import BottomNavigation from '@/components/navigation/BottomNavigation';

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
  audio_url: string | null;
  description: string | null;
  status: string;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  nom_complet: string;
}

// Component to play audio from signed URL
const AudioPlayer: React.FC<{ path: string }> = ({ path }) => {
  const url = useSignedUrl('signalements-audio', path);
  if (!url) return null;
  return <audio src={url} controls className="w-full h-8" />;
};

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
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

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('signalements-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'signalements',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newSig = payload.new as Signalement;
            if (newSig.user_id === user.id) {
              setSignalements(prev => [newSig, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            setSignalements(prev =>
              prev.map(s => s.id === (payload.new as any).id ? { ...s, ...payload.new } as Signalement : s)
            );
          } else if (payload.eventType === 'DELETE') {
            setSignalements(prev => prev.filter(s => s.id !== (payload.old as any).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  const handleDelete = async (sig: Signalement) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce signalement ?')) return;

    try {
      // Delete photo from storage
      if (sig.photo_url) {
        await supabase.storage.from('signalements-photos').remove([sig.photo_url]);
      }
      // Delete audio from storage
      if (sig.audio_url) {
        await supabase.storage.from('signalements-audio').remove([sig.audio_url]);
      }

      const { error } = await supabase
        .from('signalements')
        .delete()
        .eq('id', sig.id)
        .eq('user_id', user!.id);

      if (error) throw error;

      setSignalements(prev => prev.filter(s => s.id !== sig.id));
      toast({ title: 'Signalement supprimé' });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer ce signalement',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = REPORT_STATUSES[status as keyof typeof REPORT_STATUSES];
    if (!statusInfo) return null;
    
    return (
      <Badge 
        variant="outline" 
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
    <div className="min-h-screen bg-background pb-20">
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
              const institution = INSTITUTIONS[sig.category as keyof typeof INSTITUTIONS];
              
              return (
                <Card key={sig.id} className="shadow-card overflow-hidden">
                  {/* Photo */}
                  {sig.photo_url && (
                    <div className="w-full h-48">
                      <SignedImage 
                        bucket="signalements-photos"
                        path={sig.photo_url}
                        alt="Signalement"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <CardContent className="p-4 space-y-3">
                    {/* Header: category + status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">
                          {institution?.icon} {sig.subcategory}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {institution?.nom}
                        </p>
                      </div>
                      {getStatusBadge(sig.status)}
                    </div>

                    {/* Location details */}
                    <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <MapPin size={14} className="text-primary" />
                        Localisation
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatLocation(sig)}
                      </p>
                      {sig.latitude && sig.longitude && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs text-primary"
                          onClick={() => {
                            window.open(
                              `https://www.google.com/maps?q=${sig.latitude},${sig.longitude}`,
                              '_blank'
                            );
                          }}
                        >
                          <ExternalLink size={12} className="mr-1" />
                          Voir sur la carte
                        </Button>
                      )}
                    </div>

                    {/* Description */}
                    {sig.description && (
                      <p className="text-sm text-muted-foreground">
                        {sig.description}
                      </p>
                    )}

                    {/* Audio playback */}
                    {sig.audio_url && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs font-medium flex items-center gap-1 mb-2">
                          <Mic size={12} className="text-primary" />
                          Message audio
                        </p>
                        <AudioPlayer path={sig.audio_url} />
                      </div>
                    )}
                    
                    {/* Footer: date + actions */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(sig.created_at)}
                      </p>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(sig)}
                      >
                        <Trash2 size={14} className="mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Reports;
