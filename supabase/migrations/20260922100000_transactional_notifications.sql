-- Phase 4 (notifications transactionnelles) — cahier §7.10.
--
-- Architecture "outbox" : un trigger SECURITY DEFINER (même schéma que
-- log_audit_event, déjà en place et fiable) écrit une ligne dans
-- public.notifications dès qu'un événement notifiable se produit —
-- réservation confirmée, paiement réussi, remboursement traité, don
-- confirmé, participation validée par QR, bannissement. Cette écriture ne
-- dépend d'aucun service externe et est donc testable immédiatement, sans
-- attendre le déploiement d'une Edge Function ni une clé de fournisseur
-- d'email.
--
-- L'envoi effectif (fonction Edge send-notifications, cf.
-- supabase/functions/send-notifications) reste un second maillon, à
-- déployer et connecter à un fournisseur (Resend) séparément — exactement
-- le même découpage que pour Stripe (squelette écrit, déploiement bloqué
-- sur des identifiants que je ne dois jamais voir).

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_email text,
  type text NOT NULL CHECK (type IN (
    'reservation_confirmed', 'payment_succeeded', 'refund_processed',
    'donation_confirmed', 'action_validated', 'account_banned'
  )),
  subject text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed', 'skipped_no_provider')),
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

CREATE INDEX IF NOT EXISTS notifications_status_idx ON public.notifications (status, created_at);
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications (user_id);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read notifications" ON public.notifications;
CREATE POLICY "Admins can read notifications"
ON public.notifications FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'support'));
-- Pas de policy INSERT/UPDATE/DELETE côté client : les triggers ci-dessous
-- (SECURITY DEFINER, propriétaire postgres) écrivent seuls ; l'Edge
-- Function de dispatch (service_role) fait évoluer status/sent_at/error.

-- ============================================================================
-- Réservation confirmée
-- ============================================================================
CREATE OR REPLACE FUNCTION public.notify_reservation_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    SELECT email INTO v_email FROM auth.users WHERE id = NEW.user_id;
    INSERT INTO public.notifications (user_id, recipient_email, type, subject, payload)
    VALUES (
      NEW.user_id, v_email, 'reservation_confirmed',
      'Votre réservation Amani est confirmée',
      jsonb_build_object(
        'reservation_id', NEW.id,
        'check_in_date', NEW.check_in_date,
        'check_out_date', NEW.check_out_date,
        'total_price', NEW.total_price
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_reservation_confirmed() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_notify_reservation_confirmed ON public.reservations;
CREATE TRIGGER trg_notify_reservation_confirmed
AFTER UPDATE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.notify_reservation_confirmed();

-- ============================================================================
-- Paiement réussi
-- ============================================================================
CREATE OR REPLACE FUNCTION public.notify_payment_succeeded()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  IF NEW.status = 'succeeded' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    SELECT email INTO v_email FROM auth.users WHERE id = NEW.user_id;
    INSERT INTO public.notifications (user_id, recipient_email, type, subject, payload)
    VALUES (
      NEW.user_id, v_email, 'payment_succeeded',
      'Reçu de votre paiement Amani',
      jsonb_build_object(
        'payment_id', NEW.id,
        'reservation_id', NEW.reservation_id,
        'amount', NEW.amount,
        'currency', NEW.currency
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_payment_succeeded() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_notify_payment_succeeded ON public.payments;
CREATE TRIGGER trg_notify_payment_succeeded
AFTER UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.notify_payment_succeeded();

-- ============================================================================
-- Remboursement traité
-- ============================================================================
CREATE OR REPLACE FUNCTION public.notify_refund_processed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_user_id uuid;
BEGIN
  IF NEW.status = 'succeeded' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    SELECT p.user_id INTO v_user_id FROM public.payments p WHERE p.id = NEW.payment_id;
    SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;
    INSERT INTO public.notifications (user_id, recipient_email, type, subject, payload)
    VALUES (
      v_user_id, v_email, 'refund_processed',
      'Votre remboursement Amani a été traité',
      jsonb_build_object('refund_id', NEW.id, 'payment_id', NEW.payment_id, 'amount', NEW.amount)
    );
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_refund_processed() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_notify_refund_processed ON public.refunds;
CREATE TRIGGER trg_notify_refund_processed
AFTER UPDATE ON public.refunds
FOR EACH ROW EXECUTE FUNCTION public.notify_refund_processed();

-- ============================================================================
-- Don confirmé
-- ============================================================================
CREATE OR REPLACE FUNCTION public.notify_donation_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_ngo_name text;
BEGIN
  IF NEW.status = 'succeeded' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    SELECT email INTO v_email FROM auth.users WHERE id = NEW.user_id;
    SELECT name INTO v_ngo_name FROM public.ngos WHERE id = NEW.ngo_id;
    INSERT INTO public.notifications (user_id, recipient_email, type, subject, payload)
    VALUES (
      NEW.user_id, v_email, 'donation_confirmed',
      'Merci pour votre don Amani',
      jsonb_build_object(
        'donation_id', NEW.id, 'ngo_name', v_ngo_name,
        'amount', NEW.amount, 'co2_offset_kg', NEW.co2_offset_kg
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_donation_confirmed() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_notify_donation_confirmed ON public.donations;
CREATE TRIGGER trg_notify_donation_confirmed
AFTER UPDATE ON public.donations
FOR EACH ROW EXECUTE FUNCTION public.notify_donation_confirmed();

-- ============================================================================
-- Participation validée par QR
-- ============================================================================
CREATE OR REPLACE FUNCTION public.notify_action_validated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_action_title text;
BEGIN
  IF NEW.status = 'validated' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    SELECT email INTO v_email FROM auth.users WHERE id = NEW.user_id;
    SELECT sa.title INTO v_action_title
    FROM public.action_sessions s
    JOIN public.sustainable_actions sa ON sa.id = s.action_id
    WHERE s.id = NEW.session_id;
    INSERT INTO public.notifications (user_id, recipient_email, type, subject, payload)
    VALUES (
      NEW.user_id, v_email, 'action_validated',
      'Votre participation a été validée',
      jsonb_build_object('participation_id', NEW.id, 'session_id', NEW.session_id, 'action_title', v_action_title)
    );
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_action_validated() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_notify_action_validated ON public.action_participations;
CREATE TRIGGER trg_notify_action_validated
AFTER UPDATE ON public.action_participations
FOR EACH ROW EXECUTE FUNCTION public.notify_action_validated();

-- ============================================================================
-- Compte banni (cf. resolve_report, Phase 3 modération)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.notify_account_banned()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  IF NEW.is_banned = true AND (OLD.is_banned IS DISTINCT FROM NEW.is_banned) THEN
    SELECT email INTO v_email FROM auth.users WHERE id = NEW.user_id;
    INSERT INTO public.notifications (user_id, recipient_email, type, subject, payload)
    VALUES (
      NEW.user_id, v_email, 'account_banned',
      'Votre compte Amani a été suspendu',
      jsonb_build_object('reason', NEW.banned_reason)
    );
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_account_banned() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_notify_account_banned ON public.profiles;
CREATE TRIGGER trg_notify_account_banned
AFTER UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.notify_account_banned();
