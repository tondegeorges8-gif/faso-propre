CREATE TABLE public.prestataires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  prenoms text NOT NULL,
  metier text NOT NULL,
  specialite text,
  telephone text NOT NULL,
  whatsapp text,
  quartier text,
  ville text NOT NULL,
  photo_url text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  is_verified boolean NOT NULL DEFAULT false,
  rating numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.prestataires TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prestataires TO authenticated;
GRANT ALL ON public.prestataires TO service_role;

ALTER TABLE public.prestataires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active prestataires"
ON public.prestataires FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage prestataires"
ON public.prestataires FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'founder'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'founder'::app_role));

CREATE TRIGGER update_prestataires_updated_at
BEFORE UPDATE ON public.prestataires
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_prestataires_metier ON public.prestataires(metier);
CREATE INDEX idx_prestataires_ville ON public.prestataires(ville);
CREATE INDEX idx_prestataires_quartier ON public.prestataires(quartier);