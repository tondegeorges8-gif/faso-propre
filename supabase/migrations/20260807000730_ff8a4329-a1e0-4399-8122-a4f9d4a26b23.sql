ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS type_annonce text NOT NULL DEFAULT 'vente',
  ADD COLUMN IF NOT EXISTS etat text NOT NULL DEFAULT 'neuf',
  ADD COLUMN IF NOT EXISTS troc_contre text,
  ADD COLUMN IF NOT EXISTS photos text[] NOT NULL DEFAULT '{}';

UPDATE public.articles SET photos = ARRAY[photo_url] WHERE photo_url IS NOT NULL AND coalesce(array_length(photos,1),0) = 0;

CREATE OR REPLACE FUNCTION public.require_article_photo()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF coalesce(array_length(NEW.photos,1),0) = 0 AND coalesce(NEW.photo_url,'') = '' THEN
    RAISE EXCEPTION 'Au moins une photo est obligatoire pour publier un produit';
  END IF;
  IF NEW.photo_url IS NULL AND coalesce(array_length(NEW.photos,1),0) > 0 THEN
    NEW.photo_url := NEW.photos[1];
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_require_article_photo ON public.articles;
CREATE TRIGGER trg_require_article_photo
BEFORE INSERT OR UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.require_article_photo();

ALTER TABLE public.ad_subscriptions
  ADD COLUMN IF NOT EXISTS days integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS target_type text NOT NULL DEFAULT 'boutique',
  ADD COLUMN IF NOT EXISTS article_id uuid REFERENCES public.articles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS commission_rate numeric NOT NULL DEFAULT 0.10,
  ADD COLUMN IF NOT EXISTS commission_amount numeric NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.credit_founder_ad_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status <> 'active') THEN
    NEW.commission_amount := round(NEW.amount * NEW.commission_rate);
    INSERT INTO public.founder_transactions (transaction_type, amount, description, related_user_id)
    VALUES ('commission', NEW.commission_amount,
            'Commission publicitaire FASO YAAR - Abonnement #' || NEW.id::text,
            NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ad_commission ON public.ad_subscriptions;
CREATE TRIGGER trg_ad_commission
BEFORE UPDATE ON public.ad_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.credit_founder_ad_commission();

GRANT SELECT ON public.articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;