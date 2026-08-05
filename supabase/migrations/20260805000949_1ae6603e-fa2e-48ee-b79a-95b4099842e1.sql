-- Add prestataire role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'prestataire';

-- Boutiques (Faso Yaar)
CREATE TABLE public.boutiques (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  categorie text NOT NULL,
  ville text NOT NULL,
  quartier text,
  adresse text,
  telephone text,
  whatsapp text,
  description text,
  produits text,
  logo_url text,
  is_verified boolean NOT NULL DEFAULT false,
  is_partner boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  latitude double precision,
  longitude double precision,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.boutiques TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.boutiques TO authenticated;
GRANT ALL ON public.boutiques TO service_role;

ALTER TABLE public.boutiques ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active boutiques"
ON public.boutiques FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage boutiques"
ON public.boutiques FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'founder'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'founder'));

CREATE TRIGGER update_boutiques_updated_at
BEFORE UPDATE ON public.boutiques
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Prestataire applications
CREATE TABLE public.prestataire_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nom text NOT NULL,
  prenom text NOT NULL,
  telephone text NOT NULL,
  email text NOT NULL,
  ville text NOT NULL,
  metier text,
  subscription_type text NOT NULL CHECK (subscription_type IN ('non_certifie','certifie')),
  amount numeric NOT NULL DEFAULT 0,
  photo_visage_url text,
  cnib_url text,
  diplome_url text,
  payment_operator text,
  payment_reference text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.prestataire_applications TO authenticated;
GRANT ALL ON public.prestataire_applications TO service_role;

ALTER TABLE public.prestataire_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own application"
ON public.prestataire_applications FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own application"
ON public.prestataire_applications FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
ON public.prestataire_applications FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'founder'));

CREATE POLICY "Admins can update applications"
ON public.prestataire_applications FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'founder'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'founder'));

CREATE TRIGGER update_prestataire_applications_updated_at
BEFORE UPDATE ON public.prestataire_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();