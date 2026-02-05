 import React from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useAuth } from '@/contexts/AuthContext';
 import { useUserRole } from '@/hooks/useUserRole';
 import { Button } from '@/components/ui/button';
 import { LogOut, Settings } from 'lucide-react';
 import BottomNavigation from '@/components/navigation/BottomNavigation';
 import UserProfile from '@/components/profile/UserProfile';
 import InstitutionDashboard from '@/components/profile/InstitutionDashboard';
 import FounderDashboard from '@/pages/FounderDashboard';
 
 const logo = '/logo.png';
 
 const Profile: React.FC = () => {
   const navigate = useNavigate();
   const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
   const { isFounder, isInstitution, institution, isLoading: roleLoading } = useUserRole();
 
   // Redirect if not authenticated
   React.useEffect(() => {
     if (!authLoading && !isAuthenticated) {
       navigate('/auth');
     }
   }, [isAuthenticated, authLoading, navigate]);
 
   const handleLogout = async () => {
     await logout();
     navigate('/');
   };
 
   if (authLoading || roleLoading) {
     return (
       <div className="min-h-screen flex items-center justify-center">
         <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
       </div>
     );
   }
 
   // Founder sees the complete founder dashboard
   if (isFounder) {
     return <FounderDashboard />;
   }
 
   return (
     <div className="min-h-screen bg-background pb-20">
       {/* Header */}
       <header className="gradient-hero text-primary-foreground shadow-lg">
         <div className="container mx-auto px-4 py-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-card overflow-hidden">
                 <img src={logo} alt="Faso Propre" className="w-full h-full object-cover" />
               </div>
               <h1 className="text-xl font-bold">
                 {isInstitution ? 'Espace Institution' : 'Mon Profil'}
               </h1>
             </div>
             <div className="flex items-center gap-2">
               <Button
                 variant="ghost"
                 size="icon"
                 className="text-primary-foreground hover:bg-primary-foreground/10"
                 onClick={() => navigate('/settings')}
               >
                 <Settings size={20} />
               </Button>
               <Button
                 variant="ghost"
                 size="icon"
                 className="text-primary-foreground hover:bg-primary-foreground/10"
                 onClick={handleLogout}
               >
                 <LogOut size={20} />
               </Button>
             </div>
           </div>
         </div>
       </header>
 
       <main className="container mx-auto px-4 py-6">
         {isInstitution && institution ? (
           <InstitutionDashboard institutionId={institution} />
         ) : (
           <UserProfile />
         )}
       </main>
 
       <BottomNavigation />
     </div>
   );
 };
 
 export default Profile;