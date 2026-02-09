
-- 1. Drop all existing SELECT policies on signalements
DROP POLICY IF EXISTS "Users can view own signalements" ON public.signalements;
DROP POLICY IF EXISTS "Admins can view all signalements" ON public.signalements;
DROP POLICY IF EXISTS "Founders can view all signalements" ON public.signalements;
DROP POLICY IF EXISTS "Collectors can view paid signalements" ON public.signalements;
DROP POLICY IF EXISTS "Institution users can view their signalements" ON public.signalements;
DROP POLICY IF EXISTS "Users can insert own signalements" ON public.signalements;
DROP POLICY IF EXISTS "Users can update own signalements" ON public.signalements;
DROP POLICY IF EXISTS "Founders can update all signalements" ON public.signalements;
DROP POLICY IF EXISTS "Institution users can update their signalements status" ON public.signalements;

-- 2. Recreate all policies with explicit TO authenticated (defense-in-depth)

-- SELECT policies
CREATE POLICY "Users can view own signalements"
  ON public.signalements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all signalements"
  ON public.signalements FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Founders can view all signalements"
  ON public.signalements FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'founder'));

CREATE POLICY "Collectors can view paid signalements"
  ON public.signalements FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'collector') AND statut_paiement = 'paye');

CREATE POLICY "Institution users can view their signalements"
  ON public.signalements FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.institution = signalements.category
  ));

-- INSERT policy
CREATE POLICY "Users can insert own signalements"
  ON public.signalements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE policies (restricted by role)
CREATE POLICY "Users can update own signalement content"
  ON public.signalements FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Founders can update all signalements"
  ON public.signalements FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'founder'));

CREATE POLICY "Institution users can update their signalements status"
  ON public.signalements FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.institution = signalements.category
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.institution = signalements.category
  ));

-- 3. Explicitly deny anonymous access
CREATE POLICY "Deny anonymous access"
  ON public.signalements FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);
