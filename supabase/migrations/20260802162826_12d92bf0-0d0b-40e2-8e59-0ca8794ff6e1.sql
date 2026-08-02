CREATE TABLE public.signalement_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signalement_id uuid NOT NULL REFERENCES public.signalements(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_signalement_status_history_sig ON public.signalement_status_history(signalement_id, created_at DESC);

GRANT SELECT ON public.signalement_status_history TO authenticated;
GRANT ALL ON public.signalement_status_history TO service_role;

ALTER TABLE public.signalement_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view status history"
ON public.signalement_status_history FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.signalements s
  WHERE s.id = signalement_id AND s.user_id = auth.uid()
));

CREATE POLICY "Staff can view status history"
ON public.signalement_status_history FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'founder'::app_role)
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'collector'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.signalements s
    JOIN public.user_roles ur ON ur.user_id = auth.uid()
    WHERE s.id = signalement_id AND ur.institution = s.category
  )
);

CREATE OR REPLACE FUNCTION public.log_signalement_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.signalement_status_history (signalement_id, old_status, new_status, changed_by)
    VALUES (NEW.id, NULL, NEW.status, auth.uid());
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.signalement_status_history (signalement_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_signalement_status_insert
AFTER INSERT ON public.signalements
FOR EACH ROW EXECUTE FUNCTION public.log_signalement_status_change();

CREATE TRIGGER trg_log_signalement_status_update
AFTER UPDATE OF status ON public.signalements
FOR EACH ROW EXECUTE FUNCTION public.log_signalement_status_change();

-- Seed history for existing signalements
INSERT INTO public.signalement_status_history (signalement_id, old_status, new_status, changed_by, created_at)
SELECT id, NULL, status, user_id, created_at FROM public.signalements;