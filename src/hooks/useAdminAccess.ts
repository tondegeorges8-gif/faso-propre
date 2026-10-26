import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { hasAdminEmail } from '@/lib/adminAccess';

export const useAdminAccess = () => {
  const { user, isLoading } = useAuth();
  const eligible = hasAdminEmail(user?.email);
  const access = useQuery({
    queryKey: ['admin-access', user?.id],
    enabled: eligible && !isLoading,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('is_app_admin');
      if (error) throw error;
      return data === true;
    },
    retry: false,
    staleTime: 0,
  });
  return {
    isAdmin: eligible && access.data === true && !access.isError,
    isLoading: isLoading || (eligible && access.isPending),
  };
};