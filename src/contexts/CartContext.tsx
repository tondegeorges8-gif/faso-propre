import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CartLine {
  id: string;
  article_id: string;
  quantity: number;
  nom: string;
  prix: number;
  photo: string | null;
  boutique_id: string;
  owner_user_id: string;
  boutique_nom: string;
}

interface CartContextValue {
  items: CartLine[];
  count: number;
  total: number;
  loading: boolean;
  addToCart: (articleId: string, quantity?: number) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être utilisé dans CartProvider');
  return ctx;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('cart_items')
      .select('id, article_id, quantity, articles(nom, prix, photo_url, photos, boutique_id, owner_user_id)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    const rows = (data || []) as unknown as Array<{
      id: string;
      article_id: string;
      quantity: number;
      articles: {
        nom: string; prix: number; photo_url: string | null; photos: string[] | null;
        boutique_id: string; owner_user_id: string;
      } | null;
    }>;

    const boutiqueIds = [...new Set(rows.map((r) => r.articles?.boutique_id).filter(Boolean) as string[])];
    const names: Record<string, string> = {};
    if (boutiqueIds.length) {
      const { data: bs } = await supabase.from('boutiques').select('id, nom').in('id', boutiqueIds);
      (bs || []).forEach((b) => { names[b.id] = b.nom; });
    }

    setItems(
      rows
        .filter((r) => r.articles)
        .map((r) => ({
          id: r.id,
          article_id: r.article_id,
          quantity: r.quantity,
          nom: r.articles!.nom,
          prix: Number(r.articles!.prix),
          photo: r.articles!.photos?.[0] ?? r.articles!.photo_url,
          boutique_id: r.articles!.boutique_id,
          owner_user_id: r.articles!.owner_user_id,
          boutique_nom: names[r.articles!.boutique_id] || 'Boutique',
        })),
    );
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const addToCart = useCallback(async (articleId: string, quantity = 1) => {
    if (!user) throw new Error('Connectez-vous pour utiliser le panier');
    const existing = items.find((i) => i.article_id === articleId);
    if (existing) {
      await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id);
    } else {
      await supabase.from('cart_items').insert({ user_id: user.id, article_id: articleId, quantity });
    }
    await refresh();
  }, [user, items, refresh]);

  const updateQuantity = useCallback(async (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      await supabase.from('cart_items').delete().eq('id', lineId);
    } else {
      await supabase.from('cart_items').update({ quantity }).eq('id', lineId);
    }
    await refresh();
  }, [refresh]);

  const removeLine = useCallback(async (lineId: string) => {
    await supabase.from('cart_items').delete().eq('id', lineId);
    await refresh();
  }, [refresh]);

  const clearCart = useCallback(async () => {
    if (!user) return;
    await supabase.from('cart_items').delete().eq('user_id', user.id);
    await refresh();
  }, [user, refresh]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    count: items.reduce((s, i) => s + i.quantity, 0),
    total: items.reduce((s, i) => s + i.quantity * i.prix, 0),
    loading,
    addToCart,
    updateQuantity,
    removeLine,
    clearCart,
    refresh,
  }), [items, loading, addToCart, updateQuantity, removeLine, clearCart, refresh]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
