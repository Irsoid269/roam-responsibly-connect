-- Web Push (cahier §7.10 — "notifications push", adapté au web puisque ce
-- dépôt est une PWA Vite/React et non un projet Capacitor/React Native :
-- pas de FCM/APNs mobile natif possible ici, le Web Push standard couvre le
-- même besoin sur le web/PWA existant).
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
-- Pas d'accès admin/support ici : un jeton de souscription push n'a
-- d'utilité que pour l'envoi côté service_role (send-notifications), qui
-- contourne RLS de toute façon.
