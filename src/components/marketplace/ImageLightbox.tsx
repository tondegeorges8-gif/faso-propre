import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface Props {
  src: string | null;
  alt: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImageLightbox: React.FC<Props> = ({ src, alt, open, onOpenChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl p-0 bg-background">
      {src && <img src={src} alt={alt} className="w-full h-auto max-h-[80vh] object-contain" />}
    </DialogContent>
  </Dialog>
);

export default ImageLightbox;
