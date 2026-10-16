import React, { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSignedUrl } from '@/hooks/useSignedUrl';

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
  const [showSourceDialog, setShowSourceDialog] = useState(false);
  const [avatarPath, setAvatarPath] = useState<string | null>(currentAvatarUrl || null);
  const resolvedAvatarUrl = useSignedUrl('avatars', avatarPath);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, updateProfile } = useAuth();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset the input so selecting the same file again still triggers onChange
    event.target.value = '';
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

      // Store the file path — signed URLs are generated on-demand
      const newPath = fileName;

      // Update profile in database
      const success = await updateProfile({ avatar_url: newPath } as any);

      if (success) {
        setAvatarPath(newPath);
        onUploadComplete?.(newPath);
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

  const handleOpenSourceDialog = () => {
    setShowSourceDialog(true);
  };

  const openCamera = () => {
    setShowSourceDialog(false);
    setTimeout(() => cameraInputRef.current?.click(), 100);
  };

  const openGallery = () => {
    setShowSourceDialog(false);
    setTimeout(() => galleryInputRef.current?.click(), 100);
  };

  return (
    <div className="relative inline-block">
      <Avatar className="w-20 h-20 border-4 border-primary/20 cursor-pointer" onClick={handleOpenSourceDialog}>
        <AvatarImage src={resolvedAvatarUrl || undefined} alt="Photo de profil" />
        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
          {initials}
        </AvatarFallback>
      </Avatar>

      <Button
        size="icon"
        variant="secondary"
        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full shadow-lg"
        onClick={handleOpenSourceDialog}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Camera size={14} />
        )}
      </Button>

      {/* Choice between camera and gallery — on mobile the browser opens
          the camera or the device gallery depending on the option picked */}
      <Dialog open={showSourceDialog} onOpenChange={setShowSourceDialog}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Photo de profil</DialogTitle>
            <DialogDescription>
              Prenez une nouvelle photo ou choisissez-en une dans votre galerie.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={openCamera}>
              <Camera size={22} />
              <span className="text-sm">Prendre une photo</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={openGallery}>
              <ImageIcon size={22} />
              <span className="text-sm">Ma galerie</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Camera capture — capture="user" opens the front camera on mobile */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Gallery / file picker — no capture attribute so the device
          gallery or file browser opens instead of the camera */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ProfilePhotoUpload;
