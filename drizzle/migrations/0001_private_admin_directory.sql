CREATE OR REPLACE FUNCTION public.is_app_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = auth.uid() AND u.email = 'tondegeorges8@gmail.com' AND u.email_confirmed_at IS NOT NULL);
$$;
REVOKE ALL ON FUNCTION public.is_app_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_app_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_admin_registrations(_month text DEFAULT NULL, _search text DEFAULT '', _page integer DEFAULT 0)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.is_app_admin() THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;
  IF _month IS NOT NULL AND _month !~ '^\d{4}-(0[1-9]|1[0-2])$' THEN
    RAISE EXCEPTION 'Mois invalide' USING ERRCODE = '22023';
  END IF;
  WITH registered AS (
    SELECT u.id, u.created_at,
      COALESCE(NULLIF(p.nom, ''), u.raw_user_meta_data->>'nom', '') AS nom,
      COALESCE(NULLIF(p.prenoms, ''), u.raw_user_meta_data->>'prenoms', '') AS prenoms,
      COALESCE(NULLIF(p.telephone, ''), NULLIF(u.phone, ''), u.raw_user_meta_data->>'telephone', '') AS telephone,
      COALESCE(u.email, '') AS email,
      COALESCE((SELECT NULLIF(s.ville, '') FROM public.signalements s WHERE s.user_id = u.id AND NULLIF(s.ville, '') IS NOT NULL ORDER BY s.created_at DESC LIMIT 1), NULLIF(u.raw_user_meta_data->>'ville', '')) AS ville
    FROM auth.users u
    LEFT JOIN LATERAL (SELECT pr.* FROM public.profiles pr WHERE pr.user_id = u.id ORDER BY pr.created_at DESC LIMIT 1) p ON true
  ), filtered AS (
    SELECT * FROM registered r
    WHERE (_month IS NULL OR to_char(r.created_at AT TIME ZONE 'UTC', 'YYYY-MM') = _month)
      AND (COALESCE(_search, '') = '' OR strpos(lower(concat_ws(' ', r.nom, r.prenoms, r.telephone, r.email, r.ville)), lower(trim(_search))) > 0)
  ), paged AS (
    SELECT * FROM filtered ORDER BY created_at DESC, id LIMIT 50 OFFSET greatest(COALESCE(_page, 0), 0) * 50
  )
  SELECT jsonb_build_object(
    'total', (SELECT count(*) FROM registered),
    'filtered_total', (SELECT count(*) FROM filtered),
    'months', COALESCE((SELECT jsonb_agg(m.month ORDER BY m.month DESC) FROM (SELECT DISTINCT to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM') AS month FROM registered) m), '[]'::jsonb),
    'users', COALESCE((SELECT jsonb_agg(to_jsonb(paged) ORDER BY created_at DESC, id) FROM paged), '[]'::jsonb)
  ) INTO result;
  RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.get_admin_registrations(text, text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_registrations(text, text, integer) TO authenticated;