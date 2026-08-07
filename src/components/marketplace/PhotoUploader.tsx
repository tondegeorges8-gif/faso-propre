import React, { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Camera, Loader2, X } from 'lucide-react';
import { useSignedUrls } from '@/hooks/useSignedUrl';

export const MARKETPLACE_BUCKET = 'marketplace-photos';

interface Props {
  userId: string;
  value: string[];
  onChange: (paths: string[]) => void;
  max?: number;
}

const PhotoUploader: React.FC<Props> = ({ userId, value, onChange, max = 4 }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const urls = useSignedUrls(MARKETPLACE_BUCKET, value);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const slots = max - value.length;
    if (slots <= 0) {
      toast({ title: 'Limite atteinte', description: `Maximum ${max} photos.`, variant: 'destructive' });
      return;
    }
    setBusy(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files).slice(0, slots)) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'Image trop lourde', description: `${file.name} dépasse 5 Mo.`, variant: 'destructive' });
        continue;
      }
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(MARKETPLACE_BUCKET).upload(path, file);
      if (error) {
        toast({ title: 'Échec de l\'envoi', description: error.message, variant: 'destructive' });
        continue;
      }
      uploaded.push(path);
    }
    setBusy(false);
    if (uploaded.length) onChange([...value, ...uploaded]);
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-2">
        {value.map((p) => (
          <div key={p} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            {urls[p] && <img src={urls[p]} alt="Photo du produit" className="w-full h-full object-cover" />}
            <button
              type="button"
              onClick={() => onChange(value.filter((x) => x !== p))}
              className="absolute top-1 right-1 rounded-full bg-destructive text-destructive-foreground p-1"
              aria-label="Supprimer la photo"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground"
            aria-label="Ajouter une photo"
          >
            {busy ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        className="hidden"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
      />
      <p className="text-[11px] text-muted-foreground">
        Au moins une photo claire est obligatoire (max {max}, 5 Mo par image).
      </p>
    </div>
  );
};

export default PhotoUploader;
