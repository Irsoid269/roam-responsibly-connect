-- Phase 2 (compensation) — Mode A : dons aux associations (cahier §7.8).
-- Le Mode B (actions durables + QR) reste hors périmètre de cette migration,
-- volontairement scindé pour livrer par tranches vérifiables.

CREATE TABLE IF NOT EXISTS public.ngos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  mission text,
  logo_url text,
  impact_label text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active ngos" ON public.ngos;
CREATE POLICY "Anyone can read active ngos"
ON public.ngos FOR SELECT
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage ngos insert" ON public.ngos;
CREATE POLICY "Admins manage ngos insert"
ON public.ngos FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage ngos update" ON public.ngos;
CREATE POLICY "Admins manage ngos update"
ON public.ngos FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage ngos delete" ON public.ngos;
CREATE POLICY "Admins manage ngos delete"
ON public.ngos FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Dons : le paiement en ligne des dons n'est pas encore branché sur Stripe
-- (seul le panier de réservation l'est) — un don est donc créé "pending" par
-- le visiteur et confirmé manuellement par un admin jusqu'à ce que ce module
-- soit lui aussi raccordé à un vrai paiement. Pas de fausse promesse de
-- "paiement sécurisé" tant que ce n'est pas vrai.
CREATE TABLE IF NOT EXISTS public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reservation_id uuid REFERENCES public.reservations(id) ON DELETE SET NULL,
  ngo_id uuid NOT NULL REFERENCES public.ngos(id),
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  co2_offset_kg numeric,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  receipt_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz
);

CREATE INDEX IF NOT EXISTS donations_user_id_idx ON public.donations (user_id);
CREATE INDEX IF NOT EXISTS donations_ngo_id_idx ON public.donations (ngo_id);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own donations" ON public.donations;
CREATE POLICY "Users can read their own donations"
ON public.donations FOR SELECT
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can pledge a donation" ON public.donations;
CREATE POLICY "Authenticated users can pledge a donation"
ON public.donations FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update donations" ON public.donations;
CREATE POLICY "Admins can update donations"
ON public.donations FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.donation_reversements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id uuid NOT NULL REFERENCES public.ngos(id),
  amount numeric(10,2) NOT NULL,
  batch_date timestamptz NOT NULL DEFAULT now(),
  proof_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.donation_reversements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage donation reversements select" ON public.donation_reversements;
CREATE POLICY "Admins manage donation reversements select"
ON public.donation_reversements FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage donation reversements insert" ON public.donation_reversements;
CREATE POLICY "Admins manage donation reversements insert"
ON public.donation_reversements FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed : les 4 associations déjà présentes (en dur) dans CompensationOptions.tsx,
-- pour ne rien perdre visuellement au moment de brancher les vraies données.
INSERT INTO public.ngos (name, description, mission, logo_url, impact_label, sort_order)
SELECT * FROM (VALUES
  ('Reforest''Action', 'Plantation d''arbres en France et dans le monde', 'Reforestation et lutte contre la déforestation', '🌳', '1 arbre planté = 25kg CO₂ absorbés/an', 1),
  ('Sea Shepherd', 'Protection des océans et de la vie marine', 'Défense directe des écosystèmes marins', '🐋', 'Protection directe des écosystèmes marins', 2),
  ('Surfrider Foundation', 'Protection du littoral et des océans', 'Préservation du littoral et sensibilisation', '🌊', 'Nettoyage des plages et sensibilisation', 3),
  ('WWF France', 'Protection de la biodiversité mondiale', 'Conservation des espèces et des habitats', '🐼', 'Conservation des espèces menacées', 4)
) AS v(name, description, mission, logo_url, impact_label, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.ngos LIMIT 1);
