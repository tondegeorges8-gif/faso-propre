-- Remap legacy rows to the current institution/problem taxonomy
UPDATE public.signalements
SET category = 'VOIRIE', subcategory = 'Dépôt d''ordure sauvage'
WHERE subcategory = 'Animal mort sur la voie';

UPDATE public.signalements
SET category = 'MAIRIE', subcategory = 'Autorisation de construction illégale'
WHERE subcategory = 'Contrôle qualité chantier';

UPDATE public.signalements
SET subcategory = 'Coupure d''eau excessive'
WHERE category = 'ONEA' AND subcategory = 'Coupure d''eau';

-- Ensure every report is attached to a known institution
ALTER TABLE public.signalements
  DROP CONSTRAINT IF EXISTS signalements_category_valid;

ALTER TABLE public.signalements
  ADD CONSTRAINT signalements_category_valid
  CHECK (category IN (
    'ONEA','SONABEL','ONASER','ANASUR','POLICE_MUN','VOIRIE',
    'LABO_NAT','MAIRIE','SANTE','ARCEP','MENAPLN'
  ));