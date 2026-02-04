import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SponsorAd {
  id: string;
  title: string;
  description: string | null;
  banner_image_url: string | null;
  action_label: string | null;
  action_url: string | null;
  sponsor: {
    name: string;
    logo_url: string | null;
  };
}

interface SponsorBannerProps {
  institutionId?: string;
  variant?: 'banner' | 'inline' | 'compact';
  onDismiss?: () => void;
}

const SponsorBanner: React.FC<SponsorBannerProps> = ({ 
  institutionId, 
  variant = 'banner',
  onDismiss 
}) => {
  const [ad, setAd] = useState<SponsorAd | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchRelevantAd();
  }, [institutionId]);

  const fetchRelevantAd = async () => {
    try {
      let query = supabase
        .from('sponsor_ads')
        .select(`
          id,
          title,
          description,
          banner_image_url,
          action_label,
          action_url,
          sponsor:sponsors(name, logo_url)
        `)
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .limit(1);

      // Filter by institution if provided
      if (institutionId) {
        query = query.or(`target_institutions.cs.{${institutionId}},target_institutions.is.null`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      if (data && data.length > 0) {
        const adData = data[0];
        setAd({
          ...adData,
          sponsor: Array.isArray(adData.sponsor) ? adData.sponsor[0] : adData.sponsor
        } as SponsorAd);
      }
    } catch (error) {
      console.error('Error fetching sponsor ad:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (!ad) return;
    
    if (ad.action_url) {
      window.open(ad.action_url, '_blank');
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (loading || !ad || dismissed) return null;

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 p-2 bg-accent/30 rounded-lg text-xs">
        <span className="text-muted-foreground">Sponsorisé par</span>
        <span className="font-medium">{ad.sponsor?.name}</span>
        {ad.action_label && (
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-6 text-xs px-2"
            onClick={handleClick}
          >
            {ad.action_label}
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-accent/50 to-accent/30 rounded-lg border border-accent">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-card rounded-full flex items-center justify-center text-lg">
            💡
          </div>
          <div>
            <p className="text-sm font-medium">{ad.title}</p>
            <p className="text-xs text-muted-foreground">
              Par {ad.sponsor?.name}
            </p>
          </div>
        </div>
        {ad.action_label && (
          <Button size="sm" variant="outline" onClick={handleClick}>
            {ad.action_label}
            <ExternalLink size={12} className="ml-1" />
          </Button>
        )}
      </div>
    );
  }

  // Default banner variant
  return (
    <div className="relative bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/20 rounded-xl p-4 border border-primary/20 overflow-hidden">
      {/* Dismiss button */}
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
      >
        <X size={14} className="text-muted-foreground" />
      </button>
      
      <div className="flex items-start gap-4">
        {ad.banner_image_url ? (
          <img 
            src={ad.banner_image_url} 
            alt={ad.sponsor?.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
        ) : (
          <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center text-2xl">
            📢
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
              Sponsorisé
            </span>
            <span className="text-xs text-muted-foreground">
              {ad.sponsor?.name}
            </span>
          </div>
          
          <h3 className="font-semibold text-sm mb-1">{ad.title}</h3>
          
          {ad.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {ad.description}
            </p>
          )}
          
          {ad.action_label && (
            <Button 
              size="sm" 
              className="h-8 text-xs"
              onClick={handleClick}
            >
              {ad.action_label}
              <ExternalLink size={12} className="ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SponsorBanner;
