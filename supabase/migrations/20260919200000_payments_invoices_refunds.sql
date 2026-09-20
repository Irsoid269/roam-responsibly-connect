-- Phase 1 (paiement) — squelette Stripe : payments, invoices, refunds +
-- journal d'événements webhook (idempotence côté serveur, cf. cahier §7.6).
-- Toutes les écritures passent exclusivement par les Edge Functions
-- (service_role) — jamais par le client, même authentifié : un visiteur ne
-- doit jamais pouvoir se déclarer "payé" lui-même.

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES public.reservations(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  stripe_payment_intent_id text UNIQUE,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'eur',
  status text NOT NULL DEFAULT 'requires_payment_method'
    CHECK (status IN (
      'requires_payment_method', 'requires_confirmation', 'requires_action',
      'processing', 'succeeded', 'canceled', 'failed'
    )),
  idempotency_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments (user_id);
CREATE INDEX IF NOT EXISTS payments_reservation_id_idx ON public.payments (reservation_id);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own payments" ON public.payments;
CREATE POLICY "Users can read their own payments"
ON public.payments FOR SELECT
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  reservation_id uuid REFERENCES public.reservations(id) ON DELETE SET NULL,
  invoice_number text NOT NULL UNIQUE,
  lines jsonb NOT NULL DEFAULT '[]',
  total numeric(10,2) NOT NULL,
  pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS invoices_payment_id_idx ON public.invoices (payment_id);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own invoices" ON public.invoices;
CREATE POLICY "Users can read their own invoices"
ON public.invoices FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.payments p
    WHERE p.id = invoices.payment_id AND p.user_id = auth.uid()
  )
);

CREATE TABLE IF NOT EXISTS public.refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  reason text,
  stripe_refund_id text UNIQUE,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS refunds_payment_id_idx ON public.refunds (payment_id);

ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own refunds" ON public.refunds;
CREATE POLICY "Users can read their own refunds"
ON public.refunds FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.payments p
    WHERE p.id = refunds.payment_id AND p.user_id = auth.uid()
  )
);

-- Journal des événements Stripe déjà traités — un même event_id ne doit
-- jamais être appliqué deux fois (Stripe redélivre en cas de doute réseau).
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id text PRIMARY KEY,
  type text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
-- Aucune policy : accessible uniquement via service_role (le webhook lui-même).

-- Numérotation de facture lisible et unique : AMN-<année>-<compteur>
CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE sql
SET search_path = public
AS $$
  SELECT 'AMN-' || to_char(now(), 'YYYY') || '-' ||
    lpad(nextval('public.invoice_number_seq')::text, 6, '0');
$$;

REVOKE ALL ON FUNCTION public.generate_invoice_number() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_invoice_number() TO service_role;
