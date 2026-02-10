
-- Drop all existing RLS policies on profiles
DROP POLICY IF EXISTS "Deny anonymous access" ON public.profiles;
DROP POLICY IF EXISTS "Founders can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Block anonymous access explicitly
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
AS PERMISSIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Users can view their own profile only
CREATE POLICY "Users can view own profile"
ON public.profiles
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile only
CREATE POLICY "Users can update own profile"
ON public.profiles
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Founders and admins can view all profiles (needed for admin features)
CREATE POLICY "Founders and admins can view all profiles"
ON public.profiles
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'founder'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));
