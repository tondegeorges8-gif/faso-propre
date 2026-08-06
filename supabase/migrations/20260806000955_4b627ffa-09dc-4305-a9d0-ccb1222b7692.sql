
-- ============ FASO YAARE : boutiques enrichies ============
ALTER TABLE public.boutiques
  ADD COLUMN IF NOT EXISTS owner_user_id uuid,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz;

-- Boutique: owner can manage own
DROP POLICY IF EXISTS "Owners manage their boutique" ON public.boutiques;
CREATE POLICY "Owners manage their boutique" ON public.boutiques
  FOR ALL TO authenticated
  USING (owner_user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'founder'))
  WITH CHECK (owner_user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'founder'));

-- ============ ARTICLES ============
CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id uuid NOT NULL REFERENCES public.boutiques(id) ON DELETE CASCADE,
  owner_user_id uuid NOT NULL,
  nom text NOT NULL,
  description text,
  categorie text NOT NULL,
  region text,
  prix numeric NOT NULL DEFAULT 0,
  photo_url text,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Articles are viewable by everyone" ON public.articles FOR SELECT USING (true);
CREATE POLICY "Owners manage their articles" ON public.articles FOR ALL TO authenticated
  USING (owner_user_id = auth.uid()) WITH CHECK (owner_user_id = auth.uid());
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PETITES ANNONCES (troc / occasion) ============
CREATE TABLE public.annonces_occasion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  titre text NOT NULL,
  description text,
  categorie text NOT NULL,
  type_annonce text NOT NULL DEFAULT 'vente',
  etat text NOT NULL DEFAULT 'bon',
  prix numeric,
  troc_contre text,
  ville text NOT NULL,
  quartier text,
  region text,
  photo_url text,
  contact_telephone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.annonces_occasion TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.annonces_occasion TO authenticated;
GRANT ALL ON public.annonces_occasion TO service_role;
ALTER TABLE public.annonces_occasion ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active annonces viewable by everyone" ON public.annonces_occasion FOR SELECT USING (is_active = true OR user_id = auth.uid());
CREATE POLICY "Users manage their annonces" ON public.annonces_occasion FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER update_annonces_occasion_updated_at BEFORE UPDATE ON public.annonces_occasion
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PROMOS FLASH ============
CREATE TABLE public.promos_flash (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id uuid REFERENCES public.boutiques(id) ON DELETE CASCADE,
  owner_user_id uuid NOT NULL,
  titre text NOT NULL,
  description text,
  reduction_pct integer,
  prix_promo numeric,
  image_url text,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.promos_flash TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promos_flash TO authenticated;
GRANT ALL ON public.promos_flash TO service_role;
ALTER TABLE public.promos_flash ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Promos viewable by everyone" ON public.promos_flash FOR SELECT USING (true);
CREATE POLICY "Owners manage their promos" ON public.promos_flash FOR ALL TO authenticated
  USING (owner_user_id = auth.uid()) WITH CHECK (owner_user_id = auth.uid());
CREATE TRIGGER update_promos_flash_updated_at BEFORE UPDATE ON public.promos_flash
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ AVIS ============
CREATE TABLE public.avis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  note integer NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);
GRANT SELECT ON public.avis TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.avis TO authenticated;
GRANT ALL ON public.avis TO service_role;
ALTER TABLE public.avis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Avis viewable by everyone" ON public.avis FOR SELECT USING (true);
CREATE POLICY "Users manage their avis" ON public.avis FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER update_avis_updated_at BEFORE UPDATE ON public.avis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ MESSAGERIE ============
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  subject text,
  context_type text,
  context_id uuid,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants see their conversations" ON public.conversations FOR SELECT TO authenticated
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());
CREATE POLICY "Buyers create conversations" ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "Participants update their conversations" ON public.conversations FOR UPDATE TO authenticated
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read messages" ON public.messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())));
CREATE POLICY "Participants send messages" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())));
CREATE POLICY "Participants mark read" ON public.messages FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())));

