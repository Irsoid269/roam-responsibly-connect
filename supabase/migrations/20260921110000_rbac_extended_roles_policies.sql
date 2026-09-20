-- Phase 3 (gouvernance) — RBAC étendue : donne aux 4 nouveaux rôles un accès
-- RLS réel sur leur périmètre métier. Chaque policy modifiée ci-dessous DROP
-- puis CREATE sous le MÊME nom que la policy live actuelle (vérifiée via
-- pg_policies avant d'écrire ce fichier — cf. incident de la policy fantôme
-- sur reviews : les fichiers de migration ne reflètent pas toujours l'état
-- réel de la base, certaines policies ayant été ajoutées/éditées directement
-- depuis le Studio Supabase).
--
-- À exécuter APRÈS que 20260921100000_rbac_extended_roles_enum.sql a été
-- validé (nouvelle valeur d'enum déjà committée).
--
-- Périmètre retenu :
--   organizer       : contenu opérationnel (blog, événements, ambassadeurs,
--                     actions durables + sessions)
--   partner_manager : catalogue & partenaires (destinations, coworkings,
--                     hébergements, mobilité, activités, prestataires,
--                     univers, candidatures partenaires, partner_orgs)
--   support         : réservations (lecture/mise à jour), boîte de réception
--                     (messages contact), signalements & bannissement
--   finance         : paiements/factures/remboursements (lecture),
--                     réservations (lecture), dons, ONG, reversements
-- Le journal d'audit reste strictement admin-only (gouvernance sensible,
-- historique des changements de rôles inclus).

-- ============================================================================
-- ORGANIZER
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can read published blog posts" ON public.blog_posts;
CREATE POLICY "Anyone can read published blog posts"
ON public.blog_posts FOR SELECT
USING (published = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'organizer'));

DROP POLICY IF EXISTS "Admins can insert blog posts" ON public.blog_posts;
CREATE POLICY "Admins can insert blog posts"
ON public.blog_posts FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'organizer'));

DROP POLICY IF EXISTS "Admins can update blog posts" ON public.blog_posts;
CREATE POLICY "Admins can update blog posts"
ON public.blog_posts FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'organizer'));

DROP POLICY IF EXISTS "Admins can delete blog posts" ON public.blog_posts;
CREATE POLICY "Admins can delete blog posts"
ON public.blog_posts FOR DELETE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'organizer'));

DROP POLICY IF EXISTS "Anyone can read published events" ON public.events;
CREATE POLICY "Anyone can read published events"
ON public.events FOR SELECT
USING (published = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'organizer'));

DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
CREATE POLICY "Admins can insert events"
ON public.events FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'organizer'));

DROP POLICY IF EXISTS "Admins can update events" ON public.events;
CREATE POLICY "Admins can update events"
ON public.events FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'organizer'));

DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
CREATE POLICY "Admins can delete events"
ON public.events FOR DELETE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'organizer'));

DROP POLICY IF EXISTS "Anyone can read published ambassadors" ON public.ambassadors;
CREATE POLICY "Anyone can read published ambassadors"
ON public.ambassadors FOR SELECT
USING (published = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'organizer'));

DROP POLICY IF EXISTS "Admins manage ambassadors insert" ON public.ambassadors;
CREATE POLICY "Admins manage ambassadors insert"
ON public.ambassadors FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'organizer'));

DROP POLICY IF EXISTS "Admins manage ambassadors update" ON public.ambassadors;
CREATE POLICY "Admins manage ambassadors update"
ON public.ambassadors FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'organizer'));

DROP POLICY IF EXISTS "Admins manage ambassadors delete" ON public.ambassadors;
CREATE POLICY "Admins manage ambassadors delete"
ON public.ambassadors FOR DELETE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'organizer'));

DROP POLICY IF EXISTS "Anyone can read published ambassador benefits" ON public.ambassador_benefits;
CREATE POLICY "Anyone can read published ambassador benefits"
ON public.ambassador_benefits FOR SELECT
USING (published = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'organizer'));

DROP POLICY IF EXISTS "Admins manage ambassador benefits insert" ON public.ambassador_benefits;
CREATE POLICY "Admins manage ambassador benefits insert"
ON public.ambassador_benefits FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'organizer'));

DROP POLICY IF EXISTS "Admins manage ambassador benefits update" ON public.ambassador_benefits;
CREATE POLICY "Admins manage ambassador benefits update"
ON public.ambassador_benefits FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'organizer'));

DROP POLICY IF EXISTS "Admins manage ambassador benefits delete" ON public.ambassador_benefits;
CREATE POLICY "Admins manage ambassador benefits delete"
ON public.ambassador_benefits FOR DELETE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'organizer'));

DROP POLICY IF EXISTS "Anyone can read active sustainable actions" ON public.sustainable_actions;
CREATE POLICY "Anyone can read active sustainable actions"
ON public.sustainable_actions FOR SELECT
USING (is_active = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'organizer'));

DROP POLICY IF EXISTS "Admins manage sustainable actions insert" ON public.sustainable_actions;
CREATE POLICY "Admins manage sustainable actions insert"
ON public.sustainable_actions FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'organizer'));

