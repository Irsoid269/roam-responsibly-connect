-- Regroupement en un seul fichier de 3 migrations restées non appliquées
-- (20260924100000, 20260924110000, 20260924130000) malgré plusieurs
-- confirmations — objectif : éliminer tout risque d'erreur de copier-coller
-- en ne laissant qu'un seul script à exécuter d'un coup.

-- 1) Langue persistée dans le profil (cahier §7.11)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'fr'
    CHECK (language IN ('fr', 'en', 'zdj'));

-- 2) Avis vérifiés + tags récits + preuve signalement (cahier §7.9 / US-19)
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.set_review_verified()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.verified := EXISTS (
    SELECT 1
    FROM public.reservations r
    JOIN public.reservation_items ri ON ri.reservation_id = r.id
    WHERE r.user_id = NEW.user_id
      AND r.status = 'completed'
      AND ri.item_type = NEW.target_type
      AND ri.item_id = NEW.target_id
  );
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.set_review_verified() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_set_review_verified ON public.reviews;
CREATE TRIGGER trg_set_review_verified
BEFORE INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.set_review_verified();

ALTER TABLE public.community_stories
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS evidence_url text;

-- 3) Web Push — table des abonnements (cahier §7.10)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx ON public.push_subscriptions (user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users manage their own push subscriptions"
ON public.push_subscriptions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