-- ============ ABONNEMENTS PUBLICITAIRES ============
CREATE TABLE public.ad_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  boutique_id uuid REFERENCES public.boutiques(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 5000,
  months integer NOT NULL DEFAULT 1,
  operator text NOT NULL,
  phone text NOT NULL,
  otp_code text,
  otp_verified boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.ad_subscriptions TO authenticated;
GRANT ALL ON public.ad_subscriptions TO service_role;
ALTER TABLE public.ad_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their subscriptions" ON public.ad_subscriptions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'founder'));
CREATE POLICY "Users create their subscriptions" ON public.ad_subscriptions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update their subscriptions" ON public.ad_subscriptions FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER update_ad_subscriptions_updated_at BEFORE UPDATE ON public.ad_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ANNONCES INSTITUTIONNELLES ============
CREATE TABLE public.annonces_institutionnelles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid,
  institution text NOT NULL,
  titre text NOT NULL,
  contenu text NOT NULL,
  ville text,
  image_url text,
  event_date date,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.annonces_institutionnelles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.annonces_institutionnelles TO authenticated;
GRANT ALL ON public.annonces_institutionnelles TO service_role;
ALTER TABLE public.annonces_institutionnelles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published annonces viewable by everyone" ON public.annonces_institutionnelles FOR SELECT USING (is_published = true);
CREATE POLICY "Institutions manage annonces" ON public.annonces_institutionnelles FOR ALL TO authenticated
  USING (author_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'founder'))
  WITH CHECK (author_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'founder'));
CREATE TRIGGER update_annonces_inst_updated_at BEFORE UPDATE ON public.annonces_institutionnelles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ANTI-SPAM ============
CREATE TABLE public.rate_limit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.rate_limit_events TO authenticated;
GRANT ALL ON public.rate_limit_events TO service_role;
ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read their rate limit events" ON public.rate_limit_events FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE INDEX idx_rate_limit_user_action ON public.rate_limit_events(user_id, action, created_at DESC);

CREATE OR REPLACE FUNCTION public.check_rate_limit(_action text, _max_events integer, _window_seconds integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  recent integer;
BEGIN
  IF uid IS NULL THEN
    RETURN false;
  END IF;
  SELECT count(*) INTO recent
  FROM public.rate_limit_events
  WHERE user_id = uid AND action = _action
    AND created_at > now() - make_interval(secs => _window_seconds);
  IF recent >= _max_events THEN
    RETURN false;
  END IF;
  INSERT INTO public.rate_limit_events (user_id, action) VALUES (uid, _action);
  DELETE FROM public.rate_limit_events
  WHERE user_id = uid AND created_at < now() - interval '1 day';
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer) TO authenticated;

-- ============ CLASSEMENT CITOYEN ============
CREATE OR REPLACE FUNCTION public.get_citizen_leaderboard(_limit integer DEFAULT 20)
RETURNS TABLE(rang bigint, pseudo text, resolus bigint, total bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ROW_NUMBER() OVER (ORDER BY COUNT(*) FILTER (WHERE s.status = 'RESOLVED') DESC, COUNT(*) DESC) AS rang,
    COALESCE(split_part(p.prenoms,' ',1) || ' ' || left(p.nom,1) || '.', 'Citoyen') AS pseudo,
    COUNT(*) FILTER (WHERE s.status = 'RESOLVED')::bigint AS resolus,
    COUNT(*)::bigint AS total
  FROM public.signalements s
  LEFT JOIN public.profiles p ON p.user_id = s.user_id
  GROUP BY p.prenoms, p.nom, s.user_id
  ORDER BY resolus DESC, total DESC
  LIMIT _limit;
$$;
GRANT EXECUTE ON FUNCTION public.get_citizen_leaderboard(integer) TO anon, authenticated;

-- ============ CARTE PUBLIQUE DES SIGNALEMENTS ============
CREATE OR REPLACE FUNCTION public.get_public_signalement_pins()
RETURNS TABLE(id uuid, latitude numeric, longitude numeric, ville text, category text, status text, created_at timestamptz)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.latitude, s.longitude, s.ville, s.category, s.status, s.created_at
  FROM public.signalements s
  WHERE s.latitude IS NOT NULL AND s.longitude IS NOT NULL;
$$;
GRANT EXECUTE ON FUNCTION public.get_public_signalement_pins() TO anon, authenticated;
