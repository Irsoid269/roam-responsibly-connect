-- Phase 1 (réservation) — étape 1/N : unification du catalogue en "offers" +
-- disponibilités (offer_schedules) + verrous anti-surbooking (inventory_holds).
-- Les 4 tables catalogue existantes (coworking_spaces, accommodations, activities,
-- mobility_options) ne sont ni modifiées ni dupliquées : une table "offers" légère
-- est tenue à jour automatiquement par trigger, pour donner un offer_id unique aux
-- disponibilités/holds sans dupliquer la logique 4 fois.

-- 1. Table "offers" (miroir léger des 4 tables catalogue)
CREATE TABLE IF NOT EXISTS public.offers (
  id uuid PRIMARY KEY,
  offer_type text NOT NULL CHECK (offer_type IN ('coworking', 'accommodation', 'activity', 'mobility')),
  destination_id uuid REFERENCES public.destinations(id) ON DELETE SET NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read offers" ON public.offers;
CREATE POLICY "Anyone can read offers"
ON public.offers FOR SELECT
USING (true);
-- Pas de policy INSERT/UPDATE/DELETE : offers n'est écrit que par le trigger
-- sync_offer() ci-dessous (SECURITY DEFINER), jamais directement par un client.

-- 2. Trigger de synchronisation générique (id, destination_id, name sont des
-- colonnes communes aux 4 tables catalogue)
CREATE OR REPLACE FUNCTION public.sync_offer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.offers WHERE id = OLD.id;
    RETURN OLD;
  END IF;

  INSERT INTO public.offers (id, offer_type, destination_id, name)
  VALUES (NEW.id, TG_ARGV[0], NEW.destination_id, NEW.name)
  ON CONFLICT (id) DO UPDATE
    SET offer_type = EXCLUDED.offer_type,
        destination_id = EXCLUDED.destination_id,
        name = EXCLUDED.name;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_offer_coworking ON public.coworking_spaces;
CREATE TRIGGER sync_offer_coworking
AFTER INSERT OR UPDATE OR DELETE ON public.coworking_spaces
FOR EACH ROW EXECUTE FUNCTION public.sync_offer('coworking');

DROP TRIGGER IF EXISTS sync_offer_accommodation ON public.accommodations;
CREATE TRIGGER sync_offer_accommodation
AFTER INSERT OR UPDATE OR DELETE ON public.accommodations
FOR EACH ROW EXECUTE FUNCTION public.sync_offer('accommodation');

DROP TRIGGER IF EXISTS sync_offer_activity ON public.activities;
CREATE TRIGGER sync_offer_activity
AFTER INSERT OR UPDATE OR DELETE ON public.activities
FOR EACH ROW EXECUTE FUNCTION public.sync_offer('activity');

DROP TRIGGER IF EXISTS sync_offer_mobility ON public.mobility_options;
CREATE TRIGGER sync_offer_mobility
AFTER INSERT OR UPDATE OR DELETE ON public.mobility_options
FOR EACH ROW EXECUTE FUNCTION public.sync_offer('mobility');

-- 3. Backfill : copier les lignes déjà existantes des 4 tables dans offers
INSERT INTO public.offers (id, offer_type, destination_id, name)
SELECT id, 'coworking', destination_id, name FROM public.coworking_spaces
UNION ALL
SELECT id, 'accommodation', destination_id, name FROM public.accommodations
UNION ALL
SELECT id, 'activity', destination_id, name FROM public.activities
UNION ALL
SELECT id, 'mobility', destination_id, name FROM public.mobility_options
ON CONFLICT (id) DO NOTHING;

-- 4. Disponibilités (créneaux + capacité)
CREATE TABLE IF NOT EXISTS public.offer_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  capacity int NOT NULL DEFAULT 1,
  booked_count int NOT NULL DEFAULT 0,
  price_eur numeric(10,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT offer_schedules_capacity_check CHECK (booked_count >= 0 AND booked_count <= capacity),
  CONSTRAINT offer_schedules_time_check CHECK (end_at > start_at)
);

CREATE INDEX IF NOT EXISTS offer_schedules_offer_id_idx ON public.offer_schedules (offer_id);
CREATE INDEX IF NOT EXISTS offer_schedules_start_at_idx ON public.offer_schedules (start_at);

ALTER TABLE public.offer_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read offer schedules" ON public.offer_schedules;
CREATE POLICY "Anyone can read offer schedules"
ON public.offer_schedules FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins manage offer schedules insert" ON public.offer_schedules;
CREATE POLICY "Admins manage offer schedules insert"
ON public.offer_schedules FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage offer schedules update" ON public.offer_schedules;
CREATE POLICY "Admins manage offer schedules update"
ON public.offer_schedules FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage offer schedules delete" ON public.offer_schedules;
CREATE POLICY "Admins manage offer schedules delete"
ON public.offer_schedules FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Verrous logiques (holds) — écriture exclusivement via fonctions RPC ci-dessous
CREATE TABLE IF NOT EXISTS public.inventory_holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES public.offer_schedules(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  cart_id uuid,
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'consumed', 'expired', 'released')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inventory_holds_schedule_id_idx ON public.inventory_holds (schedule_id);
CREATE INDEX IF NOT EXISTS inventory_holds_status_idx ON public.inventory_holds (status);

ALTER TABLE public.inventory_holds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own holds" ON public.inventory_holds;
CREATE POLICY "Users can read their own holds"
ON public.inventory_holds FOR SELECT
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
-- Pas de policy INSERT/UPDATE/DELETE : tout passe par create_hold / release_hold /
-- consume_hold (SECURITY DEFINER), jamais en écriture directe côté client.

-- 6. create_hold : pose un verrou, avec expiration automatique du créneau
-- (verrouille la ligne offer_schedules le temps de la vérification pour empêcher
-- tout surbooking en cas de requêtes concurrentes sur le même créneau — US-05/US-06).
CREATE OR REPLACE FUNCTION public.create_hold(
  p_schedule_id uuid,
  p_quantity int DEFAULT 1,
  p_ttl_seconds int DEFAULT 600
)
RETURNS public.inventory_holds
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_schedule public.offer_schedules%ROWTYPE;
  v_expired_qty int;
  v_hold public.inventory_holds%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication_required';
  END IF;
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'invalid_quantity';
  END IF;

  SELECT * INTO v_schedule FROM public.offer_schedules WHERE id = p_schedule_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'schedule_not_found';
  END IF;

  WITH expired AS (
    UPDATE public.inventory_holds
    SET status = 'expired'
    WHERE schedule_id = p_schedule_id AND status = 'active' AND expires_at < now()
    RETURNING quantity
  )
  SELECT COALESCE(SUM(quantity), 0) INTO v_expired_qty FROM expired;

  IF v_expired_qty > 0 THEN
    UPDATE public.offer_schedules
    SET booked_count = booked_count - v_expired_qty
    WHERE id = p_schedule_id;
    v_schedule.booked_count := v_schedule.booked_count - v_expired_qty;
  END IF;

  IF v_schedule.booked_count + p_quantity > v_schedule.capacity THEN
    RAISE EXCEPTION 'unavailable';
  END IF;

  UPDATE public.offer_schedules
  SET booked_count = booked_count + p_quantity
  WHERE id = p_schedule_id;

  INSERT INTO public.inventory_holds (schedule_id, user_id, quantity, expires_at)
  VALUES (p_schedule_id, auth.uid(), p_quantity, now() + make_interval(secs => p_ttl_seconds))
  RETURNING * INTO v_hold;

  RETURN v_hold;
END;
$$;

REVOKE ALL ON FUNCTION public.create_hold(uuid, int, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_hold(uuid, int, int) TO authenticated;

-- 7. release_hold : annulation volontaire par le propriétaire du hold (ou un admin)
-- avant paiement (ex. retrait du panier).
CREATE OR REPLACE FUNCTION public.release_hold(p_hold_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hold public.inventory_holds%ROWTYPE;
BEGIN
  SELECT * INTO v_hold FROM public.inventory_holds WHERE id = p_hold_id FOR UPDATE;
  IF NOT FOUND OR v_hold.status <> 'active' THEN
    RETURN;
  END IF;
  IF v_hold.user_id IS DISTINCT FROM auth.uid() AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  UPDATE public.inventory_holds SET status = 'released' WHERE id = p_hold_id;
  UPDATE public.offer_schedules SET booked_count = booked_count - v_hold.quantity WHERE id = v_hold.schedule_id;
END;
$$;

REVOKE ALL ON FUNCTION public.release_hold(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.release_hold(uuid) TO authenticated;

-- 8. consume_hold : bascule "payé" — appelé uniquement par le futur webhook Stripe
-- (service_role), jamais par un client, pour qu'un paiement ne puisse être simulé.
CREATE OR REPLACE FUNCTION public.consume_hold(p_hold_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hold public.inventory_holds%ROWTYPE;
BEGIN
  SELECT * INTO v_hold FROM public.inventory_holds WHERE id = p_hold_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'hold_not_found';
  END IF;
  IF v_hold.status <> 'active' THEN
    RAISE EXCEPTION 'hold_not_active';
  END IF;
  IF v_hold.expires_at < now() THEN
    RAISE EXCEPTION 'hold_expired';
  END IF;

  UPDATE public.inventory_holds SET status = 'consumed' WHERE id = p_hold_id;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_hold(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_hold(uuid) TO service_role;

-- 9. expire_stale_holds : à appeler périodiquement (cron) pour libérer la capacité
-- des holds jamais consommés/relâchés explicitement (abandon de panier).
CREATE OR REPLACE FUNCTION public.expire_stale_holds()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
  v_qty int;
BEGIN
  FOR r IN
    SELECT DISTINCT schedule_id FROM public.inventory_holds
    WHERE status = 'active' AND expires_at < now()
  LOOP
    PERFORM 1 FROM public.offer_schedules WHERE id = r.schedule_id FOR UPDATE;

    WITH expired AS (
      UPDATE public.inventory_holds
      SET status = 'expired'
      WHERE schedule_id = r.schedule_id AND status = 'active' AND expires_at < now()
      RETURNING quantity
    )
    SELECT COALESCE(SUM(quantity), 0) INTO v_qty FROM expired;

    UPDATE public.offer_schedules SET booked_count = booked_count - v_qty WHERE id = r.schedule_id;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.expire_stale_holds() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.expire_stale_holds() TO service_role;
