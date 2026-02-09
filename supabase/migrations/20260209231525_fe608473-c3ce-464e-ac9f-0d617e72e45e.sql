
-- founder_balance is a VIEW, not a table. We need to secure it differently.
-- First, check if RLS is on the underlying view and add security_invoker
DROP VIEW IF EXISTS public.founder_balance;

CREATE VIEW public.founder_balance
WITH (security_invoker = on)
AS
SELECT
  COUNT(*) FILTER (WHERE transaction_type = 'inscription_gain') AS total_inscriptions,
  COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'inscription_gain'), 0) AS total_inscription_gains,
  COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'commission'), 0) AS total_commissions,
  COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'withdrawal'), 0) AS total_withdrawn,
  COALESCE(SUM(CASE WHEN transaction_type IN ('inscription_gain', 'commission') THEN amount ELSE -amount END), 0) AS current_balance
FROM public.founder_transactions;
