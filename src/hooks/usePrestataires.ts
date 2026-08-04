import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Prestataire {
  id: string;
  nom: string;
  prenoms: string;
  metier: string;
  specialite: string | null;
  telephone: string;
  whatsapp: string | null;
  quartier: string | null;
  ville: string;
  photo_url: string | null;
  description: string | null;
  is_active: boolean;
  is_verified: boolean;
  is_available: boolean;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  created_at: string;
}

export const usePrestataires = (metier?: string, includeInactive = false) => {
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    let query = supabase
      .from('prestataires')
      .select('*')
      .order('created_at', { ascending: false });

    if (!includeInactive) query = query.eq('is_active', true);
    if (metier) query = query.eq('metier', metier);

    const { data, error } = await query;
    if (!error && data) setPrestataires(data as Prestataire[]);
    setIsLoading(false);
  }, [metier, includeInactive]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { prestataires, isLoading, refetch: fetch };
};

// Distance à vol d'oiseau (km) entre deux points GPS
export const haversineKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

export const formatDistance = (km: number) =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
