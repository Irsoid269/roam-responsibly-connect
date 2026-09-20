-- Phase 3 (gouvernance) — modération & signalement (cahier §7.9)
-- Signalement de contenu (récits, avis, commentaires) par les utilisateurs,
-- file de modération admin, et bannissement des auteurs récidivistes.

-- ============================================================================
-- 1. Colonnes de bannissement sur profiles
-- ============================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS banned_at timestamptz,
  ADD COLUMN IF NOT EXISTS banned_reason text;

-- Le seul moyen légitime de faire évoluer ces 3 colonnes est resolve_report()
-- (admin uniquement, SECURITY DEFINER). La policy "Users can update their own
-- profile" n'a pas de WITH CHECK dédié : sans ce trigger, un utilisateur
-- pourrait s'auto-débannir via un simple PATCH de son propre profil. On
-- verrouille donc au niveau colonne, pas au niveau ligne.
CREATE OR REPLACE FUNCTION public.protect_ban_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.is_banned := OLD.is_banned;
    NEW.banned_at := OLD.banned_at;
    NEW.banned_reason := OLD.banned_reason;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_ban_columns() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS protect_ban_columns_trigger ON public.profiles;
CREATE TRIGGER protect_ban_columns_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_ban_columns();

-- Helper utilisé dans les policies RLS (doit être exécutable par anon /
-- authenticated puisqu'il est évalué à chaque INSERT de contenu ; il ne
-- retourne qu'un booléen, aucune fuite de donnée sensible).
CREATE OR REPLACE FUNCTION public.is_banned(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_banned FROM public.profiles WHERE user_id = _user_id), false);
$$;

REVOKE ALL ON FUNCTION public.is_banned(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_banned(uuid) TO anon, authenticated;

-- ============================================================================
-- 2. Table des signalements
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('story', 'review', 'comment')),
  target_id uuid NOT NULL,
  reason text NOT NULL CHECK (reason IN ('spam', 'abus', 'contenu_inapproprie', 'fausse_information', 'autre')),
  comment text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'actioned', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id),
  UNIQUE (reporter_user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS reports_status_idx ON public.reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS reports_target_idx ON public.reports (target_type, target_id);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
CREATE POLICY "Users can create reports"
ON public.reports FOR INSERT
WITH CHECK (
  auth.uid() = reporter_user_id
  AND NOT public.is_banned(auth.uid())
);

DROP POLICY IF EXISTS "Users can view their own reports" ON public.reports;
CREATE POLICY "Users can view their own reports"
ON public.reports FOR SELECT
USING (auth.uid() = reporter_user_id OR public.has_role(auth.uid(), 'admin'));
-- Pas de policy UPDATE/DELETE côté client : seul resolve_report() (admin,
-- SECURITY DEFINER) fait évoluer le statut d'un signalement.

-- ============================================================================
-- 3. Journal des actions de modération
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.moderation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES public.reports(id) ON DELETE SET NULL,
  action_type text NOT NULL CHECK (action_type IN ('soft_delete', 'restore', 'ban', 'unban', 'warn', 'dismiss')),
  target_type text NOT NULL CHECK (target_type IN ('story', 'review', 'comment', 'user')),
  target_id uuid NOT NULL,
  acted_by uuid NOT NULL REFERENCES auth.users(id),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS moderation_actions_target_idx ON public.moderation_actions (target_type, target_id);

ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read moderation actions" ON public.moderation_actions;
CREATE POLICY "Admins can read moderation actions"
ON public.moderation_actions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
-- Pas de policy INSERT côté client : uniquement via resolve_report()
-- (SECURITY DEFINER, propriétaire postgres => bypass RLS), même schéma que
-- audit_log.

-- ============================================================================
-- 4. Bloquer les utilisateurs bannis à la création de contenu
-- ============================================================================
DROP POLICY IF EXISTS "Users can create their own community stories" ON public.community_stories;
CREATE POLICY "Users can create their own community stories"
ON public.community_stories
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'
  AND NOT public.is_banned(auth.uid())
);

DROP POLICY IF EXISTS "Users can create their own reviews" ON public.reviews;
CREATE POLICY "Users can create their own reviews"
ON public.reviews FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND NOT public.is_banned(auth.uid())
);

DROP POLICY IF EXISTS "Users can comment on stories" ON public.community_story_comments;
CREATE POLICY "Users can comment on stories"
ON public.community_story_comments FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND NOT public.is_banned(auth.uid())
);

