import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ArticleVariant {
  label: string;
  prix: number;
}

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
  variant_label: string | null;
  variants: ArticleVariant[];
}

interface CartContextValue {
  items: CartLine[];
  count: number;
  total: number;
  loading: boolean;
  addToCart: (articleId: string, quantity?: number, variant?: ArticleVariant | null) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  updateVariant: (lineId: string, variant: ArticleVariant) => Promise<void>;
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

const parseVariants = (raw: unknown): ArticleVariant[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((v) => v as { label?: string; prix?: number })
    .filter((v) => typeof v?.label === 'string')
    .map((v) => ({ label: v.label as string, prix: Number(v.prix ?? 0) }));
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
      .select('id, article_id, quantity, variant_label, variant_prix, articles(nom, prix, photo_url, photos, variants, boutique_id, owner_user_id)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    const rows = (data || []) as unknown as Array<{
      id: string;
      article_id: string;
      quantity: number;
      variant_label: string | null;
      variant_prix: number | null;
      articles: {
        nom: string; prix: number; photo_url: string | null; photos: string[] | null; variants: unknown;
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
          prix: Number(r.variant_prix ?? r.articles!.prix),
          photo: r.articles!.photos?.[0] ?? r.articles!.photo_url,
          boutique_id: r.articles!.boutique_id,
          owner_user_id: r.articles!.owner_user_id,
          boutique_nom: names[r.articles!.boutique_id] || 'Boutique',
          variant_label: r.variant_label,
          variants: parseVariants(r.articles!.variants),
        })),
    );
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const addToCart = useCallback(async (articleId: string, quantity = 1, variant?: ArticleVariant | null) => {
    if (!user) throw new Error('Connectez-vous pour utiliser le panier');
    const label = variant?.label ?? null;
    const existing = items.find((i) => i.article_id === articleId && i.variant_label === label);
    if (existing) {
      await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id);
    } else {
      await supabase.from('cart_items').insert({
        user_id: user.id,
        article_id: articleId,
        quantity,
        variant_label: label,
        variant_prix: variant ? variant.prix : null,
      });
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

  const updateVariant = useCallback(async (lineId: string, variant: ArticleVariant) => {
    await supabase.from('cart_items').update({ variant_label: variant.label, variant_prix: variant.prix }).eq('id', lineId);
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
    updateVariant,
    removeLine,
    clearCart,
    refresh,
  }), [items, loading, addToCart, updateQuantity, updateVariant, removeLine, clearCart, refresh]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
