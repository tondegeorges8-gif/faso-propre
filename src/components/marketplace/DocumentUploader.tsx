import React, { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Camera, Loader2, X } from 'lucide-react';
import { useSignedUrl } from '@/hooks/useSignedUrl';

export const DOCS_BUCKET = 'prestataire-docs';

interface Props {
  userId: string;
  label: string;
  value: string | null;
  onChange: (path: string | null) => void;
  optional?: boolean;
}

const DocumentUploader: React.FC<Props> = ({ userId, label, value, onChange, optional }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const url = useSignedUrl(DOCS_BUCKET, value ?? undefined);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Fichier invalide', description: 'Choisissez une photo.', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Image trop lourde', description: 'Maximum 5 Mo.', variant: 'destructive' });
      return;
    }
    setBusy(true);
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(DOCS_BUCKET).upload(path, file);
    setBusy(false);
    if (error) {
      toast({ title: "Échec de l'envoi", description: error.message, variant: 'destructive' });
      return;
    }
    onChange(path);
  };

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">
        {label} {optional ? <span className="text-muted-foreground font-normal">(optionnel)</span> : '*'}
      </p>
      {value ? (
        <div className="relative w-full h-36 rounded-lg overflow-hidden bg-muted">
          {url && <img src={url} alt={label} className="w-full h-full object-cover" />}
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-1 right-1 rounded-full bg-destructive text-destructive-foreground p-1"
            aria-label={`Supprimer ${label}`}
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground text-xs"
        >
          {busy ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
          Prendre ou ajouter une photo claire
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }}
      />
    </div>
  );
};

export default DocumentUploader;
