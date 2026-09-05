import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import MapPicker, { reverseGeocode, PickedPlace } from '@/components/marketplace/MapPicker';
import PaymentOperators from '@/components/payments/PaymentOperators';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Crosshair, Loader2, Map, Package, Truck, Store } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSignedUrls } from '@/hooks/useSignedUrl';
import { MARKETPLACE_BUCKET } from '@/components/marketplace/PhotoUploader';
import { cn } from '@/lib/utils';
import { sendWebhook } from '@/lib/webhook';

const DELIVERY_FEE = 0;

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const urls = useSignedUrls(MARKETPLACE_BUCKET, items.map((i) => i.photo));

  const [mode, setMode] = useState<'livraison' | 'retrait'>('livraison');
  const [place, setPlace] = useState<PickedPlace | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [notes, setNotes] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);
  const [operator, setOperator] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const subtotal = total;
  const grandTotal = subtotal + DELIVERY_FEE;
  const montant = Math.round(grandTotal);

  const ussd = useMemo(() => {
    const num = phone.replace(/\D/g, '');
    if (operator === 'ORANGE_MONEY') return `*144*2*1*${num}*${montant}#`;
    if (operator === 'MOOV_MONEY') return `*555*2*1*${num}*${montant}#`;
    return null;
  }, [operator, phone, montant]);

  const useCurrentPosition = () => {
    if (!navigator.geolocation) {
      toast({ title: 'GPS indisponible', variant: 'destructive' });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const address = await reverseGeocode(latitude, longitude);
        setPlace({ lat: latitude, lng: longitude, address });
        setLocating(false);
      },
      () => {
        setLocating(false);
        toast({ title: 'Localisation refusée', description: 'Choisissez votre adresse sur la carte.', variant: 'destructive' });
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const createOrders = async (paymentStatus: string) => {
    if (!user) throw new Error('Connectez-vous');
    const groups: Record<string, typeof items> = {};
    items.forEach((i) => {
      const key = `${i.owner_user_id}|${i.boutique_id}`;
      groups[key] = [...(groups[key] || []), i];
    });

    for (const [key, lines] of Object.entries(groups)) {
      const [sellerId, boutiqueId] = key.split('|');
      const amount = lines.reduce((s, l) => s + l.prix * l.quantity, 0);
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          seller_user_id: sellerId,
          boutique_id: boutiqueId || null,
          total_amount: amount,
          status: 'en_attente',
          mode_reception: mode,
          delivery_address: mode === 'livraison' ? place?.address ?? null : null,
          delivery_latitude: mode === 'livraison' ? place?.lat ?? null : null,
          delivery_longitude: mode === 'livraison' ? place?.lng ?? null : null,
          delivery_notes: mode === 'livraison' ? notes || null : null,
          delivery_fee: DELIVERY_FEE,
          payment_operator: operator,
          payment_phone: operator === 'WAVE' ? null : phone || null,
          payment_status: paymentStatus,
        })
        .select('id')
        .single();
      if (error) throw error;

      const { error: itemsError } = await supabase.from('order_items').insert(
        lines.map((l) => ({
          order_id: order.id,
          article_id: l.article_id,
          nom: l.nom,
          prix: l.prix,
          quantity: l.quantity,
          variant_label: l.variant_label,
        })),
      );
      if (itemsError) throw itemsError;

      // Notification de confirmation au client et au marchand
      sendWebhook('order_created', {
        order_id: order.id,
        buyer_id: user.id,
        seller_user_id: sellerId,
        boutique_id: boutiqueId || null,
        total_amount: amount,
        mode_reception: mode,
        delivery_address: mode === 'livraison' ? place?.address ?? null : null,
        delivery_notes: mode === 'livraison' ? notes || null : null,
        payment_operator: operator,
        payment_status: paymentStatus,
        items: lines.map((l) => ({ nom: l.nom, variante: l.variant_label, prix: l.prix, quantite: l.quantity })),
      });
    }

    if (mode === 'livraison' && saveAddress && place) {
      await supabase.from('user_addresses').insert({
        user_id: user.id,
        label: 'Adresse de livraison',
        address: place.address,
        latitude: place.lat,
        longitude: place.lng,
      });
    }

    await clearCart();
  };

  const handlePay = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!operator) { toast({ title: 'Choisissez un moyen de paiement', variant: 'destructive' }); return; }
    if (mode === 'livraison' && !place) { toast({ title: 'Indiquez votre adresse de livraison', variant: 'destructive' }); return; }
    if (operator !== 'WAVE' && phone.replace(/\D/g, '').length < 8) {
      toast({ title: 'Numéro invalide', description: 'Saisissez votre numéro de paiement.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      await createOrders(operator === 'WAVE' ? 'en_attente' : 'otp_envoye');
      if (ussd) window.location.href = `tel:${encodeURIComponent(ussd)}`;
      toast({
        title: 'Commande enregistrée',
        description: operator === 'WAVE'
          ? 'Scannez le QR code Wave pour finaliser le paiement.'
          : `Validez le code reçu après composition du ${ussd}.`,
      });
      navigate('/panier');
    } catch (e) {
      toast({ title: 'Erreur', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <main className="container mx-auto px-4 py-12 text-center space-y-3">
          <Package className="mx-auto text-muted-foreground" size={30} />
          <p className="text-muted-foreground">Votre panier est vide.</p>
          <Button onClick={() => navigate('/faso-yaar')}>Découvrir les produits</Button>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-40">
      <header className="gradient-hero text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-lg font-bold">RÉCAPITULATIF</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 space-y-4">
        <Card>
          <CardContent className="p-3 space-y-3">
            {items.map((l) => (
              <div key={l.id} className="flex gap-3">
                <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                  {l.photo && urls[l.photo] ? (
                    <img src={urls[l.photo]} alt={l.nom} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <Package className="text-muted-foreground" size={20} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{l.nom}</p>
                  {l.variant_label && <p className="text-[11px] text-muted-foreground">{l.variant_label}</p>}
                  <p className="text-xs text-muted-foreground">
                    {l.prix.toLocaleString('fr-FR')} F CFA × {l.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold">{(l.prix * l.quantity).toLocaleString('fr-FR')} F</span>
              </div>
            ))}

            <div className="border-t border-border pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Sous-total</span><span>{subtotal.toLocaleString('fr-FR')} F CFA</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Frais de livraison</span><span>{DELIVERY_FEE.toLocaleString('fr-FR')} F CFA</span></div>
              <div className="flex justify-between font-bold text-primary text-base"><span>Total</span><span>{grandTotal.toLocaleString('fr-FR')} F CFA</span></div>
              <p className="text-[11px] text-muted-foreground pt-1">
                Délai estimé : {mode === 'livraison' ? '24 à 48 h' : 'Disponible sous 24 h en boutique'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="font-semibold text-sm">MODE DE RÉCEPTION</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('livraison')}
                className={cn('rounded-xl border-2 p-3 flex flex-col items-center gap-1 bg-card', mode === 'livraison' ? 'border-primary shadow-md' : 'border-border')}
              >
                <Truck size={20} className="text-primary" />
                <span className="text-xs font-semibold">LIVRAISON</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('retrait')}
                className={cn('rounded-xl border-2 p-3 flex flex-col items-center gap-1 bg-card', mode === 'retrait' ? 'border-primary shadow-md' : 'border-border')}
              >
                <Store size={20} className="text-primary" />
                <span className="text-xs font-semibold">RETRAIT</span>
              </button>
            </div>

            {mode === 'livraison' && (
              <div className="space-y-3 pt-1">
                <Label className="text-sm">Adresse de livraison</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={useCurrentPosition} disabled={locating}>
                    {locating ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Crosshair size={14} className="mr-1" />}
                    Ma position
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setMapOpen(true)}>
                    <Map size={14} className="mr-1" /> Choisir sur la carte
                  </Button>
                </div>
                {place && <p className="text-xs text-muted-foreground">{place.address}</p>}

                <div className="space-y-1">
                  <Label htmlFor="notes" className="text-sm">Notes pour le livreur</Label>
                  <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Repères, étage, code portail..." />
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={saveAddress} onCheckedChange={(v) => setSaveAddress(v === true)} />
                  Enregistrer cette adresse
                </label>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="font-semibold text-sm">MODE DE PAIEMENT</h2>
            <PaymentOperators value={operator} onChange={setOperator} />

            {operator && operator !== 'WAVE' && (
              <div className="space-y-1">
                <Label htmlFor="pay-phone" className="text-sm">
                  Numéro {operator === 'ORANGE_MONEY' ? 'Orange Money' : 'Moov Money'}
                </Label>
                <Input id="pay-phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="70 00 00 00" />
                {ussd && <p className="text-[11px] text-muted-foreground">Code à composer : {ussd}</p>}
              </div>
            )}

            {operator === 'WAVE' && (
              <div className="flex flex-col items-center gap-2 py-2">
                <QRCodeCanvas value={`wave://pay?amount=${montant}&currency=XOF&to=22656009893`} size={160} />
                <p className="text-xs text-muted-foreground text-center">Scannez ce QR code avec Wave pour valider {montant.toLocaleString('fr-FR')} F CFA.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border bg-card px-4 py-3 grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => navigate('/panier')}>Annuler</Button>
        <Button onClick={handlePay} disabled={submitting}>
          {submitting ? <Loader2 size={16} className="mr-1 animate-spin" /> : null}
          Payer {grandTotal.toLocaleString('fr-FR')} F CFA
        </Button>
      </div>

      <MapPicker
        open={mapOpen}
        onOpenChange={setMapOpen}
        initial={place ? { lat: place.lat, lng: place.lng } : null}
        onConfirm={(p) => setPlace(p)}
      />

      <BottomNavigation />
    </div>
  );
};

export default Checkout;
