ALTER TABLE public.signalements
  ADD COLUMN IF NOT EXISTS photos text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS audio_urls text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS adresse text,
  ADD COLUMN IF NOT EXISTS repere text,
  ADD COLUMN IF NOT EXISTS urgence text NOT NULL DEFAULT 'normale',
  ADD COLUMN IF NOT EXISTS gps_accuracy numeric,
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.signalements(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reporters_count integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE public.signalement_followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signalement_id uuid NOT NULL REFERENCES public.signalements(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (signalement_id, user_id)
);
GRANT SELECT ON public.signalement_followers TO authenticated;
GRANT ALL ON public.signalement_followers TO service_role;
ALTER TABLE public.signalement_followers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own follows" ON public.signalement_followers
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'founder') OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.submit_signalement(
  _category text, _subcategory text, _nom_complet text, _description text,
  _photos text[], _audio_url text, _latitude numeric, _longitude numeric,
  _gps_accuracy numeric, _adresse text, _repere text, _urgence text, _submitted_at timestamptz)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  parent record;
  new_id uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Non authentifié'; END IF;
  IF coalesce(array_length(_photos,1),0) < 1 OR array_length(_photos,1) > 5 THEN
    RAISE EXCEPTION 'Entre 1 et 5 photos requises';
  END IF;
  IF _urgence NOT IN ('faible','normale','elevee','danger') THEN _urgence := 'normale'; END IF;

  IF _latitude IS NOT NULL AND _longitude IS NOT NULL THEN
    SELECT s.id, s.reporters_count INTO parent
    FROM public.signalements s
    WHERE s.category = _category AND s.parent_id IS NULL AND s.status <> 'RESOLVED'
      AND s.latitude IS NOT NULL AND s.longitude IS NOT NULL
      AND 6371000 * 2 * asin(sqrt(
        power(sin(radians((s.latitude - _latitude)/2)),2) +
        cos(radians(_latitude)) * cos(radians(s.latitude)) *
        power(sin(radians((s.longitude - _longitude)/2)),2))) <= 50
    ORDER BY s.created_at ASC LIMIT 1;
  END IF;

  INSERT INTO public.signalements (user_id, nom_complet, category, subcategory, ville, description,
    photo_url, photos, audio_url, audio_urls, latitude, longitude, gps_accuracy, adresse, quartier, repere,
    urgence, status, statut_paiement, montant_total, commission_montant, parent_id, submitted_at)
  VALUES (uid, _nom_complet, _category, _subcategory, 'Non spécifiée', _description,
    _photos[1], _photos, _audio_url, CASE WHEN _audio_url IS NULL THEN '{}'::text[] ELSE ARRAY[_audio_url] END,
    _latitude, _longitude, _gps_accuracy, _adresse, _adresse, _repere,
    _urgence, 'PENDING', 'en_attente', 0, 0, parent.id, coalesce(_submitted_at, now()))
  RETURNING id INTO new_id;

  IF parent.id IS NOT NULL THEN
    UPDATE public.signalements SET
      reporters_count = reporters_count + 1,
      photos = photos || _photos,
      audio_urls = CASE WHEN _audio_url IS NULL THEN audio_urls ELSE audio_urls || _audio_url END
    WHERE id = parent.id;
    INSERT INTO public.signalement_followers (signalement_id, user_id) VALUES (parent.id, uid)
      ON CONFLICT DO NOTHING;
    RETURN jsonb_build_object('id', new_id, 'parent_id', parent.id, 'merged', true, 'count', parent.reporters_count + 1);
  END IF;

  INSERT INTO public.signalement_followers (signalement_id, user_id) VALUES (new_id, uid) ON CONFLICT DO NOTHING;
  RETURN jsonb_build_object('id', new_id, 'parent_id', null, 'merged', false, 'count', 1);
END $$;
GRANT EXECUTE ON FUNCTION public.submit_signalement(text,text,text,text,text[],text,numeric,numeric,numeric,text,text,text,timestamptz) TO authenticated;