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
  rating: number | null;
  created_at: string;
}

export const usePrestataires = (metier?: string) => {
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    let query = supabase
      .from('prestataires')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (metier) query = query.eq('metier', metier);

    const { data, error } = await query;
    if (!error && data) setPrestataires(data as Prestataire[]);
    setIsLoading(false);
  }, [metier]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { prestataires, isLoading, refetch: fetch };
};
