import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crosshair, Loader2, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const OUAGA: [number, number] = [12.3714, -1.5197];

export interface PickedPlace {
  lat: number;
  lng: number;
  address: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (place: PickedPlace) => void;
  initial?: { lat: number; lng: number } | null;
}

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=fr`,
    );
    const json = (await res.json()) as { display_name?: string };
    return json.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
};

const MapPicker: React.FC<Props> = ({ open, onOpenChange, onConfirm, initial }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [coords, setCoords] = useState<[number, number]>(
    initial ? [initial.lat, initial.lng] : OUAGA,
  );
  const [locating, setLocating] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      if (!containerRef.current || mapRef.current) return;
      const map = L.map(containerRef.current).setView(coords, 13);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const icon = L.divIcon({
        className: '',
        html: '<div style="width:18px;height:18px;border-radius:9999px;background:hsl(var(--primary));border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      const marker = L.marker(coords, { draggable: true, icon }).addTo(map);
      marker.on('dragend', () => {
        const p = marker.getLatLng();
        setCoords([p.lat, p.lng]);
      });
      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        setCoords([e.latlng.lat, e.latlng.lng]);
      });
      mapRef.current = map;
      markerRef.current = marker;
      map.invalidateSize();
    }, 120);

    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
    }
  }, [open]);

  const useMyPosition = () => {
    if (!navigator.geolocation) {
      toast({ title: 'GPS indisponible', description: "La géolocalisation n'est pas disponible sur cet appareil.", variant: 'destructive' });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setCoords(next);
        markerRef.current?.setLatLng(next);
        mapRef.current?.setView(next, 16);
        setLocating(false);
      },
      () => {
        setLocating(false);
        toast({ title: 'Position introuvable', description: "Autorisez la localisation pour utiliser cette option.", variant: 'destructive' });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const confirm = async () => {
    setConfirming(true);
    const address = await reverseGeocode(coords[0], coords[1]);
    setConfirming(false);
    onConfirm({ lat: coords[0], lng: coords[1], address });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle className="text-base flex items-center gap-2">
            <MapPin size={16} /> Choisir sur la carte
          </DialogTitle>
        </DialogHeader>
        <div ref={containerRef} className="h-72 w-full mt-3 bg-muted" />
        <div className="p-4 space-y-2">
          <p className="text-xs text-muted-foreground">
            Touchez la carte ou déplacez le point pour ajuster votre adresse.
          </p>
          <Button variant="outline" className="w-full" onClick={useMyPosition} disabled={locating}>
            {locating ? <Loader2 className="mr-2 animate-spin" size={16} /> : <Crosshair size={16} className="mr-2" />}
            Ma position actuelle
          </Button>
          <Button className="w-full" onClick={confirm} disabled={confirming}>
            {confirming ? <Loader2 className="mr-2 animate-spin" size={16} /> : null}
            Confirmer cette adresse
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MapPicker;
