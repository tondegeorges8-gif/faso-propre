
-- 1. Ensure RLS is enabled on founder_transactions
ALTER TABLE public.founder_transactions ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to recreate them cleanly with TO authenticated
DROP POLICY IF EXISTS "Founders can view all transactions" ON public.founder_transactions;
DROP POLICY IF EXISTS "Founders can insert transactions" ON public.founder_transactions;
DROP POLICY IF EXISTS "Founders can update transactions" ON public.founder_transactions;

-- 3. Recreate founder-only policies with explicit TO authenticated
CREATE POLICY "Founders can view all transactions"
  ON public.founder_transactions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'founder'));

CREATE POLICY "Founders can insert transactions"
  ON public.founder_transactions FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'founder'));

CREATE POLICY "Founders can update transactions"
  ON public.founder_transactions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'founder'));

-- 4. Explicitly deny anonymous access
CREATE POLICY "Deny anonymous access"
  ON public.founder_transactions FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);
