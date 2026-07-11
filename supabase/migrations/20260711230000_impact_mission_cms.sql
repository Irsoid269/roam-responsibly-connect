-- CMS for Mission, Carbon calculator page, Partners, Impact report
-- Safe to re-run (IF NOT EXISTS + DROP POLICY IF EXISTS)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.cms_page_heroes (
  page_key TEXT PRIMARY KEY CHECK (page_key IN ('mission', 'carbon', 'partners', 'impact_report')),
  badge_text TEXT,
  title TEXT NOT NULL,
  title_highlight TEXT,
  description TEXT,
  cta_label TEXT,
  cta_url TEXT,
  pdf_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_stat_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL CHECK (page_key IN ('mission', 'carbon', 'partners', 'impact_report')),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  change_label TEXT,
  icon_key TEXT NOT NULL DEFAULT 'leaf',
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mission_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon_key TEXT NOT NULL DEFAULT 'leaf',
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mission_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year TEXT NOT NULL,
  event TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mission_team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  bio TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.partner_orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('carbon', 'accommodation', 'coworking')),
  name TEXT NOT NULL,
  type TEXT,
  location TEXT,
  description TEXT,
  impact_label TEXT,
  progress INTEGER DEFAULT 0,
  image_url TEXT,
  certified BOOLEAN NOT NULL DEFAULT false,
  certifications TEXT[] NOT NULL DEFAULT '{}',
  specialty TEXT,
  locations_count INTEGER DEFAULT 1,
  website_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.impact_breakdown (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  percentage INTEGER NOT NULL DEFAULT 0,
  amount TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.impact_quarters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quarter TEXT NOT NULL,
  travelers INTEGER NOT NULL DEFAULT 0,
  carbon INTEGER NOT NULL DEFAULT 0,
  revenue INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_info_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL DEFAULT 'carbon',
  title TEXT NOT NULL,
  description TEXT,
  icon_key TEXT NOT NULL DEFAULT 'leaf',
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cms_page_heroes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_stat_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_breakdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_quarters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_info_cards ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'cms_page_heroes', 'cms_stat_cards', 'mission_values', 'mission_milestones',
    'mission_team', 'partner_orgs', 'impact_breakdown', 'impact_quarters', 'cms_info_cards'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public read %1$s" ON public.%1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins insert %1$s" ON public.%1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins update %1$s" ON public.%1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins delete %1$s" ON public.%1$s', t);

    EXECUTE format(
      'CREATE POLICY "Public read %1$s" ON public.%1$s FOR SELECT USING (true)',
      t
    );
    EXECUTE format(
      'CREATE POLICY "Admins insert %1$s" ON public.%1$s FOR INSERT WITH CHECK (public.has_role(auth.uid(), ''admin''))',
      t
    );
    EXECUTE format(
      'CREATE POLICY "Admins update %1$s" ON public.%1$s FOR UPDATE USING (public.has_role(auth.uid(), ''admin''))',
      t
    );
    EXECUTE format(
      'CREATE POLICY "Admins delete %1$s" ON public.%1$s FOR DELETE USING (public.has_role(auth.uid(), ''admin''))',
      t
    );
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Public read cms_stat_cards" ON public.cms_stat_cards;
CREATE POLICY "Public read cms_stat_cards" ON public.cms_stat_cards
FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public read mission_values" ON public.mission_values;
CREATE POLICY "Public read mission_values" ON public.mission_values
FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public read mission_milestones" ON public.mission_milestones;
CREATE POLICY "Public read mission_milestones" ON public.mission_milestones
FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public read mission_team" ON public.mission_team;
CREATE POLICY "Public read mission_team" ON public.mission_team
FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public read partner_orgs" ON public.partner_orgs;
CREATE POLICY "Public read partner_orgs" ON public.partner_orgs
FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public read impact_breakdown" ON public.impact_breakdown;
CREATE POLICY "Public read impact_breakdown" ON public.impact_breakdown
FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public read impact_quarters" ON public.impact_quarters;
CREATE POLICY "Public read impact_quarters" ON public.impact_quarters
FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public read cms_info_cards" ON public.cms_info_cards;
CREATE POLICY "Public read cms_info_cards" ON public.cms_info_cards
FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));

