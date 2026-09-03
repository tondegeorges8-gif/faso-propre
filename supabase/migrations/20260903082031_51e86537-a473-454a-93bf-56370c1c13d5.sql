-- Variants on articles
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS variants jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Variant tracking on cart & order lines
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS variant_label text;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS variant_prix numeric;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS variant_label text;

-- Order fulfilment details
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS mode_reception text NOT NULL DEFAULT 'livraison';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_address text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_latitude double precision;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_longitude double precision;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_notes text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_fee numeric NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_operator text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_phone text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'en_attente';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_mode_reception_valid') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_mode_reception_valid CHECK (mode_reception IN ('livraison','retrait'));
  END IF;
END $$;

-- Buyers may cancel their own orders
DROP POLICY IF EXISTS "Buyers can cancel their own orders" ON public.orders;
CREATE POLICY "Buyers can cancel their own orders"
ON public.orders FOR DELETE TO authenticated
USING (buyer_id = auth.uid() AND status IN ('en_attente','annulee'));

-- Saved delivery addresses
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  address text NOT NULL,
  latitude double precision,
  longitude double precision,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_addresses TO authenticated;
GRANT ALL ON public.user_addresses TO service_role;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage their own addresses" ON public.user_addresses;
CREATE POLICY "Users manage their own addresses"
ON public.user_addresses FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Identity fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_naissance date;
ALTER TABLE public.boutiques ADD COLUMN IF NOT EXISTS owner_nom text;
ALTER TABLE public.boutiques ADD COLUMN IF NOT EXISTS owner_prenoms text;
ALTER TABLE public.boutiques ADD COLUMN IF NOT EXISTS owner_date_naissance date;
ALTER TABLE public.boutiques ADD COLUMN IF NOT EXISTS cnib_recto_url text;
ALTER TABLE public.boutiques ADD COLUMN IF NOT EXISTS cnib_verso_url text;
ALTER TABLE public.boutiques ADD COLUMN IF NOT EXISTS registre_commerce_url text;