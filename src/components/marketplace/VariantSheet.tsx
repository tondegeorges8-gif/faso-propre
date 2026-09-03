import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import type { ArticleVariant } from '@/contexts/CartContext';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variants: ArticleVariant[];
  onAdd: (variant: ArticleVariant | null) => void;
  basePrice: number;
  productName: string;
}

const VariantSheet: React.FC<Props> = ({ open, onOpenChange, variants, onAdd, basePrice, productName }) => {
  const list: ArticleVariant[] = variants.length
    ? variants
    : [{ label: 'Modèle standard', prix: basePrice }];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle className="text-base">Choisir une variante — {productName}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-3 max-h-[55vh] overflow-y-auto pb-2">
          {list.map((v) => (
            <div key={v.label} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{v.label}</p>
                <p className="text-primary font-bold text-sm">{Number(v.prix).toLocaleString('fr-FR')} F CFA</p>
              </div>
              <Button size="sm" onClick={() => onAdd(variants.length ? v : null)}>
                <ShoppingCart size={14} className="mr-1" /> AJOUTER AU PANIER
              </Button>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default VariantSheet;