DROP POLICY IF EXISTS "Admins manage sustainable actions update" ON public.sustainable_actions;
CREATE POLICY "Admins manage sustainable actions update"
ON public.sustainable_actions FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'organizer'));

DROP POLICY IF EXISTS "Admins manage sustainable actions delete" ON public.sustainable_actions;
CREATE POLICY "Admins manage sustainable actions delete"
ON public.sustainable_actions FOR DELETE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'organizer'));

DROP POLICY IF EXISTS "Admins manage action sessions insert" ON public.action_sessions;
CREATE POLICY "Admins manage action sessions insert"
ON public.action_sessions FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'organizer'));

DROP POLICY IF EXISTS "Admins manage action sessions update" ON public.action_sessions;
CREATE POLICY "Admins manage action sessions update"
ON public.action_sessions FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'organizer'));

DROP POLICY IF EXISTS "Admins manage action sessions delete" ON public.action_sessions;
CREATE POLICY "Admins manage action sessions delete"
ON public.action_sessions FOR DELETE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'organizer'));

-- ============================================================================
-- PARTNER_MANAGER
-- ============================================================================
DROP POLICY IF EXISTS "Admins can create destinations" ON public.destinations;
CREATE POLICY "Admins can create destinations"
ON public.destinations FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

DROP POLICY IF EXISTS "Admins can update destinations" ON public.destinations;
CREATE POLICY "Admins can update destinations"
ON public.destinations FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

DROP POLICY IF EXISTS "Admins can delete destinations" ON public.destinations;
CREATE POLICY "Admins can delete destinations"
ON public.destinations FOR DELETE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

DROP POLICY IF EXISTS "Admins can create coworking spaces" ON public.coworking_spaces;
CREATE POLICY "Admins can create coworking spaces"
ON public.coworking_spaces FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

DROP POLICY IF EXISTS "Admins can update coworking spaces" ON public.coworking_spaces;
CREATE POLICY "Admins can update coworking spaces"
ON public.coworking_spaces FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

DROP POLICY IF EXISTS "Admins can delete coworking spaces" ON public.coworking_spaces;
CREATE POLICY "Admins can delete coworking spaces"
ON public.coworking_spaces FOR DELETE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

DROP POLICY IF EXISTS "Admins can create accommodations" ON public.accommodations;
CREATE POLICY "Admins can create accommodations"
ON public.accommodations FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

DROP POLICY IF EXISTS "Admins can update accommodations" ON public.accommodations;
CREATE POLICY "Admins can update accommodations"
ON public.accommodations FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

DROP POLICY IF EXISTS "Admins can delete accommodations" ON public.accommodations;
CREATE POLICY "Admins can delete accommodations"
ON public.accommodations FOR DELETE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

DROP POLICY IF EXISTS "Admins can create mobility options" ON public.mobility_options;
CREATE POLICY "Admins can create mobility options"
ON public.mobility_options FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

DROP POLICY IF EXISTS "Admins can update mobility options" ON public.mobility_options;
CREATE POLICY "Admins can update mobility options"
ON public.mobility_options FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

DROP POLICY IF EXISTS "Admins can delete mobility options" ON public.mobility_options;
CREATE POLICY "Admins can delete mobility options"
ON public.mobility_options FOR DELETE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

DROP POLICY IF EXISTS "Admins can create activities" ON public.activities;
CREATE POLICY "Admins can create activities"
ON public.activities FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

DROP POLICY IF EXISTS "Admins can update activities" ON public.activities;
CREATE POLICY "Admins can update activities"
ON public.activities FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

DROP POLICY IF EXISTS "Admins can delete activities" ON public.activities;
CREATE POLICY "Admins can delete activities"
ON public.activities FOR DELETE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

DROP POLICY IF EXISTS "Admins manage providers insert" ON public.providers;
CREATE POLICY "Admins manage providers insert"
ON public.providers FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

DROP POLICY IF EXISTS "Admins manage providers update" ON public.providers;
CREATE POLICY "Admins manage providers update"
ON public.providers FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

DROP POLICY IF EXISTS "Admins manage providers delete" ON public.providers;
CREATE POLICY "Admins manage providers delete"
ON public.providers FOR DELETE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

DROP POLICY IF EXISTS "Admins manage universes insert" ON public.universes;
CREATE POLICY "Admins manage universes insert"
ON public.universes FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

DROP POLICY IF EXISTS "Admins manage universes update" ON public.universes;
CREATE POLICY "Admins manage universes update"
ON public.universes FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

DROP POLICY IF EXISTS "Admins manage universes delete" ON public.universes;
CREATE POLICY "Admins manage universes delete"
ON public.universes FOR DELETE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

DROP POLICY IF EXISTS "Admins can read partner applications" ON public.partner_applications;
CREATE POLICY "Admins can read partner applications"
ON public.partner_applications FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

DROP POLICY IF EXISTS "Admins can update partner applications" ON public.partner_applications;
CREATE POLICY "Admins can update partner applications"
ON public.partner_applications FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

