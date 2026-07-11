-- Editable homepage CTA block (admin-managed)

CREATE TABLE IF NOT EXISTS public.homepage_cta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_text TEXT NOT NULL DEFAULT 'Prêt pour l''aventure ?',
  title TEXT NOT NULL DEFAULT 'Planifiez votre premier séjour Amani aux Comores',
  description TEXT NOT NULL DEFAULT 'Rejoignez une communauté de professionnels qui ont choisi de travailler autrement, en harmonie avec la planète.',
  primary_label TEXT NOT NULL DEFAULT 'Commencer gratuitement',
  primary_url TEXT NOT NULL DEFAULT '/signup',
  secondary_label TEXT NOT NULL DEFAULT 'Voir une démo',
  secondary_url TEXT NOT NULL DEFAULT '/destinations',
  trust_items TEXT[] NOT NULL DEFAULT ARRAY[
    'Inscription gratuite',
    'Annulation flexible',
    'Support 24/7'
  ],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_cta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read homepage CTA"
ON public.homepage_cta
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert homepage CTA"
ON public.homepage_cta
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update homepage CTA"
ON public.homepage_cta
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete homepage CTA"
ON public.homepage_cta
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.homepage_cta (
  badge_text,
  title,
  description,
  primary_label,
  primary_url,
  secondary_label,
  secondary_url,
  trust_items
)
SELECT
  'Prêt pour l''aventure ?',
  E'Planifiez votre premier\nséjour Amani aux Comores',
  'Rejoignez une communauté de plus de 12 000 professionnels qui ont choisi de travailler autrement, en harmonie avec la planète.',
  'Commencer gratuitement',
  '/signup',
  'Voir une démo',
  '/destinations',
  ARRAY['Inscription gratuite', 'Annulation flexible', 'Support 24/7']
WHERE NOT EXISTS (SELECT 1 FROM public.homepage_cta LIMIT 1);
