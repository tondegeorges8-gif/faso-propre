import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAccess } from '@/hooks/useAdminAccess';

export const useFounderAccess = () => {
  const { user } = useAuth();
  const adminAccess = useAdminAccess();
  const [isFounder, setIsFounder] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFounderStatus = async () => {
      if (!user) {
        setIsFounder(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'founder')
          .maybeSingle();

        if (error) {
          console.error('Error checking founder status:', error);
          setIsFounder(false);
        } else {
          setIsFounder(!!data);
        }
      } catch (err) {
        console.error('Error checking founder status:', err);
        setIsFounder(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkFounderStatus();
  }, [user]);

  return { isFounder: isFounder && adminAccess.isAdmin, isLoading: isLoading || adminAccess.isLoading };
};
