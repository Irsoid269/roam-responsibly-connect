-- SECURITY FIX — discovered by testing with the anon key after applying the
-- Stripe skeleton migrations.
--
-- Root cause: on this platform, newly created functions are auto-granted
-- EXECUTE to `anon` and `authenticated` at creation time (a default privilege
-- rule), as *specific* grants — not merely inherited from PUBLIC. Every
-- previous migration's "REVOKE ALL ... FROM PUBLIC" therefore did nothing:
-- it revoked a grant PUBLIC never actually held, while the real anon/
-- authenticated grants stayed in place underneath. Confirmed empirically:
-- consume_hold() and expire_stale_holds() were callable with the public
-- anon key. consume_hold() has no internal ownership check (it was designed
-- to be reachable only by service_role), so this meant ANY unauthenticated
-- visitor could mark ANY hold as "consumed" — i.e. self-declare a booking as
-- paid without ever paying, once this function is wired to real bookings.
-- generate_invoice_number() was reachable too (low severity: burns sequence
-- numbers, no fraud/data impact, but still not intended to be public).
--
-- release_hold() and confirm_hold_without_payment() were NOT exploitable
-- despite the same grant issue, because they each check the caller's
-- auth.uid() against the hold's owner internally — proof that defense in
-- depth (never trusting grants alone) is worth the extra line.

-- 1. Explicit, role-targeted revokes (the only kind that actually works here).
REVOKE EXECUTE ON FUNCTION public.consume_hold(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.expire_stale_holds() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_invoice_number() FROM anon, authenticated;

-- 2. Defense in depth: consume_hold now also checks the caller is genuinely
-- service_role, so a future grant mistake (or a Supabase platform default
-- change) can't silently reopen this hole again.
CREATE OR REPLACE FUNCTION public.consume_hold(p_hold_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hold public.inventory_holds%ROWTYPE;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

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

REVOKE ALL ON FUNCTION public.consume_hold(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_hold(uuid) TO service_role;

-- Re-confirm the other two stay locked down too, for the same defense-in-depth reason.
REVOKE ALL ON FUNCTION public.expire_stale_holds() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expire_stale_holds() TO service_role;

REVOKE ALL ON FUNCTION public.generate_invoice_number() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_invoice_number() TO service_role;
