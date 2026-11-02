CREATE OR REPLACE FUNCTION public.is_app_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = auth.uid() AND u.email = 'tondegeorges8@gmail.com' AND u.email_confirmed_at IS NOT NULL); $$;
REVOKE ALL ON FUNCTION public.is_app_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_app_admin() TO authenticated, service_role;
CREATE OR REPLACE FUNCTION public.is_admin_entry_account()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = auth.uid() AND u.email = 'luxeeternel98@gmail.com' AND u.email_confirmed_at IS NOT NULL); $$;
REVOKE ALL ON FUNCTION public.is_admin_entry_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin_entry_account() TO authenticated, service_role;