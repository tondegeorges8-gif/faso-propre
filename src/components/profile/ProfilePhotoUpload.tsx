 import React, { useState, useRef } from 'react';
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 import { Button } from '@/components/ui/button';
 import { Camera, Loader2 } from 'lucide-react';
 import { supabase } from '@/integrations/supabase/client';
 import { useToast } from '@/hooks/use-toast';
 import { useAuth } from '@/contexts/AuthContext';
 
 interface ProfilePhotoUploadProps {
   currentAvatarUrl?: string | null;
   initials: string;
   onUploadComplete?: (url: string) => void;
 }
 
 const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
   currentAvatarUrl,
   initials,
   onUploadComplete
 }) => {
   const [isUploading, setIsUploading] = useState(false);
   const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl || null);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const { toast } = useToast();
   const { user, updateProfile } = useAuth();
 
   const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
     const file = event.target.files?.[0];
     if (!file || !user) return;
 
     // Validate file type
     if (!file.type.startsWith('image/')) {
       toast({
         title: 'Erreur',
         description: 'Veuillez sélectionner une image',
         variant: 'destructive',
       });
       return;
     }
 
     // Validate file size (max 5MB)
     if (file.size > 5 * 1024 * 1024) {
       toast({
         title: 'Erreur',
         description: 'L\'image ne doit pas dépasser 5 Mo',
         variant: 'destructive',
       });
       return;
     }
 
     setIsUploading(true);
 
     try {
       const fileExt = file.name.split('.').pop();
       const fileName = `${user.id}/avatar.${fileExt}`;
 
       // Upload to Supabase Storage
       const { error: uploadError } = await supabase.storage
         .from('avatars')
         .upload(fileName, file, { upsert: true });
 
       if (uploadError) throw uploadError;
 
       // Get public URL
       const { data: { publicUrl } } = supabase.storage
         .from('avatars')
         .getPublicUrl(fileName);
 
       // Add cache buster to force refresh
       const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`;
 
       // Update profile in database
       const success = await updateProfile({ avatar_url: urlWithCacheBuster } as any);
 
       if (success) {
         setAvatarUrl(urlWithCacheBuster);
         onUploadComplete?.(urlWithCacheBuster);
         toast({
           title: 'Photo mise à jour',
           description: 'Votre photo de profil a été modifiée avec succès',
         });
       }
     } catch (error) {
       console.error('Upload error:', error);
       toast({
         title: 'Erreur',
         description: 'Impossible de mettre à jour la photo',
         variant: 'destructive',
       });
     } finally {
       setIsUploading(false);
     }
   };
 
   const handleClick = () => {
     fileInputRef.current?.click();
   };
 
   return (
     <div className="relative inline-block">
       <Avatar className="w-20 h-20 border-4 border-primary/20 cursor-pointer" onClick={handleClick}>
         <AvatarImage src={avatarUrl || undefined} alt="Photo de profil" />
         <AvatarFallback className="bg-primary text-primary-foreground text-xl">
           {initials}
         </AvatarFallback>
       </Avatar>
       
       <Button
         size="icon"
         variant="secondary"
         className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full shadow-lg"
         onClick={handleClick}
         disabled={isUploading}
       >
         {isUploading ? (
           <Loader2 size={14} className="animate-spin" />
         ) : (
           <Camera size={14} />
         )}
       </Button>
 
       <input
         ref={fileInputRef}
         type="file"
         accept="image/*"
         capture="user"
         onChange={handleFileSelect}
         className="hidden"
       />
     </div>
   );
 };
 
 export default ProfilePhotoUpload;