 import React from 'react';
 import { useNavigate, useLocation } from 'react-router-dom';
 import { Home, Plus, Store, FileText, User } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface NavItem {
   icon: React.ElementType;
   label: string;
   path: string;
 }
 
 const navItems: NavItem[] = [
   { icon: Home, label: 'Accueil', path: '/dashboard' },
   { icon: Plus, label: 'Signaler', path: '/new-report' },
   { icon: Store, label: 'Faso Yaar', path: '/faso-yaar' },
   { icon: FileText, label: 'Historique', path: '/reports' },
   { icon: User, label: 'Profil', path: '/profile' },
 ];
 
 const BottomNavigation: React.FC = () => {
   const navigate = useNavigate();
   const location = useLocation();
 
   return (
     <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50 safe-area-bottom">
       <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
         {navItems.map((item) => {
           const isActive = location.pathname === item.path;
           const Icon = item.icon;
           
           return (
             <button
               key={item.path}
               onClick={() => navigate(item.path)}
               className={cn(
                 "flex flex-col items-center justify-center flex-1 h-full py-2 px-3 transition-colors",
                 isActive 
                   ? "text-primary" 
                   : "text-muted-foreground hover:text-foreground"
               )}
             >
               <Icon 
                 size={22} 
                 className={cn(
                   "mb-1 transition-transform",
                   isActive && "scale-110"
                 )} 
               />
               <span className={cn(
                 "text-xs font-medium",
                 isActive && "font-semibold"
               )}>
                 {item.label}
               </span>
             </button>
           );
         })}
       </div>
     </nav>
   );
 };
 
 export default BottomNavigation;