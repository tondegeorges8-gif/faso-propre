import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { hasAdminEntryEmail } from '@/lib/adminAccess';

export const useAdminEntryAccess = () => {
  const { user, isLoading } = useAuth();
  const eligible = hasAdminEntryEmail(user?.email);
  const access = useQuery({
    queryKey: ['admin-entry', user?.id, user?.email],
    enabled: eligible && !isLoading,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('is_admin_entry_account');
      if (error) throw error;
      return data === true;
    },
    retry: false,
    staleTime: 0,
  });
  return {
    canEnter: !isLoading && eligible && access.data === true && !access.isError && !access.isFetching,
    isLoading: isLoading || (eligible && (access.isPending || access.isFetching)),
  };
};