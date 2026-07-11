-- P2: CMS blog posts + events

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'Guides',
  author TEXT NOT NULL DEFAULT 'Amani Resorts',
  read_time_minutes INTEGER NOT NULL DEFAULT 5,
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  event_type TEXT NOT NULL DEFAULT 'En personne',
  location TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  is_online BOOLEAN NOT NULL DEFAULT false,
  attendees_count INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published blog posts"
ON public.blog_posts FOR SELECT
USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert blog posts"
ON public.blog_posts FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blog posts"
ON public.blog_posts FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blog posts"
ON public.blog_posts FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read published events"
ON public.events FOR SELECT
USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert events"
ON public.events FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update events"
ON public.events FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete events"
ON public.events FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Seed Comores-focused content (idempotent-ish: only if empty)
INSERT INTO public.blog_posts (title, excerpt, content, image_url, category, author, read_time_minutes, featured, published_at)
SELECT * FROM (VALUES
  (
    'Comment réduire son empreinte carbone aux Comores',
    'Conseils pratiques pour un séjour Amani plus responsable, sans sacrifier le confort.',
    'Voyager aux Comores peut être bas-carbone : ferry plutôt que vols internes, mobilité douce, hébergements éco-certifiés Amani.',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
    'Guides',
    'Équipe Amani',
    8,
    true,
    now() - interval '5 days'
  ),
  (
    'Top destinations éco-responsables de l''archipel',
    'Moroni, Itsandra, Mutsamudu, Fomboni : notre sélection pour travailler et explorer.',
    'Chaque île offre un rythme différent. Amani sélectionne des spots WiFi fiable et impact réduit.',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    'Destinations',
    'Équipe Amani',
    6,
    false,
    now() - interval '8 days'
  ),
  (
    'Mon mois de coworkation à Moroni',
    'Récit d''un séjour remote entre productivité, plages et culture comorienne.',
    'Travailler depuis Moroni change la donne : matinées productives, après-midis océan, soirées communauté.',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    'Récits',
    'Communauté Amani',
    12,
    false,
    now() - interval '12 days'
  )
) AS v(title, excerpt, content, image_url, category, author, read_time_minutes, featured, published_at)
WHERE NOT EXISTS (SELECT 1 FROM public.blog_posts LIMIT 1);

INSERT INTO public.events (title, description, image_url, event_type, location, starts_at, is_online, attendees_count)
SELECT * FROM (VALUES
  (
    'Meetup Amani Moroni',
    'Rencontrez d''autres nomades digitaux à Moroni et partagez vos expériences.',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    'En personne',
    'Cowork Moroni Hub',
    (now() + interval '14 days')::timestamptz,
    false,
    45
  ),
  (
    'Webinaire : Travailler depuis les Comores',
    'Visa, coût de vie, meilleurs spots à Moroni, Mutsamudu et Fomboni.',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    'Webinaire',
    'En ligne',
    (now() + interval '21 days')::timestamptz,
    true,
    120
  ),
  (
    'Atelier compensation carbone',
    'Mesurer et compenser son empreinte en tant que voyageur aux Comores.',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    'Atelier',
    'Amani Lodge, Moroni',
    (now() + interval '28 days')::timestamptz,
    false,
    30
  )
) AS v(title, description, image_url, event_type, location, starts_at, is_online, attendees_count)
WHERE NOT EXISTS (SELECT 1 FROM public.events LIMIT 1);
