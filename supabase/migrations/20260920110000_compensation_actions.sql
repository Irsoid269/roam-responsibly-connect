-- Phase 2 (compensation) — Mode B : actions durables + validation par QR
-- (cahier §7.8). Même logique anti-surbooking que les holds (Lot Phase 1) :
-- écriture de la capacité et des participations exclusivement via fonctions
-- SECURITY DEFINER, jamais en accès direct client.
--
-- Anti-fraude : le "usage unique" (qr_used_at + statut) et la fenêtre de
-- validité temporelle sont implémentés ici. La détection multi-comptes et le
-- journal d'audit complet restent au périmètre de la Phase 3 (audit_log) —
-- volontairement non dupliqués ici.

CREATE TABLE IF NOT EXISTS public.sustainable_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sustainable_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active sustainable actions" ON public.sustainable_actions;
CREATE POLICY "Anyone can read active sustainable actions"
ON public.sustainable_actions FOR SELECT
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage sustainable actions insert" ON public.sustainable_actions;
CREATE POLICY "Admins manage sustainable actions insert"
ON public.sustainable_actions FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage sustainable actions update" ON public.sustainable_actions;
CREATE POLICY "Admins manage sustainable actions update"
ON public.sustainable_actions FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage sustainable actions delete" ON public.sustainable_actions;
CREATE POLICY "Admins manage sustainable actions delete"
ON public.sustainable_actions FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.action_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id uuid NOT NULL REFERENCES public.sustainable_actions(id) ON DELETE CASCADE,
  location text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  capacity integer NOT NULL DEFAULT 20,
  registered_count integer NOT NULL DEFAULT 0,
  qr_ttl_seconds integer NOT NULL DEFAULT 21600, -- 6h de grâce après la fin pour valider
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT action_sessions_capacity_check CHECK (registered_count >= 0 AND registered_count <= capacity)
);

CREATE INDEX IF NOT EXISTS action_sessions_action_id_idx ON public.action_sessions (action_id);
CREATE INDEX IF NOT EXISTS action_sessions_starts_at_idx ON public.action_sessions (starts_at);

ALTER TABLE public.action_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read action sessions" ON public.action_sessions;
CREATE POLICY "Anyone can read action sessions"
ON public.action_sessions FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins manage action sessions insert" ON public.action_sessions;
CREATE POLICY "Admins manage action sessions insert"
ON public.action_sessions FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage action sessions update" ON public.action_sessions;
CREATE POLICY "Admins manage action sessions update"
ON public.action_sessions FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage action sessions delete" ON public.action_sessions;
CREATE POLICY "Admins manage action sessions delete"
ON public.action_sessions FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.action_participations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.action_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'registered'
    CHECK (status IN ('registered', 'validated', 'rejected', 'cancelled', 'no_show')),
  qr_code text UNIQUE,
  qr_used_at timestamptz,
  validated_by uuid REFERENCES auth.users(id),
  validated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, user_id)
);

CREATE INDEX IF NOT EXISTS action_participations_session_id_idx ON public.action_participations (session_id);
CREATE INDEX IF NOT EXISTS action_participations_user_id_idx ON public.action_participations (user_id);

ALTER TABLE public.action_participations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own participations" ON public.action_participations;
CREATE POLICY "Users can read their own participations"
ON public.action_participations FOR SELECT
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
-- Pas de policy INSERT/UPDATE/DELETE : tout passe par register_for_action /
-- cancel_participation / validate_participation (SECURITY DEFINER).

-- register_for_action : inscrit l'utilisateur et génère son QR à usage
-- unique, en verrouillant la session le temps de vérifier la capacité
-- (même mécanisme que create_hold pour l'anti-surbooking).
CREATE OR REPLACE FUNCTION public.register_for_action(p_session_id uuid)
RETURNS public.action_participations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session public.action_sessions%ROWTYPE;
  v_participation public.action_participations%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication_required';
  END IF;

  SELECT * INTO v_session FROM public.action_sessions WHERE id = p_session_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'session_not_found';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.action_participations
    WHERE session_id = p_session_id AND user_id = auth.uid() AND status <> 'cancelled'
  ) THEN
    RAISE EXCEPTION 'already_registered';
  END IF;

  IF v_session.registered_count >= v_session.capacity THEN
    RAISE EXCEPTION 'session_full';
  END IF;

  UPDATE public.action_sessions
  SET registered_count = registered_count + 1
  WHERE id = p_session_id;

  -- gen_random_uuid() is already relied on everywhere else in this schema
  -- (unlike gen_random_bytes(), it needs no pgcrypto extension check here).
  INSERT INTO public.action_participations (session_id, user_id, qr_code)
  VALUES (p_session_id, auth.uid(), gen_random_uuid()::text || gen_random_uuid()::text)
  RETURNING * INTO v_participation;

  RETURN v_participation;
