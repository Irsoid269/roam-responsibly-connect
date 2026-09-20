-- Dette technique documentée (cf. compensation_actions.sql) — durcissement
-- de la validation QR : limite quotidienne par validateur, rôle Organizer
-- (créé après cette fonction, jamais recâblé jusqu'ici), et signal
-- (non-bloquant) de comptes multiples partageant une même IP d'inscription.

-- ============================================================================
-- 1. Capture de l'IP d'inscription (signal de détection multi-comptes)
-- ============================================================================
-- Best-effort : PostgREST expose les en-têtes de la requête via le GUC
-- request.headers quand il est configuré pour (comportement par défaut sur
-- Supabase). Si absent (appel direct en SQL, configuration différente), on
-- dégrade en NULL plutôt que d'échouer l'inscription pour cette raison.
ALTER TABLE public.action_participations
  ADD COLUMN IF NOT EXISTS registration_ip text;

CREATE OR REPLACE FUNCTION public.register_for_action(p_session_id uuid)
RETURNS public.action_participations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session public.action_sessions%ROWTYPE;
  v_participation public.action_participations%ROWTYPE;
  v_ip text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication_required';
  END IF;

  BEGIN
    v_ip := split_part(
      current_setting('request.headers', true)::json ->> 'x-forwarded-for',
      ',', 1
    );
  EXCEPTION WHEN OTHERS THEN
    v_ip := NULL;
  END;

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

  INSERT INTO public.action_participations (session_id, user_id, qr_code, registration_ip)
  VALUES (p_session_id, auth.uid(), gen_random_uuid()::text || gen_random_uuid()::text, v_ip)
  RETURNING * INTO v_participation;

  RETURN v_participation;
END;
$$;

REVOKE ALL ON FUNCTION public.register_for_action(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_for_action(uuid) TO authenticated;

-- Signal non-bloquant pour l'équipe : sessions où au moins deux comptes
-- distincts partagent la même IP d'inscription. Ce n'est pas une preuve de
-- fraude (un même réseau wifi/coworking peut légitimement produire ce
-- résultat) — juste de quoi orienter une vérification manuelle, jamais un
-- blocage automatique.
-- Le filtre d'accès est intégré directement à la vue (WHERE ci-dessous)
-- plutôt que délégué à la RLS de action_participations : la policy SELECT de
-- cette table n'autorise aujourd'hui que "ses propres lignes OU admin", pas
-- organizer, et il est plus simple/explicite de gérer les deux rôles ici
-- que de modifier cette policy pour un besoin de lecture agrégée aussi
-- spécifique.
CREATE OR REPLACE VIEW public.action_participation_ip_duplicates AS
SELECT
  session_id,
  registration_ip,
  count(DISTINCT user_id) AS distinct_users,
  array_agg(DISTINCT user_id) AS user_ids
FROM public.action_participations
WHERE registration_ip IS NOT NULL
  AND status <> 'cancelled'
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'organizer'))
GROUP BY session_id, registration_ip
HAVING count(DISTINCT user_id) > 1;

-- La vue n'est pas RLS (les vues ne le sont jamais) : le filtre par rôle
-- ci-dessus est la seule protection, donc explicite et vérifiée. On retire
-- quand même l'accès anonyme par hygiène, même s'il ne renverrait déjà rien.
REVOKE ALL ON public.action_participation_ip_duplicates FROM PUBLIC, anon;
GRANT SELECT ON public.action_participation_ip_duplicates TO authenticated;

-- ============================================================================
-- 2. validate_participation : rôle Organizer + limite quotidienne
-- ============================================================================
-- Limite volontairement haute (un vrai événement peut valider des centaines
-- de billets en quelques heures) : elle vise à contenir un abus si des
-- identifiants staff sont compromis, pas à gêner l'usage normal.
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
  v_daily_count integer;
  v_daily_limit constant integer := 300;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'organizer')) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT count(*) INTO v_daily_count
  FROM public.action_participations
  WHERE validated_by = auth.uid()
    AND validated_at >= date_trunc('day', now());
  IF v_daily_count >= v_daily_limit THEN
    RAISE EXCEPTION 'daily_validation_limit_reached';
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
