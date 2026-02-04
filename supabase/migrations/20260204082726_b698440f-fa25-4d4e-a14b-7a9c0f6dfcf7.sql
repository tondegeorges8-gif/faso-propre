-- =============================================
-- SYSTÈME PARTENAIRES & POINTS FIDÉLITÉ
-- =============================================

-- 1. Table des partenaires/sponsors
CREATE TABLE public.sponsors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE, -- Ex: ORANGE_BF_01, CORIS_BANK
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- telecoms, banque, industrie, energie, assurance
  role TEXT NOT NULL, -- Ex: "Sponsor Connectivité"
  advantage TEXT, -- Avantage offert aux utilisateurs
  logo_url TEXT,
  contact_email TEXT,
  contract_start DATE,
  contract_end DATE,
  monthly_fee NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Table des publicités/bannières sponsors
CREATE TABLE public.sponsor_ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id UUID NOT NULL REFERENCES public.sponsors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  banner_image_url TEXT,
  target_institutions TEXT[], -- Ex: ['ONEA', 'SONABEL'] ou NULL pour toutes
  action_label TEXT, -- Ex: "Payer via Orange Money"
  action_url TEXT,
  display_type TEXT DEFAULT 'banner', -- banner, popup, inline
  priority INTEGER DEFAULT 0, -- Plus élevé = plus prioritaire
  impressions_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Table des points fidélité utilisateur
CREATE TABLE public.user_loyalty_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0,
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 4. Historique des transactions de points
CREATE TABLE public.loyalty_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL, -- Positif = gain, Négatif = dépense
  transaction_type TEXT NOT NULL, -- signalement, referral, redemption, bonus
  description TEXT,
  related_signalement_id UUID REFERENCES public.signalements(id) ON DELETE SET NULL,
  related_sponsor_id UUID REFERENCES public.sponsors(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Catalogue des récompenses échangeables
CREATE TABLE public.loyalty_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id UUID REFERENCES public.sponsors(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  image_url TEXT,
  stock_quantity INTEGER, -- NULL = illimité
  redemptions_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger updated_at pour sponsors
CREATE TRIGGER update_sponsors_updated_at
  BEFORE UPDATE ON public.sponsors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger updated_at pour user_loyalty_points
CREATE TRIGGER update_loyalty_points_updated_at
  BEFORE UPDATE ON public.user_loyalty_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour créditer des points après un signalement payé
CREATE OR REPLACE FUNCTION public.credit_loyalty_points_on_signalement()
RETURNS TRIGGER AS $$
DECLARE
  points_to_add INTEGER := 10; -- 10 points par signalement payé
BEGIN
  IF NEW.statut_paiement = 'paye' AND (OLD.statut_paiement IS NULL OR OLD.statut_paiement != 'paye') THEN
    -- Insérer ou mettre à jour les points utilisateur
    INSERT INTO public.user_loyalty_points (user_id, total_points, lifetime_earned)
    VALUES (NEW.user_id, points_to_add, points_to_add)
    ON CONFLICT (user_id)
    DO UPDATE SET 
      total_points = user_loyalty_points.total_points + points_to_add,
      lifetime_earned = user_loyalty_points.lifetime_earned + points_to_add,
      updated_at = now();
    
    -- Logger la transaction
    INSERT INTO public.loyalty_transactions (
      user_id, points, transaction_type, description, related_signalement_id
    ) VALUES (
      NEW.user_id, 
      points_to_add, 
      'signalement', 
      'Points gagnés - Signalement #' || NEW.id::TEXT,
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attacher le trigger aux signalements
CREATE TRIGGER on_signalement_paid_credit_points
  AFTER UPDATE ON public.signalements
  FOR EACH ROW
  EXECUTE FUNCTION public.credit_loyalty_points_on_signalement();

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;

-- Sponsors: Lecture publique, modification admin/founder uniquement
CREATE POLICY "Anyone can view active sponsors" 
  ON public.sponsors FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage sponsors" 
  ON public.sponsors FOR ALL 
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'founder'));

-- Sponsor Ads: Lecture publique des actives
CREATE POLICY "Anyone can view active ads" 
  ON public.sponsor_ads FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage ads" 
  ON public.sponsor_ads FOR ALL 
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'founder'));

-- Loyalty Points: Utilisateurs voient leurs points
CREATE POLICY "Users can view own points" 
  ON public.user_loyalty_points FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage points" 
  ON public.user_loyalty_points FOR ALL 
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'founder'));

-- Loyalty Transactions: Utilisateurs voient leur historique
CREATE POLICY "Users can view own transactions" 
  ON public.loyalty_transactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" 
  ON public.loyalty_transactions FOR SELECT 
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'founder'));

-- Rewards: Lecture publique des actives
CREATE POLICY "Anyone can view active rewards" 
  ON public.loyalty_rewards FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage rewards" 
  ON public.loyalty_rewards FOR ALL 
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'founder'));

-- =============================================
-- DONNÉES INITIALES DES PARTENAIRES
-- =============================================

INSERT INTO public.sponsors (code, name, category, role, advantage) VALUES
('ORANGE_MOOV', 'Orange Money', 'telecoms', 'Sponsor Connectivité', 'Zero-rating: App gratuite sans forfait data'),
('CORIS_BANK', 'Coris Bank', 'banque', 'Sponsor Inclusion', 'Bouton de don intégré pour les quartiers'),
('BRAKINA', 'Brakina', 'industrie', 'Sponsor Recyclage', 'Points fidélité échangeables contre produits'),
('TOTAL_ENERGIES', 'Total Energies', 'energie', 'Sponsor Logistique', 'Points de collecte signalés sur la carte'),
('SONAR_SAHAM', 'Sonar Saham', 'assurance', 'Sponsor Sécurité', 'Accès aux stats pour réduire les risques');

-- Pub par défaut Orange Money
INSERT INTO public.sponsor_ads (sponsor_id, title, description, target_institutions, action_label, display_type, priority)
SELECT id, 'Signalez gratuitement avec Orange', 'Utilisez Faso Propre sans consommer de data grâce à Orange Money', 
  NULL, 'En savoir plus', 'banner', 10
FROM public.sponsors WHERE code = 'ORANGE_MOOV';

-- Récompenses initiales
INSERT INTO public.loyalty_rewards (name, description, points_cost, sponsor_id)
SELECT 'Crédit téléphonique 500F', 'Échangez vos points contre du crédit téléphonique', 50, id
FROM public.sponsors WHERE code = 'ORANGE_MOOV';

INSERT INTO public.loyalty_rewards (name, description, points_cost, sponsor_id)
SELECT 'Casquette Faso Propre', 'Casquette exclusive aux couleurs de l''initiative', 100, id
FROM public.sponsors WHERE code = 'BRAKINA';