END;
$$;

REVOKE ALL ON FUNCTION public.register_for_action(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_for_action(uuid) TO authenticated;

-- cancel_participation : désistement avant validation, libère la place.
CREATE OR REPLACE FUNCTION public.cancel_participation(p_participation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_participation public.action_participations%ROWTYPE;
BEGIN
  SELECT * INTO v_participation FROM public.action_participations
  WHERE id = p_participation_id FOR UPDATE;

  IF NOT FOUND OR v_participation.status <> 'registered' THEN
    RETURN;
  END IF;
  IF v_participation.user_id IS DISTINCT FROM auth.uid() AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  UPDATE public.action_participations SET status = 'cancelled' WHERE id = p_participation_id;
  UPDATE public.action_sessions
  SET registered_count = registered_count - 1
  WHERE id = v_participation.session_id;
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_participation(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_participation(uuid) TO authenticated;

-- validate_participation : réservée aux admins (pas encore de rôle Organizer,
-- cf. Phase 3 RBAC). Usage unique (qr_used_at) + fenêtre de validité
-- [starts_at ; ends_at (ou starts_at) + qr_ttl_seconds].
CREATE OR REPLACE FUNCTION public.validate_participation(p_qr_code text)
RETURNS public.action_participations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_participation public.action_participations%ROWTYPE;
  v_session public.action_sessions%ROWTYPE;
  v_window_end timestamptz;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT * INTO v_participation FROM public.action_participations
  WHERE qr_code = p_qr_code FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'qr_not_found';
  END IF;
  IF v_participation.status = 'validated' OR v_participation.qr_used_at IS NOT NULL THEN
    RAISE EXCEPTION 'qr_already_used';
  END IF;
  IF v_participation.status <> 'registered' THEN
    RAISE EXCEPTION 'participation_not_registered';
  END IF;

  SELECT * INTO v_session FROM public.action_sessions WHERE id = v_participation.session_id;
  v_window_end := COALESCE(v_session.ends_at, v_session.starts_at) + make_interval(secs => v_session.qr_ttl_seconds);
  IF now() < v_session.starts_at THEN
    RAISE EXCEPTION 'session_not_started';
  END IF;
  IF now() > v_window_end THEN
    RAISE EXCEPTION 'qr_expired';
  END IF;

  UPDATE public.action_participations
  SET status = 'validated', qr_used_at = now(), validated_at = now(), validated_by = auth.uid()
  WHERE id = v_participation.id
  RETURNING * INTO v_participation;

  RETURN v_participation;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_participation(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_participation(text) TO authenticated;

-- Seed : reprend les 4 actions déjà présentes (fictives) dans
-- CompensationOptions.tsx, avec une session à venir chacune.
INSERT INTO public.sustainable_actions (id, title, description, category)
SELECT * FROM (VALUES
  ('10000000-0000-0000-0000-000000000001'::uuid, 'Plantation d''arbres', 'Rejoignez notre groupe pour planter des arbres autour de Moroni et Itsandra', 'plantation'),
  ('10000000-0000-0000-0000-000000000002'::uuid, 'Nettoyage de plage', 'Journée de nettoyage de plage avec une association locale', 'nettoyage'),
  ('10000000-0000-0000-0000-000000000003'::uuid, 'Restauration mangrove', 'Plantation de mangroves dans une zone protégée', 'plantation'),
  ('10000000-0000-0000-0000-000000000004'::uuid, 'Atelier compostage', 'Apprenez à composter et créez votre composteur', 'sensibilisation')
) AS v(id, title, description, category)
WHERE NOT EXISTS (SELECT 1 FROM public.sustainable_actions LIMIT 1);

INSERT INTO public.action_sessions (action_id, location, starts_at, ends_at, capacity, registered_count)
SELECT * FROM (VALUES
  ('10000000-0000-0000-0000-000000000001'::uuid, 'Grande Comore, Comores', now() + interval '14 days', now() + interval '14 days' + interval '4 hours', 20, 12),
  ('10000000-0000-0000-0000-000000000002'::uuid, 'Itsandra, Grande Comore', now() + interval '21 days', now() + interval '21 days' + interval '3 hours', 30, 8),
  ('10000000-0000-0000-0000-000000000003'::uuid, 'Mohéli, Comores', now() + interval '28 days', now() + interval '29 days', 25, 15),
  ('10000000-0000-0000-0000-000000000004'::uuid, 'Mutsamudu, Anjouan', now() + interval '35 days', now() + interval '35 days' + interval '2 hours', 15, 5)
) AS v(action_id, location, starts_at, ends_at, capacity, registered_count)
WHERE NOT EXISTS (SELECT 1 FROM public.action_sessions LIMIT 1);
