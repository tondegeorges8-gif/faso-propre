import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import ProfilePhotoUpload from './ProfilePhotoUpload';
import AIAssistant from './AIAssistant';
import { Phone, Mail, Calendar, Edit } from 'lucide-react';
 import { useNavigate } from 'react-router-dom';
 
 interface UserProfileProps {
   onEditProfile?: () => void;
 }
 
 const UserProfile: React.FC<UserProfileProps> = ({ onEditProfile }) => {
   const { profile, user } = useAuth();
   const navigate = useNavigate();
 
   if (!profile) return null;
 
   const initials = `${profile.prenoms[0]}${profile.nom[0]}`;
 
   return (
     <div className="space-y-6">
       {/* Profile Card */}
       <Card className="shadow-card">
         <CardContent className="pt-6">
           <div className="flex flex-col items-center text-center space-y-4">
             <ProfilePhotoUpload
               currentAvatarUrl={(profile as any).avatar_url}
               initials={initials}
             />
             
             <div>
               <h2 className="text-xl font-semibold">
                 {profile.prenoms} {profile.nom}
               </h2>
               <p className="text-sm text-muted-foreground">Citoyen actif</p>
             </div>
           </div>
         </CardContent>
       </Card>
 
       {/* Contact Info */}
       <Card className="shadow-card">
         <CardHeader className="pb-2">
           <CardTitle className="text-lg">Informations de contact</CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
             <Phone size={20} className="text-primary" />
             <div>
               <p className="text-sm text-muted-foreground">Téléphone</p>
               <p className="font-medium">{profile.telephone}</p>
             </div>
           </div>
           
           <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
             <Mail size={20} className="text-primary" />
             <div>
               <p className="text-sm text-muted-foreground">Email</p>
               <p className="font-medium">{profile.email}</p>
             </div>
           </div>
 
           <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
             <Calendar size={20} className="text-primary" />
             <div>
               <p className="text-sm text-muted-foreground">Membre depuis</p>
               <p className="font-medium">
                 {new Date(profile.created_at).toLocaleDateString('fr-FR', {
                   day: 'numeric',
                   month: 'long',
                   year: 'numeric'
                 })}
               </p>
             </div>
           </div>
         </CardContent>
       </Card>
 
       {/* Quick Actions */}
       <Card className="shadow-card">
         <CardHeader className="pb-2">
           <CardTitle className="text-lg">Actions</CardTitle>
         </CardHeader>
         <CardContent className="space-y-3">
            <Button 
             variant="outline" 
             className="w-full justify-start"
             onClick={() => navigate('/settings')}
           >
             <Edit size={18} className="mr-2" />
             Modifier mon profil
            </Button>
          </CardContent>
        </Card>



        {/* AI Assistant */}
        <AIAssistant />
      </div>
   );
 };
 
 export default UserProfile;