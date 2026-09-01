-- 1. Visibilité et compteurs
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'limited',
  ADD COLUMN IF NOT EXISTS views_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS clicks_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS boosted_until timestamptz;

ALTER TABLE public.annonces_occasion
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'limited',
  ADD COLUMN IF NOT EXISTS views_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS clicks_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS boosted_until timestamptz;

ALTER TABLE public.boutiques
  ADD COLUMN IF NOT EXISTS visits_count integer NOT NULL DEFAULT 0;

-- 2. Trigger : une pub active booste sa cible
CREATE OR REPLACE FUNCTION public.apply_ad_visibility()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status <> 'active') THEN
    IF NEW.target_type = 'article' AND NEW.article_id IS NOT NULL THEN
      UPDATE public.articles
        SET visibility = 'boosted',
            boosted_until = COALESCE(NEW.expires_at, now() + make_interval(days => NEW.days))
        WHERE id = NEW.article_id;
    ELSIF NEW.boutique_id IS NOT NULL THEN
      UPDATE public.articles
        SET visibility = 'boosted',
            boosted_until = COALESCE(NEW.expires_at, now() + make_interval(days => NEW.days))
        WHERE boutique_id = NEW.boutique_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_apply_ad_visibility ON public.ad_subscriptions;
CREATE TRIGGER trg_apply_ad_visibility
AFTER INSERT OR UPDATE ON public.ad_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.apply_ad_visibility();

-- 3. Panier
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, article_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cart" ON public.cart_items
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Commandes
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL,
  seller_user_id uuid NOT NULL,
  boutique_id uuid REFERENCES public.boutiques(id) ON DELETE SET NULL,
  total_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  buyer_phone text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyer or seller can view orders" ON public.orders
  FOR SELECT TO authenticated USING (buyer_id = auth.uid() OR seller_user_id = auth.uid());
CREATE POLICY "Buyer can create orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "Buyer or seller can update orders" ON public.orders
  FOR UPDATE TO authenticated USING (buyer_id = auth.uid() OR seller_user_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid() OR seller_user_id = auth.uid());
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  article_id uuid REFERENCES public.articles(id) ON DELETE SET NULL,
  nom text NOT NULL,
  prix numeric NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order parties can view items" ON public.order_items
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM public.orders o WHERE o.id = order_id
      AND (o.buyer_id = auth.uid() OR o.seller_user_id = auth.uid())));
CREATE POLICY "Buyer can add items" ON public.order_items
  FOR INSERT TO authenticated WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.buyer_id = auth.uid()));

-- 5. Flux marché public (boostés + petit échantillon de limités)
CREATE OR REPLACE FUNCTION public.get_marketplace_articles(_limited_sample integer DEFAULT 6)
RETURNS SETOF public.articles
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.articles
   WHERE is_available = true
     AND (visibility = 'boosted' OR owner_user_id = auth.uid())
  UNION
  SELECT * FROM (
    SELECT * FROM public.articles
     WHERE is_available = true AND visibility <> 'boosted'
     ORDER BY created_at DESC
     LIMIT GREATEST(_limited_sample, 0)
  ) s;
$$;

CREATE OR REPLACE FUNCTION public.get_marketplace_annonces(_limited_sample integer DEFAULT 6)
RETURNS SETOF public.annonces_occasion
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.annonces_occasion
   WHERE is_active = true
     AND (visibility = 'boosted' OR user_id = auth.uid())
  UNION
  SELECT * FROM (
    SELECT * FROM public.annonces_occasion
     WHERE is_active = true AND visibility <> 'boosted'
     ORDER BY created_at DESC
     LIMIT GREATEST(_limited_sample, 0)
  ) s;
$$;

-- 6. Compteurs statistiques
CREATE OR REPLACE FUNCTION public.track_article_view(_article_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.articles SET views_count = views_count + 1 WHERE id = _article_id;
$$;

CREATE OR REPLACE FUNCTION public.track_article_click(_article_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.articles SET clicks_count = clicks_count + 1 WHERE id = _article_id;
$$;

CREATE OR REPLACE FUNCTION public.track_boutique_visit(_boutique_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.boutiques SET visits_count = visits_count + 1 WHERE id = _boutique_id;
$$;