INSERT INTO public.cms_page_heroes (page_key, badge_text, title, title_highlight, description, cta_label, cta_url, pdf_url)
VALUES
  ('mission', NULL, 'Réinventer le voyage', 'pour la planète',
   'Notre mission : permettre à chacun de travailler et voyager librement, tout en contribuant positivement à l''environnement et aux communautés locales.',
   'Rejoindre Amani', '/signup', NULL),
  ('carbon', 'Impact environnemental', 'Calculez votre', 'empreinte carbone',
   'Estimez l''impact environnemental de votre prochain séjour en quelques clics. Comprenez, réduisez et compensez vos émissions.',
   NULL, NULL, NULL),
  ('partners', 'Partenariats vérifiés', 'Nos partenaires', NULL,
   'Nous collaborons avec des organisations certifiées pour garantir l''impact positif de vos contributions et la qualité de vos séjours.',
   'Devenir partenaire', '/become-partner', NULL),
  ('impact_report', 'Rapport annuel', 'Rapport d''Impact 2025', NULL,
   'Transparence totale sur notre impact environnemental et social. Découvrez comment votre communauté contribue à un tourisme plus durable.',
   'Télécharger le PDF complet', NULL, '#')
ON CONFLICT (page_key) DO NOTHING;

INSERT INTO public.cms_stat_cards (page_key, label, value, change_label, icon_key, sort_order)
SELECT * FROM (VALUES
  ('carbon', 'Tonnes mesurées', '45,000+', NULL, 'leaf', 1),
  ('carbon', 'Tonnes compensées', '12,500+', NULL, 'trending', 2),
  ('carbon', 'Voyageurs engagés', '2,800+', NULL, 'users', 3),
  ('carbon', 'Actions réalisées', '85+', NULL, 'award', 4),
  ('impact_report', 'CO₂ compensé', '45,280 kg', '+156%', 'tree', 1),
  ('impact_report', 'Voyageurs actifs', '2,854', '+89%', 'users', 2),
  ('impact_report', 'Destinations', '38', '+15', 'globe', 3),
  ('impact_report', 'Projets soutenus', '12', '+4', 'trending', 4)
) AS v(page_key, label, value, change_label, icon_key, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.cms_stat_cards LIMIT 1);

INSERT INTO public.mission_values (icon_key, title, description, sort_order)
SELECT * FROM (VALUES
  ('leaf', 'Durabilité', 'Chaque décision est guidée par son impact environnemental. Nous privilégions systématiquement les solutions les plus écologiques.', 1),
  ('heart', 'Authenticité', 'Nous favorisons les expériences locales authentiques et le soutien aux communautés qui nous accueillent.', 2),
  ('users', 'Communauté', 'Nous croyons en la force du collectif. Ensemble, nous avons un impact bien plus grand.', 3),
  ('target', 'Transparence', 'Nos méthodes de calcul sont ouvertes, nos partenaires sont vérifiés, nos actions sont traçables.', 4)
) AS v(icon_key, title, description, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.mission_values LIMIT 1);

INSERT INTO public.mission_milestones (year, event, description, sort_order)
SELECT * FROM (VALUES
  ('2024', 'Création d''Amani Resorts', 'Lancement de la plateforme avec 3 îles pilotes aux Comores', 1),
  ('2024', 'Premier partenariat carbone', 'Collaboration avec une ONG de conservation marine à Mohéli', 2),
  ('2025', '1000 voyageurs', 'Cap symbolique franchi avec une communauté engagée', 3),
  ('2025', 'Certification B Corp', 'Reconnaissance de notre engagement social et environnemental', 4),
  ('2026', 'Expansion archipel', 'Ouverture de nouvelles destinations : Domoni, Iconi et lodges partenaires', 5)
) AS v(year, event, description, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.mission_milestones LIMIT 1);

