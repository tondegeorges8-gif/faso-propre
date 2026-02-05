 import { useState, useEffect } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/contexts/AuthContext';
 
 export type AppRole = 'user' | 'collector' | 'admin' | 'founder';
 export type InstitutionId = 'ONEA' | 'SONABEL' | 'ONASER' | 'ANASUR' | 'LABO_NAT' | 'POLICE_MUN' | 'VOIRIE' | 'BRIGADE_VERTE';
 
 interface UserRoleData {
   role: AppRole;
   institution: InstitutionId | null;
   isLoading: boolean;
   isFounder: boolean;
   isInstitution: boolean;
   isCollector: boolean;
   isAdmin: boolean;
 }
 
 export const useUserRole = (): UserRoleData => {
   const { user } = useAuth();
   const [role, setRole] = useState<AppRole>('user');
   const [institution, setInstitution] = useState<InstitutionId | null>(null);
   const [isLoading, setIsLoading] = useState(true);
 
   useEffect(() => {
     const fetchRole = async () => {
       if (!user) {
         setIsLoading(false);
         return;
       }
 
       try {
         const { data, error } = await supabase
           .from('user_roles')
           .select('role, institution')
           .eq('user_id', user.id)
           .maybeSingle();
 
         if (data && !error) {
           setRole(data.role as AppRole);
           setInstitution(data.institution as InstitutionId | null);
         }
       } catch (error) {
         console.error('Error fetching user role:', error);
       } finally {
         setIsLoading(false);
       }
     };
 
     fetchRole();
   }, [user]);
 
   return {
     role,
     institution,
     isLoading,
     isFounder: role === 'founder',
     isInstitution: !!institution,
     isCollector: role === 'collector',
     isAdmin: role === 'admin',
   };
 };