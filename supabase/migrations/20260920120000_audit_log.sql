-- Phase 3 (gouvernance) — journal d'audit (cahier §8/§17) : "lecture admin
-- uniquement ; écriture via trigger". Générique et attaché aux tables les
-- plus sensibles (privilèges, argent, validations QR) — pas à toutes les
-- tables du schéma, pour rester lisible et éviter le bruit sur les tables à
-- fort volume sans intérêt de traçabilité (ex. contenus CMS).

CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_type text NOT NULL DEFAULT 'user' CHECK (actor_type IN ('user', 'admin', 'system')),
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_log_entity_idx ON public.audit_log (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS audit_log_actor_id_idx ON public.audit_log (actor_id);
CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON public.audit_log (created_at DESC);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read audit log" ON public.audit_log;
CREATE POLICY "Admins can read audit log"
ON public.audit_log FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
-- Pas de policy INSERT/UPDATE/DELETE : seul le trigger (SECURITY DEFINER,
-- donc hors RLS) écrit ici. Un utilisateur, admin y compris, ne peut ni
-- modifier ni effacer une entrée du journal via l'application.

-- Trigger générique : capture qui (actor_id/actor_type), quoi (table,
-- action), et l'état avant/après en jsonb. RETURNS trigger empêche par
-- construction tout appel direct via RPC (Postgres refuse d'exécuter une
-- fonction "trigger" hors contexte de trigger, quels que soient les GRANTs).
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid := auth.uid();
  v_actor_type text;
  v_entity_id uuid;
  v_payload jsonb;
BEGIN
  IF v_actor_id IS NULL THEN
    v_actor_type := 'system';
  ELSIF public.has_role(v_actor_id, 'admin') THEN
    v_actor_type := 'admin';
  ELSE
    v_actor_type := 'user';
  END IF;

  IF TG_OP = 'DELETE' THEN
    v_entity_id := OLD.id;
    v_payload := jsonb_build_object('old', to_jsonb(OLD));
  ELSIF TG_OP = 'UPDATE' THEN
    v_entity_id := NEW.id;
    v_payload := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
  ELSE
    v_entity_id := NEW.id;
    v_payload := jsonb_build_object('new', to_jsonb(NEW));
  END IF;

  INSERT INTO public.audit_log (actor_id, actor_type, entity_type, entity_id, action, payload)
  VALUES (v_actor_id, v_actor_type, TG_TABLE_NAME, v_entity_id, lower(TG_OP), v_payload);

  RETURN COALESCE(NEW, OLD);
END;
$$;

REVOKE ALL ON FUNCTION public.log_audit_event() FROM PUBLIC, anon, authenticated;

-- Attaché aux actions réellement sensibles : privilèges, argent, validations.
DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS audit_payments ON public.payments;
CREATE TRIGGER audit_payments
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS audit_refunds ON public.refunds;
CREATE TRIGGER audit_refunds
AFTER INSERT OR UPDATE OR DELETE ON public.refunds
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS audit_donations ON public.donations;
CREATE TRIGGER audit_donations
AFTER INSERT OR UPDATE OR DELETE ON public.donations
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS audit_reservations ON public.reservations;
CREATE TRIGGER audit_reservations
AFTER INSERT OR UPDATE OR DELETE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS audit_action_participations ON public.action_participations;
CREATE TRIGGER audit_action_participations
AFTER INSERT OR UPDATE OR DELETE ON public.action_participations
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
