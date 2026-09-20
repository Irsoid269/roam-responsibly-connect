-- Pont transitoire tant que Stripe n'est pas branché (Phase 1 suite).
-- consume_hold() reste strictement réservé à service_role (le futur webhook Stripe) :
-- un client ne doit jamais pouvoir s'auto-valider un paiement.
-- En attendant, persistBooking() crée une réservation "confirmed" sans paiement réel
-- (gap déjà documenté dans le cahier des charges). Sans cette fonction, le hold posé
-- au moment de l'ajout au panier expirerait après son TTL (ex. 10 min) et libérerait
-- silencieusement une capacité pourtant réellement réservée — bug de capacité latent.
-- confirm_hold_without_payment() fige donc le hold ("consumed") sans y toucher côté
-- paiement. À supprimer/retirer du client dès que le webhook Stripe existe.

CREATE OR REPLACE FUNCTION public.confirm_hold_without_payment(p_hold_id uuid)
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
  IF v_hold.user_id IS DISTINCT FROM auth.uid() AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;
  IF v_hold.status <> 'active' THEN
    RAISE EXCEPTION 'hold_not_active';
  END IF;

  UPDATE public.inventory_holds SET status = 'consumed' WHERE id = p_hold_id;
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_hold_without_payment(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_hold_without_payment(uuid) TO authenticated;
