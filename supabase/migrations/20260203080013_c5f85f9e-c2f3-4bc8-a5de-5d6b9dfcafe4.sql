-- Create founder_transactions table to track all financial movements
CREATE TABLE public.founder_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('inscription_gain', 'withdrawal', 'commission')),
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  related_user_id UUID,
  withdrawal_phone TEXT,
  withdrawal_network TEXT,
  withdrawal_status TEXT DEFAULT 'pending' CHECK (withdrawal_status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.founder_transactions ENABLE ROW LEVEL SECURITY;

-- Only founders can view transactions
CREATE POLICY "Founders can view all transactions"
  ON public.founder_transactions
  FOR SELECT
  USING (public.has_role(auth.uid(), 'founder'));

-- Only founders can insert transactions (for withdrawals)
CREATE POLICY "Founders can insert transactions"
  ON public.founder_transactions
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'founder'));

-- Only founders can update transactions
CREATE POLICY "Founders can update transactions"
  ON public.founder_transactions
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'founder'));

-- Create founder_balance view for easy balance calculation
CREATE VIEW public.founder_balance 
WITH (security_invoker = on) AS
SELECT 
  COALESCE(SUM(CASE WHEN transaction_type IN ('inscription_gain', 'commission') THEN amount ELSE 0 END), 0) -
  COALESCE(SUM(CASE WHEN transaction_type = 'withdrawal' AND withdrawal_status = 'completed' THEN amount ELSE 0 END), 0) AS current_balance,
  COUNT(CASE WHEN transaction_type = 'inscription_gain' THEN 1 END) AS total_inscriptions,
  COALESCE(SUM(CASE WHEN transaction_type = 'inscription_gain' THEN amount ELSE 0 END), 0) AS total_inscription_gains,
  COALESCE(SUM(CASE WHEN transaction_type = 'commission' THEN amount ELSE 0 END), 0) AS total_commissions,
  COALESCE(SUM(CASE WHEN transaction_type = 'withdrawal' AND withdrawal_status = 'completed' THEN amount ELSE 0 END), 0) AS total_withdrawn
FROM public.founder_transactions;

-- Create function to auto-credit founder on new user registration
CREATE OR REPLACE FUNCTION public.credit_founder_on_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inscription_gain NUMERIC := 500;
BEGIN
  INSERT INTO public.founder_transactions (
    transaction_type,
    amount,
    description,
    related_user_id
  ) VALUES (
    'inscription_gain',
    inscription_gain,
    'Gain automatique - Nouvelle inscription utilisateur',
    NEW.user_id
  );
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table to credit founder when new profile is created
CREATE TRIGGER on_profile_created_credit_founder
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.credit_founder_on_registration();

-- Create function to add commission on paid signalement
CREATE OR REPLACE FUNCTION public.credit_founder_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.statut_paiement = 'paye' AND (OLD.statut_paiement IS NULL OR OLD.statut_paiement != 'paye') THEN
    INSERT INTO public.founder_transactions (
      transaction_type,
      amount,
      description,
      related_user_id
    ) VALUES (
      'commission',
      NEW.commission_montant,
      'Commission 10% - Signalement #' || NEW.id::TEXT,
      NEW.user_id
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on signalements for commission tracking
CREATE TRIGGER on_signalement_paid_credit_commission
  AFTER UPDATE ON public.signalements
  FOR EACH ROW
  EXECUTE FUNCTION public.credit_founder_commission();

-- Create function to check if current user is founder
CREATE OR REPLACE FUNCTION public.is_founder()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'founder')
$$;