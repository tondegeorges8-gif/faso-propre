import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface GPSCaptureProps {
  latitude: number | null;
  longitude: number | null;
  onCapture: (lat: number, lng: number) => void;
  onError?: (error: string) => void;
}

const GPSCapture: React.FC<GPSCaptureProps> = ({ 
  latitude, 
  longitude, 
  onCapture, 
  onError 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = () => {
    if (!navigator.geolocation) {
      const errorMsg = 'La géolocalisation n\'est pas supportée par votre navigateur';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onCapture(position.coords.latitude, position.coords.longitude);
        setIsLoading(false);
      },
      (err) => {
        let errorMsg = 'Erreur de géolocalisation';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg = 'Accès à la localisation refusé. Veuillez autoriser l\'accès dans les paramètres.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg = 'Position non disponible. Vérifiez que le GPS est activé.';
            break;
          case err.TIMEOUT:
            errorMsg = 'Délai d\'attente dépassé. Réessayez.';
            break;
        }
        setError(errorMsg);
        onError?.(errorMsg);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const hasCoordinates = latitude !== null && longitude !== null;

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant={hasCoordinates ? 'outline' : 'default'}
        className={hasCoordinates ? 'w-full border-primary text-primary' : 'w-full'}
        onClick={handleCapture}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Récupération de la position...</span>
          </>
        ) : hasCoordinates ? (
          <>
            <CheckCircle size={18} className="text-status-resolved" />
            <span>Position capturée - Recapturer</span>
          </>
        ) : (
          <>
            <MapPin size={18} />
            <span>📍 Ma position actuelle</span>
          </>
        )}
      </Button>

      {hasCoordinates && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-status-resolved/10 border border-status-resolved/30">
          <CheckCircle size={16} className="text-status-resolved shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-status-resolved">Position GPS capturée</p>
            <p className="text-muted-foreground text-xs mt-1">
              Lat: {latitude?.toFixed(6)} | Lng: {longitude?.toFixed(6)}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
          <XCircle size={16} className="text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
};

export default GPSCapture;
