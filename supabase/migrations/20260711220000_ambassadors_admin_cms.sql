-- Admin CMS for community pages: ambassadors + admin insert on stories/reviews

-- Ambassadors
CREATE TABLE IF NOT EXISTS public.ambassadors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT,
  location TEXT,
  bio TEXT,
  avatar_url TEXT,
  carbon_saved INTEGER NOT NULL DEFAULT 0,
  countries_visited INTEGER NOT NULL DEFAULT 0,
  followers_label TEXT NOT NULL DEFAULT '0',
  specialties TEXT[] NOT NULL DEFAULT '{}',
  instagram_url TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ambassador_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published ambassadors"
ON public.ambassadors FOR SELECT
USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage ambassadors insert"
ON public.ambassadors FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage ambassadors update"
ON public.ambassadors FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage ambassadors delete"
ON public.ambassadors FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read published ambassador benefits"
ON public.ambassador_benefits FOR SELECT
USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage ambassador benefits insert"
ON public.ambassador_benefits FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage ambassador benefits update"
ON public.ambassador_benefits FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage ambassador benefits delete"
ON public.ambassador_benefits FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Editorial display name on reviews (admin-created)
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS author_display_name TEXT;

-- Admins can create community stories (published immediately if approved)
CREATE POLICY "Admins can insert community stories"
ON public.community_stories FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can create reviews (e.g. featured / editorial)
CREATE POLICY "Admins can insert reviews"
ON public.reviews FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed ambassadors if empty
INSERT INTO public.ambassadors (
  name, title, location, bio, carbon_saved, countries_visited, followers_label, specialties, sort_order
)
SELECT * FROM (VALUES
  (
    'Sophie Martin',
    'Digital Nomad & Consultante RSE',
    'Paris → Moroni',
    'Passionnée par le voyage responsable. Je partage mes découvertes aux Comores et dans l''océan Indien.',
    850, 28, '15K',
    ARRAY['Voyages longs', 'Éco-tourisme', 'Conseil RSE']::text[],
    1
  ),
  (
    'Thomas Dubois',
    'Développeur & Photographe nature',
    'Lyon → Grande Comore',
    'Je combine code et photographie pour documenter les merveilles des Comores en remote.',
    620, 15, '8K',
    ARRAY['Tech', 'Photographie', 'Comores']::text[],
    2
  ),
  (
    'Marie Chen',
    'Content Creator & Minimaliste',
    'Bordeaux → Mohéli',
    'Adepte du slow travel, je privilégie les expériences locales à Mohéli.',
    980, 22, '25K',
    ARRAY['Slow travel', 'Minimalisme', 'Mohéli']::text[],
    3
  ),
  (
    'Lucas Bernard',
    'Remote PM & Aventurier',
    'Toulouse → Anjouan',
    'Project Manager en remote qui explore Anjouan et les initiatives durables locales.',
    540, 12, '5K',
    ARRAY['Anjouan', 'Impact social', 'Management']::text[],
    4
  )
) AS v(name, title, location, bio, carbon_saved, countries_visited, followers_label, specialties, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.ambassadors LIMIT 1);

INSERT INTO public.ambassador_benefits (label, sort_order)
SELECT * FROM (VALUES
  ('Accès prioritaire aux nouvelles destinations', 1),
  ('Séjours offerts dans notre réseau partenaire', 2),
  ('Badge ambassadeur vérifié sur votre profil', 3),
  ('Invitations aux événements exclusifs', 4),
  ('Commission sur les réservations recommandées', 5),
  ('Équipement et goodies Amani Resorts', 6)
) AS v(label, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.ambassador_benefits LIMIT 1);