DROP POLICY IF EXISTS "Public read partner_orgs" ON public.partner_orgs;
CREATE POLICY "Public read partner_orgs"
ON public.partner_orgs FOR SELECT
USING (published = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

DROP POLICY IF EXISTS "Admins insert partner_orgs" ON public.partner_orgs;
CREATE POLICY "Admins insert partner_orgs"
ON public.partner_orgs FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

DROP POLICY IF EXISTS "Admins update partner_orgs" ON public.partner_orgs;
CREATE POLICY "Admins update partner_orgs"
ON public.partner_orgs FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

DROP POLICY IF EXISTS "Admins delete partner_orgs" ON public.partner_orgs;
CREATE POLICY "Admins delete partner_orgs"
ON public.partner_orgs FOR DELETE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner_manager'));

-- ============================================================================
-- SUPPORT
-- ============================================================================
DROP POLICY IF EXISTS "Admins can read contact messages" ON public.contact_messages;
CREATE POLICY "Admins can read contact messages"
ON public.contact_messages FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'support'));

DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;
CREATE POLICY "Admins can update contact messages"
ON public.contact_messages FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'support'));

DROP POLICY IF EXISTS "Users can view their own reports" ON public.reports;
CREATE POLICY "Users can view their own reports"
ON public.reports FOR SELECT
USING (
  auth.uid() = reporter_user_id
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'support')
);

DROP POLICY IF EXISTS "Admins can read moderation actions" ON public.moderation_actions;
CREATE POLICY "Admins can read moderation actions"
ON public.moderation_actions FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'support'));

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
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'support')) THEN
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

CREATE OR REPLACE FUNCTION public.unban_user(p_user_id uuid, p_reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'support')) THEN
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

-- Le trigger protect_ban_columns (cf. 20260920130000) autorise déjà toute
-- écriture sur is_banned/banned_at/banned_reason dès lors que
-- has_role(auth.uid(), 'admin') est vrai. resolve_report/unban_user
-- s'exécutent en SECURITY DEFINER mais auth.uid() reste celui de l'appelant
-- (support), donc il faut aussi laisser passer 'support' dans ce trigger,
-- sinon un support qui bannit via resolve_report verrait son UPDATE sur
-- profiles silencieusement neutralisé par le trigger.
CREATE OR REPLACE FUNCTION public.protect_ban_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'support')) THEN
    NEW.is_banned := OLD.is_banned;
    NEW.banned_at := OLD.banned_at;
    NEW.banned_reason := OLD.banned_reason;
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================================================
-- SUPPORT + FINANCE : réservations (lecture ; mise à jour réservée au support)
-- ============================================================================
DROP POLICY IF EXISTS "Admins can view all reservations" ON public.reservations;
CREATE POLICY "Admins can view all reservations"
ON public.reservations FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'support')
  OR public.has_role(auth.uid(), 'finance')
);

DROP POLICY IF EXISTS "Admins can update all reservations" ON public.reservations;
CREATE POLICY "Admins can update all reservations"
ON public.reservations FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'support'));

-- ============================================================================
-- FINANCE
-- ============================================================================
DROP POLICY IF EXISTS "Users can read their own payments" ON public.payments;
CREATE POLICY "Users can read their own payments"
ON public.payments FOR SELECT
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'finance'));

DROP POLICY IF EXISTS "Users can read their own invoices" ON public.invoices;
CREATE POLICY "Users can read their own invoices"
ON public.invoices FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'finance')
  OR EXISTS (
    SELECT 1 FROM public.payments p
    WHERE p.id = invoices.payment_id AND p.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can read their own refunds" ON public.refunds;
CREATE POLICY "Users can read their own refunds"
ON public.refunds FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'finance')
  OR EXISTS (
    SELECT 1 FROM public.payments p
    WHERE p.id = refunds.payment_id AND p.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Anyone can read active ngos" ON public.ngos;
CREATE POLICY "Anyone can read active ngos"
ON public.ngos FOR SELECT
USING (is_active = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'finance'));

DROP POLICY IF EXISTS "Admins manage ngos insert" ON public.ngos;
CREATE POLICY "Admins manage ngos insert"
ON public.ngos FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'finance'));

DROP POLICY IF EXISTS "Admins manage ngos update" ON public.ngos;
CREATE POLICY "Admins manage ngos update"
ON public.ngos FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'finance'));

DROP POLICY IF EXISTS "Admins manage ngos delete" ON public.ngos;
CREATE POLICY "Admins manage ngos delete"
ON public.ngos FOR DELETE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'finance'));

DROP POLICY IF EXISTS "Users can read their own donations" ON public.donations;
CREATE POLICY "Users can read their own donations"
ON public.donations FOR SELECT
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'finance'));

DROP POLICY IF EXISTS "Admins can update donations" ON public.donations;
CREATE POLICY "Admins can update donations"
ON public.donations FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'finance'));

DROP POLICY IF EXISTS "Admins manage donation reversements select" ON public.donation_reversements;
CREATE POLICY "Admins manage donation reversements select"
ON public.donation_reversements FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'finance'));

DROP POLICY IF EXISTS "Admins manage donation reversements insert" ON public.donation_reversements;
CREATE POLICY "Admins manage donation reversements insert"
ON public.donation_reversements FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'finance'));