-- ============================================================================
-- 5. RPC admin : traiter un signalement
-- ============================================================================
CREATE OR REPLACE FUNCTION public.resolve_report(
  p_report_id uuid,
  p_action text,
  p_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_report public.reports%ROWTYPE;
  v_author_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF p_action NOT IN ('soft_delete', 'ban', 'warn', 'dismiss') THEN
    RAISE EXCEPTION 'invalid action: %', p_action;
  END IF;

  SELECT * INTO v_report FROM public.reports WHERE id = p_report_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'report not found';
  END IF;
  IF v_report.status = 'actioned' OR v_report.status = 'rejected' THEN
    RAISE EXCEPTION 'report already resolved';
  END IF;

  -- Résoudre l'auteur du contenu ciblé (nécessaire pour soft_delete/ban)
  IF v_report.target_type = 'story' THEN
    SELECT user_id INTO v_author_id FROM public.community_stories WHERE id = v_report.target_id;
  ELSIF v_report.target_type = 'comment' THEN
    SELECT user_id INTO v_author_id FROM public.community_story_comments WHERE id = v_report.target_id;
  ELSIF v_report.target_type = 'review' THEN
    SELECT user_id INTO v_author_id FROM public.reviews WHERE id = v_report.target_id;
  END IF;

  IF p_action = 'soft_delete' THEN
    IF v_report.target_type = 'story' THEN
      UPDATE public.community_stories SET status = 'rejected' WHERE id = v_report.target_id;
    ELSIF v_report.target_type = 'comment' THEN
      DELETE FROM public.community_story_comments WHERE id = v_report.target_id;
    ELSIF v_report.target_type = 'review' THEN
      DELETE FROM public.reviews WHERE id = v_report.target_id;
    END IF;

    INSERT INTO public.moderation_actions (report_id, action_type, target_type, target_id, acted_by, reason)
    VALUES (p_report_id, 'soft_delete', v_report.target_type, v_report.target_id, auth.uid(), p_reason);

  ELSIF p_action = 'ban' THEN
    IF v_author_id IS NULL THEN
      RAISE EXCEPTION 'cannot resolve author for target';
    END IF;

    UPDATE public.profiles
    SET is_banned = true, banned_at = now(), banned_reason = p_reason
    WHERE user_id = v_author_id;

    INSERT INTO public.moderation_actions (report_id, action_type, target_type, target_id, acted_by, reason)
    VALUES (p_report_id, 'ban', 'user', v_author_id, auth.uid(), p_reason);

  ELSIF p_action = 'warn' THEN
    INSERT INTO public.moderation_actions (report_id, action_type, target_type, target_id, acted_by, reason)
    VALUES (p_report_id, 'warn', v_report.target_type, v_report.target_id, auth.uid(), p_reason);

  ELSIF p_action = 'dismiss' THEN
    INSERT INTO public.moderation_actions (report_id, action_type, target_type, target_id, acted_by, reason)
    VALUES (p_report_id, 'dismiss', v_report.target_type, v_report.target_id, auth.uid(), p_reason);
  END IF;

  UPDATE public.reports
  SET status = CASE WHEN p_action = 'dismiss' THEN 'rejected' ELSE 'actioned' END,
      resolved_at = now(),
      resolved_by = auth.uid()
  WHERE id = p_report_id;
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_report(uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_report(uuid, text, text) TO authenticated;

-- ============================================================================
-- 6. RPC admin : débannir un utilisateur
-- ============================================================================
CREATE OR REPLACE FUNCTION public.unban_user(p_user_id uuid, p_reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  UPDATE public.profiles
  SET is_banned = false, banned_at = NULL, banned_reason = NULL
  WHERE user_id = p_user_id;

  INSERT INTO public.moderation_actions (action_type, target_type, target_id, acted_by, reason)
  VALUES ('unban', 'user', p_user_id, auth.uid(), p_reason);
END;
$$;

REVOKE ALL ON FUNCTION public.unban_user(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.unban_user(uuid, text) TO authenticated;

-- ============================================================================
-- 7. Audit trigger (cf. 20260920120000_audit_log.sql) sur les nouvelles tables sensibles
-- ============================================================================
DROP TRIGGER IF EXISTS audit_reports ON public.reports;
CREATE TRIGGER audit_reports
AFTER INSERT OR UPDATE OR DELETE ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS audit_moderation_actions ON public.moderation_actions;
CREATE TRIGGER audit_moderation_actions
AFTER INSERT OR UPDATE OR DELETE ON public.moderation_actions
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
