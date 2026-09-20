-- Lot 0 : catalogue "Coworkation Eco-Comores" — univers, prestataires,
-- extension du catalogue d'activités et import des 17 expériences.
-- Les tarifs, durées, capacités, points de RDV et politiques d'annulation
-- restent NULL : ils doivent être validés par ComWork Partners / VLC /
-- DISCOVERMORES avant d'activer booking_enabled (cf. README du pack catalogue).

-- 1. Univers thématiques (A-D)
CREATE TABLE IF NOT EXISTS public.universes (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE CHECK (code IN ('A', 'B', 'C', 'D')),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.universes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read universes"
ON public.universes FOR SELECT
USING (true);

CREATE POLICY "Admins manage universes insert"
ON public.universes FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage universes update"
ON public.universes FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage universes delete"
ON public.universes FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Prestataires
CREATE TABLE IF NOT EXISTS public.providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  positioning TEXT,
  status TEXT NOT NULL DEFAULT 'active_contract_formalization'
    CHECK (status IN ('active_contract_formalization', 'active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read providers"
ON public.providers FOR SELECT
USING (true);

CREATE POLICY "Admins manage providers insert"
ON public.providers FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage providers update"
ON public.providers FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage providers delete"
ON public.providers FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Extension du catalogue d'activités existant
-- destination_id devient optionnel : les circuits du catalogue couvrent des
-- îles/zones (islands/locations) plutôt qu'une fiche destination unique.
ALTER TABLE public.activities
  ALTER COLUMN destination_id DROP NOT NULL;

ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS long_description TEXT,
  ADD COLUMN IF NOT EXISTS universe_id TEXT REFERENCES public.universes(id),
  ADD COLUMN IF NOT EXISTS provider_id TEXT REFERENCES public.providers(id),
  ADD COLUMN IF NOT EXISTS catalogue_number INTEGER,
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS islands TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS locations TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS options JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS included JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS excluded JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS gallery JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS cover_image_path TEXT,
  ADD COLUMN IF NOT EXISTS alt_text TEXT,
  ADD COLUMN IF NOT EXISTS meeting_point TEXT,
  ADD COLUMN IF NOT EXISTS minimum_age INTEGER,
  ADD COLUMN IF NOT EXISTS physical_level TEXT CHECK (physical_level IN ('easy', 'moderate', 'difficult')),
  ADD COLUMN IF NOT EXISTS cancellation_policy TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT CHECK (currency IN ('KMF', 'EUR')),
  ADD COLUMN IF NOT EXISTS min_capacity INTEGER,
  ADD COLUMN IF NOT EXISTS max_capacity INTEGER,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS booking_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS activities_slug_key ON public.activities (slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS activities_universe_id_idx ON public.activities (universe_id);
CREATE INDEX IF NOT EXISTS activities_provider_id_idx ON public.activities (provider_id);

-- 4. Seed univers (idempotent)
INSERT INTO public.universes (id, code, name, description, color, sort_order) VALUES
  ('gastronomie-savoir-faire', 'A', 'Gastronomie & savoir-faire local', 'Goûter, apprendre et créer aux côtés des artisans et familles comoriennes.', '#C66A4A', 1),
  ('decouverte-terrestre', 'B', 'Circuits & découverte terrestre', 'Découvrir Ngazidja de la côte aux flancs du Karthala, en véhicule, en quad, en buggy ou à pied.', '#37695C', 2),
  ('mer-faune-marine', 'C', 'Mer & faune marine', 'Explorer l''Océan Indien, ses récifs et sa faune marine dans le respect du vivant.', '#2F7E86', 3),
  ('evasion-immersion', 'D', 'Évasion & immersion', 'Prolonger l''expérience par un bivouac ou un séjour de plusieurs jours à Mohéli.', '#E8D8BD', 4)
ON CONFLICT (id) DO NOTHING;

-- 5. Seed prestataires (idempotent)
INSERT INTO public.providers (id, name, positioning, status) VALUES
  ('vlc', 'VLC', 'Acteur local de la découverte et de l''immersion terrestre, gastronomique et culturelle.', 'active_contract_formalization'),
  ('discovermores', 'DISCOVERMORES', 'Opérateur d''activités et de sports nature, de randonnée, de plongée et de découverte de la faune marine.', 'active_contract_formalization')
ON CONFLICT (id) DO NOTHING;

-- 6. Import des 17 activités du catalogue "Coworkation Eco-Comores"
-- (source : Amani Resorts, catalogue-amani-resorts.json v1.0.0, 2026-09-17)
INSERT INTO public.activities (
  name, description, long_description, destination_id, category, image_url, price, duration_hours,
  carbon_impact, eco_certified, universe_id, provider_id, catalogue_number, slug, tags, islands,
  locations, options, included, excluded, gallery, cover_image_path, alt_text, meeting_point,
  minimum_age, physical_level, cancellation_policy, currency, min_capacity, max_capacity,
  duration_minutes, booking_enabled, featured, sort_order
) VALUES
  (
    'Saveurs comoriennes chez l’habitant', -- name
    'Préparez et dégustez des plats traditionnels dans une maison comorienne.', -- description
    'Partagez un moment authentique en préparant et en dégustant des plats traditionnels dans une maison comorienne, située dans la Médina de Moroni ou dans le village de Nioumadzaha Bambao.', -- long_description
    NULL, -- destination_id
    NULL, -- category
    NULL, -- image_url
    NULL, -- price
    NULL, -- duration_hours
    0, -- carbon_impact (mobilite douce / activites locales, a affiner en Phase 2)
    false, -- eco_certified
    'gastronomie-savoir-faire', -- universe_id
    'vlc', -- provider_id
    1, -- catalogue_number
    'saveurs-comoriennes-chez-habitant', -- slug
    ARRAY['gastronomie','chez l’habitant','culture','immersion']::text[], -- tags
    ARRAY['Ngazidja']::text[], -- islands
    ARRAY['Médina de Moroni','Nioumadzaha Bambao']::text[], -- locations
    '[]'::jsonb, -- options
    '[]'::jsonb, -- included
    '[]'::jsonb, -- excluded
    '[]'::jsonb, -- gallery
    'assets/activities/saveurs-comoriennes-chez-habitant/cover.webp', -- cover_image_path
    'Préparation d’un repas traditionnel comorien chez l’habitant', -- alt_text
    NULL, -- meeting_point
    NULL, -- minimum_age
    NULL, -- physical_level
    NULL, -- cancellation_policy
    NULL, -- currency
    NULL, -- min_capacity
    NULL, -- max_capacity
    NULL, -- duration_minutes
    false, -- booking_enabled
    true, -- featured
    1 -- sort_order
  ),
  (
    'Paint & discover', -- name
    'Peignez en plein air tout en découvrant les paysages des Comores.', -- description
    'Alliez créativité et détente en laissant libre cours à vos pinceaux, tout en découvrant les magnifiques paysages des Comores.', -- long_description
    NULL, -- destination_id
    NULL, -- category
    NULL, -- image_url
    NULL, -- price
    NULL, -- duration_hours
    0, -- carbon_impact (mobilite douce / activites locales, a affiner en Phase 2)
    false, -- eco_certified
    'gastronomie-savoir-faire', -- universe_id
    'vlc', -- provider_id
    2, -- catalogue_number
    'paint-and-discover', -- slug
    ARRAY['peinture','créativité','paysage','détente']::text[], -- tags
    ARRAY['Non précisé']::text[], -- islands
    ARRAY[]::text[], -- locations
    '[]'::jsonb, -- options
    '[]'::jsonb, -- included
    '[]'::jsonb, -- excluded
    '[]'::jsonb, -- gallery
    'assets/activities/paint-and-discover/cover.webp', -- cover_image_path
    'Atelier de peinture en plein air aux Comores', -- alt_text
    NULL, -- meeting_point
    NULL, -- minimum_age
    NULL, -- physical_level
    NULL, -- cancellation_policy
    NULL, -- currency
    NULL, -- min_capacity
    NULL, -- max_capacity
    NULL, -- duration_minutes
    false, -- booking_enabled
    false, -- featured
    2 -- sort_order
  ),
  (
    'Les secrets de la vanille', -- name
    'Rencontrez les cultivateurs et découvrez la préparation de la vanille comorienne.', -- description
    'Partez à la rencontre des cultivateurs et initiez-vous à l’art de la préparation de la vanille comorienne.', -- long_description
    NULL, -- destination_id
    NULL, -- category
    NULL, -- image_url
    NULL, -- price
    NULL, -- duration_hours
    0, -- carbon_impact (mobilite douce / activites locales, a affiner en Phase 2)
    false, -- eco_certified
    'gastronomie-savoir-faire', -- universe_id
    'vlc', -- provider_id
    3, -- catalogue_number
    'secrets-vanille', -- slug
    ARRAY['vanille','agriculture','savoir-faire','producteurs']::text[], -- tags
    ARRAY['Non précisé']::text[], -- islands
    ARRAY[]::text[], -- locations
    '[]'::jsonb, -- options
    '[]'::jsonb, -- included
    '[]'::jsonb, -- excluded
    '[]'::jsonb, -- gallery
    'assets/activities/secrets-vanille/cover.webp', -- cover_image_path
    'Culture et préparation de la vanille comorienne', -- alt_text
    NULL, -- meeting_point
    NULL, -- minimum_age
    NULL, -- physical_level
    NULL, -- cancellation_policy
    NULL, -- currency
    NULL, -- min_capacity
    NULL, -- max_capacity
    NULL, -- duration_minutes
    false, -- booking_enabled
    true, -- featured
    3 -- sort_order
  ),
  (
    'Initiation à la menuiserie comorienne', -- name
    'Découvrez le travail du bois et créez une pièce unique.', -- description
    'Initiez-vous au savoir-faire comorien du bois et repartez avec une pièce unique façonnée par vos soins.', -- long_description
    NULL, -- destination_id
    NULL, -- category
    NULL, -- image_url
    NULL, -- price
    NULL, -- duration_hours
    0, -- carbon_impact (mobilite douce / activites locales, a affiner en Phase 2)
    false, -- eco_certified
    'gastronomie-savoir-faire', -- universe_id
    'vlc', -- provider_id
    4, -- catalogue_number
    'initiation-menuiserie-comorienne', -- slug
    ARRAY['menuiserie','artisanat','bois','atelier']::text[], -- tags
    ARRAY['Non précisé']::text[], -- islands
    ARRAY[]::text[], -- locations
    '[]'::jsonb, -- options
    '[]'::jsonb, -- included
    '[]'::jsonb, -- excluded
    '[]'::jsonb, -- gallery
    'assets/activities/initiation-menuiserie-comorienne/cover.webp', -- cover_image_path
    'Initiation au travail artisanal du bois aux Comores', -- alt_text
    NULL, -- meeting_point
    NULL, -- minimum_age
    NULL, -- physical_level
    NULL, -- cancellation_policy
    NULL, -- currency
    NULL, -- min_capacity
    NULL, -- max_capacity
    NULL, -- duration_minutes
    false, -- booking_enabled
    false, -- featured
    4 -- sort_order
  ),
  (
    'Circuit nord', -- name
    'Découvrez le nord de Ngazidja entre plages, histoire et paysages volcaniques.', -- description
    'Entre plage, histoire et paysages volcaniques, partez à la découverte du nord de la Grande Comore (Ngazidja).', -- long_description
    NULL, -- destination_id
    NULL, -- category
    NULL, -- image_url
    NULL, -- price
    NULL, -- duration_hours
    0, -- carbon_impact (mobilite douce / activites locales, a affiner en Phase 2)
    false, -- eco_certified
    'decouverte-terrestre', -- universe_id
    'vlc', -- provider_id
    5, -- catalogue_number
    'circuit-nord', -- slug
    ARRAY['circuit','plage','histoire','volcan']::text[], -- tags
    ARRAY['Ngazidja']::text[], -- islands
    ARRAY['Nord de la Grande Comore']::text[], -- locations
    '[]'::jsonb, -- options
    '[]'::jsonb, -- included
    '[]'::jsonb, -- excluded
    '[]'::jsonb, -- gallery
    'assets/activities/circuit-nord/cover.webp', -- cover_image_path
    'Paysage côtier du nord de la Grande Comore', -- alt_text
    NULL, -- meeting_point
    NULL, -- minimum_age
    NULL, -- physical_level
    NULL, -- cancellation_policy
    NULL, -- currency
    NULL, -- min_capacity
    NULL, -- max_capacity
    NULL, -- duration_minutes
    false, -- booking_enabled
    true, -- featured
    5 -- sort_order
  ),
  (
    'Circuit sud', -- name
    'Explorez le sud de Ngazidja entre panoramas, patrimoine et rencontres.', -- description
    'Cap vers le sud de la Grande Comore : vues panoramiques, patrimoine et rencontres locales.', -- long_description
    NULL, -- destination_id
    NULL, -- category
    NULL, -- image_url
    NULL, -- price
    NULL, -- duration_hours
    0, -- carbon_impact (mobilite douce / activites locales, a affiner en Phase 2)
    false, -- eco_certified
    'decouverte-terrestre', -- universe_id
    'vlc', -- provider_id
    6, -- catalogue_number
    'circuit-sud', -- slug
    ARRAY['circuit','panorama','patrimoine','rencontres']::text[], -- tags
    ARRAY['Ngazidja']::text[], -- islands
    ARRAY['Sud de la Grande Comore']::text[], -- locations
    '[]'::jsonb, -- options
    '[]'::jsonb, -- included
    '[]'::jsonb, -- excluded
    '[]'::jsonb, -- gallery
    'assets/activities/circuit-sud/cover.webp', -- cover_image_path
    'Vue panoramique du sud de la Grande Comore', -- alt_text
    NULL, -- meeting_point
    NULL, -- minimum_age
    NULL, -- physical_level
    NULL, -- cancellation_policy
    NULL, -- currency
    NULL, -- min_capacity
    NULL, -- max_capacity
    NULL, -- duration_minutes
    false, -- booking_enabled
    false, -- featured
    6 -- sort_order
  ),
  (
    'Quad dans le nord', -- name
    'Explorez le nord de Ngazidja en quad.', -- description
    'Explorez le nord de la Grande Comore, entre Maloudja et le Dos du dragon, en quad.', -- long_description
    NULL, -- destination_id
    NULL, -- category
    NULL, -- image_url
    NULL, -- price
    NULL, -- duration_hours
    0, -- carbon_impact (mobilite douce / activites locales, a affiner en Phase 2)
    false, -- eco_certified
    'decouverte-terrestre', -- universe_id
    'vlc', -- provider_id
    7, -- catalogue_number
    'quad-nord', -- slug
    ARRAY['quad','aventure','nord','volcan']::text[], -- tags
    ARRAY['Ngazidja']::text[], -- islands
    ARRAY['Maloudja','Dos du dragon']::text[], -- locations
    '[]'::jsonb, -- options
    '[]'::jsonb, -- included
    '[]'::jsonb, -- excluded
    '[]'::jsonb, -- gallery
    'assets/activities/quad-nord/cover.webp', -- cover_image_path
    'Excursion en quad dans le nord de la Grande Comore', -- alt_text
    NULL, -- meeting_point
    NULL, -- minimum_age
    NULL, -- physical_level
    NULL, -- cancellation_policy
    NULL, -- currency
    NULL, -- min_capacity
    NULL, -- max_capacity
    NULL, -- duration_minutes
    false, -- booking_enabled
    false, -- featured
    7 -- sort_order
  ),
  (
    'Rando Karthala', -- name
    'Découvrez le volcan Karthala selon plusieurs formules d’ascension.', -- description
    'Découvrez le majestueux volcan Karthala grâce à plusieurs formules adaptées au temps disponible et à la condition physique.', -- long_description
    NULL, -- destination_id
    NULL, -- category
    NULL, -- image_url
    NULL, -- price
    NULL, -- duration_hours
    0, -- carbon_impact (mobilite douce / activites locales, a affiner en Phase 2)
    false, -- eco_certified
    'decouverte-terrestre', -- universe_id
    'discovermores', -- provider_id
    8, -- catalogue_number
    'rando-karthala', -- slug
    ARRAY['randonnée','volcan','bivouac','4x4']::text[], -- tags
    ARRAY['Ngazidja']::text[], -- islands
    ARRAY['Karthala']::text[], -- locations
    '[{"id": "rando-2-jours-bivouac", "name": {"fr": "Randonnée 2 jours avec bivouac", "en": null}, "description": {"fr": "Une immersion complète avec une nuit en bivouac.", "en": null}}, {"id": "excursion-journee-4x4-marche", "name": {"fr": "Excursion journée 4x4 et marche", "en": null}, "description": {"fr": "Une formule combinée pour accéder aux panoramas du volcan.", "en": null}}, {"id": "ascension-4x4", "name": {"fr": "Ascension complète en 4x4", "en": null}, "description": {"fr": "Une formule motorisée jusqu’au sommet.", "en": null}}]'::jsonb, -- options
    '[]'::jsonb, -- included
    '[]'::jsonb, -- excluded
    '[]'::jsonb, -- gallery
    'assets/activities/rando-karthala/cover.webp', -- cover_image_path
    'Randonnée sur le volcan Karthala', -- alt_text
    NULL, -- meeting_point
    NULL, -- minimum_age
    'difficult', -- physical_level
    NULL, -- cancellation_policy
    NULL, -- currency
    NULL, -- min_capacity
    NULL, -- max_capacity
    NULL, -- duration_minutes
    false, -- booking_enabled
    true, -- featured
    8 -- sort_order
  ),
  (
    'Buggy Karthala / Nord', -- name
    'Explorez le Karthala ou le nord en buggy.', -- description
    'Vivez des sensations fortes en explorant le Karthala ou le nord en buggy, à travers paysages volcaniques, sentiers escarpés et panoramas spectaculaires.', -- long_description
    NULL, -- destination_id
    NULL, -- category
    NULL, -- image_url
    NULL, -- price
    NULL, -- duration_hours
    0, -- carbon_impact (mobilite douce / activites locales, a affiner en Phase 2)
    false, -- eco_certified
    'decouverte-terrestre', -- universe_id
    'discovermores', -- provider_id
    9, -- catalogue_number
    'buggy-karthala-nord', -- slug
    ARRAY['buggy','aventure','volcan','panorama']::text[], -- tags
    ARRAY['Ngazidja']::text[], -- islands
    ARRAY['Karthala','Nord de la Grande Comore']::text[], -- locations
    '[]'::jsonb, -- options
    '[]'::jsonb, -- included
    '[]'::jsonb, -- excluded
    '[]'::jsonb, -- gallery
    'assets/activities/buggy-karthala-nord/cover.webp', -- cover_image_path
    'Excursion en buggy sur les pistes volcaniques de Ngazidja', -- alt_text
    NULL, -- meeting_point
    NULL, -- minimum_age
    'moderate', -- physical_level
    NULL, -- cancellation_policy
    NULL, -- currency
    NULL, -- min_capacity
    NULL, -- max_capacity
    NULL, -- duration_minutes
    false, -- booking_enabled
    false, -- featured
    9 -- sort_order
  ),
  (
    'À la recherche des dauphins', -- name
    'Partez en mer à la recherche des dauphins de l’Océan Indien.', -- description
    'Embarquez pour une sortie en mer à la recherche des magnifiques dauphins de l’Océan Indien.', -- long_description
    NULL, -- destination_id
    NULL, -- category
    NULL, -- image_url
    NULL, -- price
    NULL, -- duration_hours
    0, -- carbon_impact (mobilite douce / activites locales, a affiner en Phase 2)
    false, -- eco_certified
    'mer-faune-marine', -- universe_id
    'vlc', -- provider_id
    10, -- catalogue_number
    'recherche-dauphins', -- slug
    ARRAY['dauphins','sortie en mer','faune marine']::text[], -- tags
    ARRAY['Ngazidja']::text[], -- islands
    ARRAY[]::text[], -- locations
    '[]'::jsonb, -- options
    '[]'::jsonb, -- included
    '[]'::jsonb, -- excluded
    '[]'::jsonb, -- gallery
    'assets/activities/recherche-dauphins/cover.webp', -- cover_image_path
    'Dauphins nageant dans l’Océan Indien', -- alt_text
    NULL, -- meeting_point
    NULL, -- minimum_age
    'easy', -- physical_level
    NULL, -- cancellation_policy
    NULL, -- currency
    NULL, -- min_capacity
    NULL, -- max_capacity
    NULL, -- duration_minutes
    false, -- booking_enabled
    true, -- featured
    10 -- sort_order
  ),
  (
    'À la recherche des dauphins + Circuit nord', -- name
    'Combinez une sortie dauphins et la découverte du nord de Ngazidja.', -- description
    'Formule complète combinant la sortie en mer à la recherche des dauphins et la découverte du nord de la Grande Comore.', -- long_description
    NULL, -- destination_id
    NULL, -- category
    NULL, -- image_url
    NULL, -- price
    NULL, -- duration_hours
    0, -- carbon_impact (mobilite douce / activites locales, a affiner en Phase 2)
    false, -- eco_certified
    'mer-faune-marine', -- universe_id
    'vlc', -- provider_id
    11, -- catalogue_number
    'dauphins-circuit-nord', -- slug
    ARRAY['dauphins','circuit','nord','journée complète']::text[], -- tags
    ARRAY['Ngazidja']::text[], -- islands
    ARRAY['Nord de la Grande Comore']::text[], -- locations
    '[]'::jsonb, -- options
    '[]'::jsonb, -- included
    '[]'::jsonb, -- excluded
    '[]'::jsonb, -- gallery
    'assets/activities/dauphins-circuit-nord/cover.webp', -- cover_image_path
    'Sortie dauphins et circuit dans le nord de Ngazidja', -- alt_text
    NULL, -- meeting_point
    NULL, -- minimum_age
    'easy', -- physical_level
    NULL, -- cancellation_policy
    NULL, -- currency
    NULL, -- min_capacity
    NULL, -- max_capacity
    NULL, -- duration_minutes
    false, -- booking_enabled
    true, -- featured
    11 -- sort_order
  ),
  (
    'Randonnée palmée', -- name
    'Explorez les fonds marins d’Iconi en snorkeling.', -- description
    'Partez en randonnée palmée à Iconi et découvrez les jardins de coraux, poissons tropicaux et tortues marines dans leur habitat naturel.', -- long_description
    NULL, -- destination_id
    NULL, -- category
    NULL, -- image_url
    NULL, -- price
    NULL, -- duration_hours
    0, -- carbon_impact (mobilite douce / activites locales, a affiner en Phase 2)
    false, -- eco_certified
    'mer-faune-marine', -- universe_id
    'discovermores', -- provider_id
    12, -- catalogue_number
    'randonnee-palmee-iconi', -- slug
    ARRAY['snorkeling','coraux','tortues','poissons tropicaux']::text[], -- tags
    ARRAY['Ngazidja']::text[], -- islands
    ARRAY['Iconi']::text[], -- locations
    '[]'::jsonb, -- options
    '[]'::jsonb, -- included
    '[]'::jsonb, -- excluded
    '[]'::jsonb, -- gallery
    'assets/activities/randonnee-palmee-iconi/cover.webp', -- cover_image_path
    'Randonnée palmée au-dessus des récifs d’Iconi', -- alt_text
    NULL, -- meeting_point
    NULL, -- minimum_age
    'easy', -- physical_level
    NULL, -- cancellation_policy
    NULL, -- currency
    NULL, -- min_capacity
    NULL, -- max_capacity
    NULL, -- duration_minutes
    false, -- booking_enabled
    false, -- featured
    12 -- sort_order
  ),
  (
    'Plongée sous-marine / Baptême', -- name
    'Découvrez les fonds marins selon votre niveau de plongée.', -- description
    'Explorez les fonds marins des Comores en plongée bouteille, à un rythme adapté à chaque niveau.', -- long_description
    NULL, -- destination_id
    NULL, -- category
    NULL, -- image_url
    NULL, -- price
    NULL, -- duration_hours
    0, -- carbon_impact (mobilite douce / activites locales, a affiner en Phase 2)
    false, -- eco_certified
    'mer-faune-marine', -- universe_id
    'discovermores', -- provider_id
    13, -- catalogue_number
    'plongee-sous-marine-bapteme', -- slug
    ARRAY['plongée','baptême','coraux','tortues']::text[], -- tags
    ARRAY['Non précisé']::text[], -- islands
    ARRAY[]::text[], -- locations
    '[{"id": "initiation", "name": {"fr": "Initiation", "en": null}, "description": {"fr": "Baptême encadré et découverte des premiers coraux.", "en": null}}, {"id": "intermediaire", "name": {"fr": "Intermédiaire", "en": null}, "description": {"fr": "Jardins de coraux plus vastes et observation des tortues.", "en": null}}, {"id": "avance", "name": {"fr": "Avancé", "en": null}, "description": {"fr": "Sites spectaculaires aux reliefs variés.", "en": null}}, {"id": "exploration", "name": {"fr": "Exploration", "en": null}, "description": {"fr": "Expéditions personnalisées sur des sites préservés.", "en": null}}]'::jsonb, -- options
    '[]'::jsonb, -- included
    '[]'::jsonb, -- excluded
    '[]'::jsonb, -- gallery
    'assets/activities/plongee-sous-marine-bapteme/cover.webp', -- cover_image_path
    'Plongée sous-marine dans les récifs des Comores', -- alt_text
    NULL, -- meeting_point
    NULL, -- minimum_age
    'moderate', -- physical_level
    NULL, -- cancellation_policy
    NULL, -- currency
    NULL, -- min_capacity
    NULL, -- max_capacity
    NULL, -- duration_minutes
    false, -- booking_enabled
    true, -- featured
    13 -- sort_order
  ),
  (
    'À la découverte des géants de l’océan', -- name
    'Observez les grands animaux marins selon les saisons.', -- description
    'Sortie en mer à la rencontre des baleines, dauphins, requins-baleines, cachalots et parfois orques, selon les saisons et dans le respect de la vie marine.', -- long_description
    NULL, -- destination_id
    NULL, -- category
    NULL, -- image_url
    NULL, -- price
    NULL, -- duration_hours
    0, -- carbon_impact (mobilite douce / activites locales, a affiner en Phase 2)
    false, -- eco_certified
    'mer-faune-marine', -- universe_id
    'discovermores', -- provider_id
    14, -- catalogue_number
    'geants-ocean', -- slug
    ARRAY['baleines','requins-baleines','cachalots','dauphins','saisonnier']::text[], -- tags
    ARRAY['Non précisé']::text[], -- islands
    ARRAY[]::text[], -- locations
    '[]'::jsonb, -- options
    '[]'::jsonb, -- included
    '[]'::jsonb, -- excluded
    '[]'::jsonb, -- gallery
    'assets/activities/geants-ocean/cover.webp', -- cover_image_path
    'Observation de grands animaux marins dans l’Océan Indien', -- alt_text
    NULL, -- meeting_point
    NULL, -- minimum_age
    'easy', -- physical_level
    NULL, -- cancellation_policy
    NULL, -- currency
    NULL, -- min_capacity
    NULL, -- max_capacity
    NULL, -- duration_minutes
    false, -- booking_enabled
    true, -- featured
    14 -- sort_order
  ),
  (
    'Initiation à la pêche traditionnelle', -- name
    'Découvrez les techniques de pêche avec les pêcheurs locaux.', -- description
    'Initiez-vous aux techniques de pêche traditionnelle comorienne avec les pêcheurs locaux, dans le respect des pratiques durables.', -- long_description
    NULL, -- destination_id
    NULL, -- category
    NULL, -- image_url
    NULL, -- price
    NULL, -- duration_hours
    0, -- carbon_impact (mobilite douce / activites locales, a affiner en Phase 2)
    false, -- eco_certified
    'mer-faune-marine', -- universe_id
    'discovermores', -- provider_id
    15, -- catalogue_number
    'peche-traditionnelle', -- slug
    ARRAY['pêche','tradition','pêcheurs','durable']::text[], -- tags
    ARRAY['Non précisé']::text[], -- islands
    ARRAY[]::text[], -- locations
    '[]'::jsonb, -- options
    '[]'::jsonb, -- included
    '[]'::jsonb, -- excluded
    '[]'::jsonb, -- gallery
    'assets/activities/peche-traditionnelle/cover.webp', -- cover_image_path
    'Initiation à la pêche traditionnelle comorienne', -- alt_text
    NULL, -- meeting_point
    NULL, -- minimum_age
    'moderate', -- physical_level
    NULL, -- cancellation_policy
    NULL, -- currency
    NULL, -- min_capacity
    NULL, -- max_capacity
    NULL, -- duration_minutes
    false, -- booking_enabled
    false, -- featured
    15 -- sort_order
  ),
  (
    'Bivouac (nuitée camping nord)', -- name
    'Passez une nuit sous les étoiles dans le nord des Comores.', -- description
    'Vivez une expérience unique en passant la nuit en bivouac dans le nord des Comores, au cœur de paysages naturels préservés et sous un ciel étoilé.', -- long_description
    NULL, -- destination_id
    NULL, -- category
    NULL, -- image_url
    NULL, -- price
    NULL, -- duration_hours
    0, -- carbon_impact (mobilite douce / activites locales, a affiner en Phase 2)
    false, -- eco_certified
    'evasion-immersion', -- universe_id
    'discovermores', -- provider_id
    16, -- catalogue_number
    'bivouac-nord', -- slug
    ARRAY['bivouac','camping','nuit','nature']::text[], -- tags
    ARRAY['Ngazidja']::text[], -- islands
    ARRAY['Nord de la Grande Comore']::text[], -- locations
    '[]'::jsonb, -- options
    '[]'::jsonb, -- included
    '[]'::jsonb, -- excluded
    '[]'::jsonb, -- gallery
    'assets/activities/bivouac-nord/cover.webp', -- cover_image_path
    'Bivouac sous les étoiles dans le nord de Ngazidja', -- alt_text
    NULL, -- meeting_point
    NULL, -- minimum_age
    'easy', -- physical_level
    NULL, -- cancellation_policy
    NULL, -- currency
    NULL, -- min_capacity
    NULL, -- max_capacity
    NULL, -- duration_minutes
    false, -- booking_enabled
    true, -- featured
    16 -- sort_order
  ),
  (
    'Circuit 3 jours / 2 nuits à Mohéli', -- name
    'Découvrez Mohéli pendant trois jours en formule tout compris.', -- description
    'Partez pour un circuit de 3 jours et 2 nuits à Mohéli, l’Île Nature des Comores, en formule all inclusive : plages, forêts, récifs, faune marine, randonnée, plongée et snorkeling, avec hébergement et restauration.', -- long_description
    NULL, -- destination_id
    NULL, -- category
    NULL, -- image_url
    NULL, -- price
    NULL, -- duration_hours
    0, -- carbon_impact (mobilite douce / activites locales, a affiner en Phase 2)
    false, -- eco_certified
    'evasion-immersion', -- universe_id
    'discovermores', -- provider_id
    17, -- catalogue_number
    'circuit-moheli-3-jours-2-nuits', -- slug
    ARRAY['séjour','all inclusive','plage','forêt','plongée','snorkeling']::text[], -- tags
    ARRAY['Mohéli']::text[], -- islands
    ARRAY['Mohéli']::text[], -- locations
    '[]'::jsonb, -- options
    '[]'::jsonb, -- included
    '[]'::jsonb, -- excluded
    '[]'::jsonb, -- gallery
    'assets/activities/circuit-moheli-3-jours-2-nuits/cover.webp', -- cover_image_path
    'Plage et lagon de Mohéli', -- alt_text
    NULL, -- meeting_point
    NULL, -- minimum_age
    'moderate', -- physical_level
    NULL, -- cancellation_policy
    NULL, -- currency
    NULL, -- min_capacity
    NULL, -- max_capacity
    4320, -- duration_minutes
    false, -- booking_enabled
    true, -- featured
    17 -- sort_order
  )
ON CONFLICT (slug) WHERE slug IS NOT NULL DO NOTHING;