INSERT INTO public.mission_team (name, role, bio, sort_order)
SELECT * FROM (VALUES
  ('Antoine Durand', 'CEO & Co-fondateur', 'Ancien consultant McKinsey, passionné de voyage responsable', 1),
  ('Léa Martin', 'CTO & Co-fondatrice', 'Ex-ingénieure Google, spécialiste des technologies durables', 2),
  ('Pierre Leclerc', 'Head of Impact', 'Docteur en sciences environnementales, expert carbone', 3),
  ('Julie Rousseau', 'Head of Community', '10 ans d''expérience en community building', 4)
) AS v(name, role, bio, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.mission_team LIMIT 1);

INSERT INTO public.partner_orgs (category, name, type, location, description, impact_label, progress, image_url, certified, certifications, specialty, locations_count, sort_order)
SELECT * FROM (VALUES
  ('carbon', 'Reforestation Karthala', 'Reforestation', 'Grande Comore',
   'Projet de reforestation autour du volcan Karthala avec des espèces natives.',
   '10,000 arbres plantés', 78,
   'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
   true, '{}'::text[], NULL, 1, 1),
  ('carbon', 'Protection mangroves Mohéli', 'Conservation', 'Mohéli, Comores',
   'Protection et restauration des écosystèmes de mangroves.',
   '500 hectares protégés', 92,
   'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=800',
   true, '{}'::text[], NULL, 1, 2),
  ('carbon', 'Solaire villages Anjouan', 'Énergie renouvelable', 'Anjouan, Comores',
   'Installation de panneaux solaires dans des villages ruraux.',
   '25 villages équipés', 45,
   'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
   true, '{}'::text[], NULL, 1, 3),
  ('accommodation', 'Amani Eco Lodges', NULL, 'Comores', NULL, NULL, 0, NULL, true,
   ARRAY['Green Key', 'GSTC']::text[], NULL, 1, 10),
  ('accommodation', 'Lodge Karthala Itsandra', NULL, 'Grande Comore', NULL, NULL, 0, NULL, true,
   ARRAY['Green Globe', 'GSTC']::text[], NULL, 1, 11),
  ('coworking', 'Cowork Moroni Hub', NULL, 'Moroni', NULL, NULL, 0, NULL, false,
   '{}'::text[], 'Innovation sociale', 1, 20),
  ('coworking', 'Itsandra Digital Lab', NULL, 'Itsandra', NULL, NULL, 0, NULL, false,
   '{}'::text[], 'Coliving & Coworking', 1, 21)
) AS v(category, name, type, location, description, impact_label, progress, image_url, certified, certifications, specialty, locations_count, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.partner_orgs LIMIT 1);

INSERT INTO public.impact_breakdown (category, percentage, amount, sort_order)
SELECT * FROM (VALUES
  ('Reforestation', 45, '20,376 kg', 1),
  ('Énergie renouvelable', 30, '13,584 kg', 2),
  ('Conservation marine', 15, '6,792 kg', 3),
  ('Agriculture durable', 10, '4,528 kg', 4)
) AS v(category, percentage, amount, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.impact_breakdown LIMIT 1);

INSERT INTO public.impact_quarters (quarter, travelers, carbon, revenue, sort_order)
SELECT * FROM (VALUES
  ('Q1 2025', 450, 8500, 125000, 1),
  ('Q2 2025', 680, 12200, 198000, 2),
  ('Q3 2025', 820, 14800, 267000, 3),
  ('Q4 2025', 904, 9780, 310000, 4)
) AS v(quarter, travelers, carbon, revenue, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.impact_quarters LIMIT 1);

INSERT INTO public.cms_info_cards (page_key, title, description, icon_key, sort_order)
SELECT * FROM (VALUES
  ('carbon', 'Méthodologie transparente', 'Nos facteurs d''émission sont basés sur les données de l''ADEME et régulièrement mis à jour.', 'leaf', 1),
  ('carbon', 'Compensation certifiée', 'Nos partenaires sont certifiés et vos dons sont 100% traçables avec reçu fiscal.', 'trending', 2),
  ('carbon', 'Actions concrètes', 'Au-delà de la compensation, nous agissons pour réduire l''impact à la source.', 'award', 3)
) AS v(page_key, title, description, icon_key, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.cms_info_cards LIMIT 1);
