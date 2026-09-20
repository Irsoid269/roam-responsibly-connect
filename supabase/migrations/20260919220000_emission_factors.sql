-- Phase 2 (empreinte carbone) — facteurs d'émission paramétrables et
-- versionnés (cahier §7.7, gap P0 : "calcul simplifié, pas de facteurs
-- paramétrables ni versionnés"). Remplace les valeurs actuellement codées en
-- dur dans CarbonCalculator.tsx.

CREATE TABLE IF NOT EXISTS public.emission_factor_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.emission_factor_sets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read emission factor sets" ON public.emission_factor_sets;
CREATE POLICY "Anyone can read emission factor sets"
ON public.emission_factor_sets FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins manage emission factor sets insert" ON public.emission_factor_sets;
CREATE POLICY "Admins manage emission factor sets insert"
ON public.emission_factor_sets FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage emission factor sets update" ON public.emission_factor_sets;
CREATE POLICY "Admins manage emission factor sets update"
ON public.emission_factor_sets FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage emission factor sets delete" ON public.emission_factor_sets;
CREATE POLICY "Admins manage emission factor sets delete"
ON public.emission_factor_sets FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.emission_factors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id uuid NOT NULL REFERENCES public.emission_factor_sets(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('transport', 'accommodation', 'mobility', 'activity')),
  subcategory text NOT NULL,
  value numeric NOT NULL,
  unit text NOT NULL,
  valid_from date NOT NULL DEFAULT current_date,
  valid_to date,
  UNIQUE (set_id, category, subcategory)
);

CREATE INDEX IF NOT EXISTS emission_factors_set_id_idx ON public.emission_factors (set_id);

ALTER TABLE public.emission_factors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read emission factors" ON public.emission_factors;
CREATE POLICY "Anyone can read emission factors"
ON public.emission_factors FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins manage emission factors insert" ON public.emission_factors;
CREATE POLICY "Admins manage emission factors insert"
ON public.emission_factors FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage emission factors update" ON public.emission_factors;
CREATE POLICY "Admins manage emission factors update"
ON public.emission_factors FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage emission factors delete" ON public.emission_factors;
CREATE POLICY "Admins manage emission factors delete"
ON public.emission_factors FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Trace, sur chaque estimation enregistrée, la version des facteurs utilisée
-- (cahier: "chaque calcul enregistre la version des facteurs utilisés").
ALTER TABLE public.carbon_footprint_history
  ADD COLUMN IF NOT EXISTS emission_factor_set_id uuid REFERENCES public.emission_factor_sets(id);

-- Seed : reprend exactement les valeurs actuellement codées en dur dans
-- CarbonCalculator.tsx, comme version 1 active — aucun changement de
-- résultat visible pour l'utilisateur au moment de la bascule.
INSERT INTO public.emission_factor_sets (id, name, is_active, published_at)
SELECT '00000000-0000-0000-0000-000000000001', 'Version initiale (2026)', true, now()
WHERE NOT EXISTS (SELECT 1 FROM public.emission_factor_sets LIMIT 1);

INSERT INTO public.emission_factors (set_id, category, subcategory, value, unit) VALUES
  ('00000000-0000-0000-0000-000000000001', 'transport', 'plane', 0.255, 'kg/km'),
  ('00000000-0000-0000-0000-000000000001', 'transport', 'train', 0.014, 'kg/km'),
  ('00000000-0000-0000-0000-000000000001', 'transport', 'car', 0.193, 'kg/km'),
  ('00000000-0000-0000-0000-000000000001', 'transport', 'bus', 0.089, 'kg/km'),
  ('00000000-0000-0000-0000-000000000001', 'accommodation', 'hotel', 21.3, 'kg/nuit'),
  ('00000000-0000-0000-0000-000000000001', 'accommodation', 'apartment', 12.5, 'kg/nuit'),
  ('00000000-0000-0000-0000-000000000001', 'accommodation', 'hostel', 8.2, 'kg/nuit'),
  ('00000000-0000-0000-0000-000000000001', 'accommodation', 'eco_lodge', 5.4, 'kg/nuit'),
  ('00000000-0000-0000-0000-000000000001', 'mobility', 'scooter', 0.025, 'kg/km'),
  ('00000000-0000-0000-0000-000000000001', 'mobility', 'bike', 0.006, 'kg/km'),
  ('00000000-0000-0000-0000-000000000001', 'mobility', 'public', 0.089, 'kg/km'),
  ('00000000-0000-0000-0000-000000000001', 'mobility', 'walking', 0, 'kg/km'),
  ('00000000-0000-0000-0000-000000000001', 'activity', 'restaurant', 3.5, 'kg/repas'),
  ('00000000-0000-0000-0000-000000000001', 'activity', 'museum', 0.8, 'kg/visite'),
  ('00000000-0000-0000-0000-000000000001', 'activity', 'hiking', 0.3, 'kg/sortie'),
  ('00000000-0000-0000-0000-000000000001', 'activity', 'watersports', 4.2, 'kg/session')
ON CONFLICT (set_id, category, subcategory) DO NOTHING;
