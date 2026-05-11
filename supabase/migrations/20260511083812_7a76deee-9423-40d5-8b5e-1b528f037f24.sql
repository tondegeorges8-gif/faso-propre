CREATE OR REPLACE FUNCTION public.get_public_cleanliness_stats()
RETURNS TABLE(ville text, total bigint, resolved bigint, pending bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ville,
    COUNT(*)::bigint AS total,
    COUNT(*) FILTER (WHERE status = 'RESOLVED')::bigint AS resolved,
    COUNT(*) FILTER (WHERE status <> 'RESOLVED')::bigint AS pending
  FROM public.signalements
  GROUP BY ville;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_cleanliness_stats() TO authenticated, anon;