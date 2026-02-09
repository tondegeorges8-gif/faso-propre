
-- 1. Drop the current permissive user update policy
DROP POLICY IF EXISTS "Users can update own signalement content" ON public.signalements;

-- 2. Recreate user update policy with a trigger-based guard
-- Since RLS can't restrict columns, we use a trigger to block status changes by non-collectors

-- 3. Add collector-specific UPDATE policy for paid signalements
CREATE POLICY "Collectors can update signalement status"
  ON public.signalements FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'collector'::app_role) AND
    statut_paiement = 'paye'
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'collector'::app_role) AND
    statut_paiement = 'paye'
  );

-- 4. Recreate user update policy (still needed for description/photo updates)
CREATE POLICY "Users can update own signalement content"
  ON public.signalements FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Create a trigger function that prevents non-collectors from changing the status field
CREATE OR REPLACE FUNCTION public.protect_signalement_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If status is being changed, only allow collectors, founders, admins, and institution users
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Allow founders
    IF public.has_role(auth.uid(), 'founder'::app_role) THEN
      RETURN NEW;
    END IF;
    -- Allow admins
    IF public.has_role(auth.uid(), 'admin'::app_role) THEN
      RETURN NEW;
    END IF;
    -- Allow collectors (only on paid signalements)
    IF public.has_role(auth.uid(), 'collector'::app_role) AND OLD.statut_paiement = 'paye' THEN
      RETURN NEW;
    END IF;
    -- Allow institution users for their category
    IF EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND institution = OLD.category
    ) THEN
      RETURN NEW;
    END IF;
    -- Block all others
    RAISE EXCEPTION 'Vous n''êtes pas autorisé à modifier le statut du signalement';
  END IF;
  
  RETURN NEW;
END;
$$;

-- 6. Attach the trigger
DROP TRIGGER IF EXISTS protect_signalement_status_trigger ON public.signalements;
CREATE TRIGGER protect_signalement_status_trigger
  BEFORE UPDATE ON public.signalements
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_signalement_status();
