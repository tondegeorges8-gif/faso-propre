import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import QuantityStepper from '@/components/marketplace/QuantityStepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Package, ShoppingCart, Trash2 } from 'lucide-react';
import { useSignedUrls } from '@/hooks/useSignedUrl';
import { MARKETPLACE_BUCKET } from '@/components/marketplace/PhotoUploader';

const Panier: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, count, updateQuantity, updateVariant, removeLine } = useCart();
  const urls = useSignedUrls(MARKETPLACE_BUCKET, items.map((i) => i.photo));

  return (
    <div className="min-h-screen bg-background pb-40">
      <header className="gradient-hero text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-lg font-bold">MON PANIER ({count})</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 space-y-3">
        {!user ? (
          <Card className="border-dashed">
            <CardContent className="py-12 flex flex-col items-center text-center gap-3">
              <ShoppingCart className="text-muted-foreground" size={28} />
              <p className="text-muted-foreground">Connectez-vous pour utiliser votre panier.</p>
              <Button onClick={() => navigate('/auth')}>Se connecter</Button>
            </CardContent>
          </Card>
        ) : items.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 flex flex-col items-center text-center gap-3">
              <ShoppingCart className="text-muted-foreground" size={28} />
              <p className="text-muted-foreground">Votre panier est vide.</p>
              <Button onClick={() => navigate('/faso-yaar')}>Découvrir les produits</Button>
            </CardContent>
          </Card>
        ) : (
          items.map((line) => (
            <Card key={line.id}>
              <CardContent className="p-3 flex gap-3">
                <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                  {line.photo && urls[line.photo] ? (
                    <img src={urls[line.photo]} alt={line.nom} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <Package className="text-muted-foreground" size={22} />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm leading-tight truncate">{line.nom}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{line.boutique_nom}</p>
                    </div>
                    <button
                      type="button"
                      aria-label="Retirer du panier"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeLine(line.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <p className="font-bold text-primary text-sm">{line.prix.toLocaleString('fr-FR')} F CFA</p>

                  {line.variants.length > 1 && (
                    <Select
                      value={line.variant_label ?? undefined}
                      onValueChange={(label) => {
                        const v = line.variants.find((x) => x.label === label);
                        if (v) updateVariant(line.id, v);
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Choisir la couleur / variante" />
                      </SelectTrigger>
                      <SelectContent>
                        {line.variants.map((v) => (
                          <SelectItem key={v.label} value={v.label}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <div className="flex items-center justify-between">
                    <QuantityStepper value={line.quantity} onChange={(q) => updateQuantity(line.id, q)} />
                    <span className="text-sm font-semibold">
                      {(line.prix * line.quantity).toLocaleString('fr-FR')} F
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>

      {items.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border bg-card px-4 py-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-bold text-primary">{total.toLocaleString('fr-FR')} F CFA</span>
          </div>
          <Button className="w-full" size="lg" onClick={() => navigate('/commande')}>
            COMMANDER
          </Button>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};

export default Panier;
