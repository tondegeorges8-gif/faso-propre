import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useSignedUrls } from '@/hooks/useSignedUrl';
import { MARKETPLACE_BUCKET } from '@/components/marketplace/PhotoUploader';

const Panier: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, count, updateQuantity, removeLine, clearCart } = useCart();
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const urls = useSignedUrls(MARKETPLACE_BUCKET, items.map((i) => i.photo));

  const groups = useMemo(() => {
    const map = new Map<string, { boutique_id: string; boutique_nom: string; seller: string; lines: typeof items }>();
    items.forEach((i) => {
      const g = map.get(i.boutique_id) ?? {
        boutique_id: i.boutique_id, boutique_nom: i.boutique_nom, seller: i.owner_user_id, lines: [] as typeof items,
      };
      g.lines.push(i);
      map.set(i.boutique_id, g);
    });
    return [...map.values()];
  }, [items]);

  const checkout = async () => {
    if (!user) { navigate('/auth'); return; }
    setSubmitting(true);
    try {
      for (const g of groups) {
        const amount = g.lines.reduce((s, l) => s + l.prix * l.quantity, 0);
        const { data: order, error } = await supabase
          .from('orders')
          .insert({
            buyer_id: user.id,
            seller_user_id: g.seller,
            boutique_id: g.boutique_id,
            total_amount: amount,
            buyer_phone: phone || null,
            note: note || null,
          })
          .select('id')
          .single();
        if (error) throw error;

        const { error: itemsError } = await supabase.from('order_items').insert(
          g.lines.map((l) => ({
            order_id: order.id,
            article_id: l.article_id,
            nom: l.nom,
            prix: l.prix,
            quantity: l.quantity,
          })),
        );
        if (itemsError) throw itemsError;

        // Notifier le marchand via la messagerie interne
        const { data: conv } = await supabase
          .from('conversations')
          .select('id')
          .eq('buyer_id', user.id)
          .eq('seller_id', g.seller)
          .maybeSingle();
        let convId = conv?.id;
        if (!convId) {
          const { data: created } = await supabase
            .from('conversations')
            .insert({ buyer_id: user.id, seller_id: g.seller, subject: `Commande ${g.boutique_nom}`, context_type: 'order', context_id: order.id })
            .select('id')
            .single();
          convId = created?.id;
        }
        if (convId) {
          const detail = g.lines.map((l) => `• ${l.nom} x${l.quantity} — ${(l.prix * l.quantity).toLocaleString('fr-FR')} FCFA`).join('\n');
          await supabase.from('messages').insert({
            conversation_id: convId,
            sender_id: user.id,
            content: `Nouvelle commande (${amount.toLocaleString('fr-FR')} FCFA) :\n${detail}${phone ? `\nTéléphone : ${phone}` : ''}${note ? `\nNote : ${note}` : ''}`,
          });
        }
      }
      await clearCart();
      toast({ title: 'Commande envoyée', description: 'Les marchands ont été notifiés dans la messagerie.' });
      navigate('/messages');
    } catch (e) {
      toast({ title: 'Erreur', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="gradient-hero text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-lg font-bold">Mon panier ({count})</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 space-y-4">
        {items.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 flex flex-col items-center text-center gap-3">
              <ShoppingCart className="text-muted-foreground" size={28} />
              <p className="text-muted-foreground">Votre panier est vide.</p>
              <Button onClick={() => navigate('/faso-yaar')}>Découvrir les produits</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {groups.map((g) => {
              const sub = g.lines.reduce((s, l) => s + l.prix * l.quantity, 0);
              return (
                <Card key={g.boutique_id}>
                  <CardContent className="p-4 space-y-3">
                    <button className="font-semibold text-primary" onClick={() => navigate(`/boutique/${g.boutique_id}`)}>
                      {g.boutique_nom}
                    </button>
                    {g.lines.map((l) => (
                      <div key={l.id} className="flex gap-3 items-center">
                        <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden shrink-0">
                          {l.photo && urls[l.photo] && <img src={urls[l.photo]} alt={l.nom} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{l.nom}</p>
                          <p className="text-sm text-primary font-semibold">{l.prix.toLocaleString('fr-FR')} FCFA</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(l.id, l.quantity - 1)}>
                            <Minus size={14} />
                          </Button>
                          <span className="w-6 text-center text-sm">{l.quantity}</span>
                          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(l.id, l.quantity + 1)}>
                            <Plus size={14} />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeLine(l.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <p className="text-sm text-right font-semibold">Sous-total : {sub.toLocaleString('fr-FR')} FCFA</p>
                  </CardContent>
                </Card>
              );
            })}

            <Card>
              <CardContent className="p-4 space-y-3">
                <Input placeholder="Votre téléphone (pour le marchand)" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <Textarea placeholder="Note pour les marchands (lieu de livraison, précisions...)" value={note} onChange={(e) => setNote(e.target.value)} />
                <div className="flex items-center justify-between font-bold">
                  <span>Total général</span>
                  <span className="text-primary">{total.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <Button className="w-full" size="lg" disabled={submitting} onClick={checkout}>
                  {submitting ? 'Envoi...' : 'Valider ma commande'}
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Panier;
