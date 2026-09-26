-- Une seule destination existait en base (Moroni) alors que le catalogue
-- d'activités couvre déjà plusieurs îles (Ngazidja, Anjouan, Mohéli — cf.
-- circuit-moheli-3-jours-2-nuits) et que la migration 20260924120000 avait
-- anticipé des coordonnées pour Itsandra/Mutsamudu/Fomboni sans qu'aucune de
-- ces destinations n'existe jamais réellement. Suite explicite à la demande
-- "continue sur les coworkings et hébergements manquants" : ajout de 3
-- destinations (une par île restante) + coworkings et hébergements FICTIFS
-- pour chacune, même principe que la migration 20260925100000 (à remplacer
-- par les vraies données commerciales).
--
-- On corrige aussi deux données trouvées incohérentes en vérifiant : les 3
-- coworkings de Moroni avaient `amenities = []` (jamais renseigné), et
-- Comwork affichait `coworking_count = 100` alors qu'il n'y a que 3 vrais
-- espaces enregistrés.
--
-- NB : la migration 20260924120000_destinations_coordinates.sql, qui ajoute
-- latitude/longitude, n'a en réalité jamais été exécutée (confirmée à tort
-- à l'époque) — on la rejoue ici en IF NOT EXISTS pour ne plus en dépendre.

ALTER TABLE public.destinations
  ADD COLUMN IF NOT EXISTS latitude numeric(9,6),
  ADD COLUMN IF NOT EXISTS longitude numeric(9,6);

-- ============================================================================
-- Nouvelles destinations
-- ============================================================================

INSERT INTO public.destinations
  (name, country, city, description, image_url, carbon_score, rating, highlight, avg_price_per_day, wifi_speed, coworking_count, show_in_hero, show_on_home, latitude, longitude)
SELECT v.name, v.country, v.city, v.description, v.image_url, v.carbon_score, v.rating, v.highlight, v.avg_price_per_day, v.wifi_speed, v.coworking_count, v.show_in_hero, v.show_on_home, v.latitude, v.longitude
FROM (VALUES
  ('Itsandra Beach', 'Comores', 'Itsandra',
   'Plages de sable blanc et ruines du sultanat, à quelques minutes de Moroni.',
   'https://images.unsplash.com/photo-1587922546307-776227941871?w=1200&q=80',
   'B', 4.3, 'Plages et ruines du sultanat', 25.00, 80, 2, true, true, -11.5333, 43.3333),
  ('Mutsamudu Lodge', 'Comores', 'Mutsamudu',
   'L''île aux parfums : ylang-ylang, cascades et le vieux quartier historique d''Anjouan.',
   'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80',
   'A', 4.4, 'L''île aux parfums', 22.00, 60, 2, true, true, -12.1667, 44.4000),
  ('Fomboni Nature', 'Comores', 'Fomboni',
   'Porte d''entrée du parc marin de Mohéli : tortues, dauphins et forêt tropicale préservée.',
   'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200&q=80',
   'A', 4.6, 'Parc marin & réserve naturelle', 28.00, 50, 2, true, true, -12.3081, 43.7425)
) AS v(name, country, city, description, image_url, carbon_score, rating, highlight, avg_price_per_day, wifi_speed, coworking_count, show_in_hero, show_on_home, latitude, longitude)
WHERE NOT EXISTS (SELECT 1 FROM public.destinations d WHERE d.city = v.city);

-- ============================================================================
-- Espaces de coworking — 2 par nouvelle destination
-- ============================================================================

INSERT INTO public.coworking_spaces
  (destination_id, name, address, description, image_url, price_per_hour, price_per_day, price_per_month, amenities, rating, wifi_speed, opening_hours, carbon_score)
SELECT d.id, v.name, v.address, v.description, v.image_url, v.price_per_hour, v.price_per_day, v.price_per_month, v.amenities, v.rating, v.wifi_speed, v.opening_hours, v.carbon_score
FROM public.destinations d
JOIN (VALUES
  ('Itsandra', 'Le Phare Coworking', 'Itsandra, Comores', 'Grand open space lumineux face a la plage.',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', 5.00, 18.00, 450.00,
    ARRAY['Wifi', 'Climatisation', 'Cafe/The'], 4.4, 80, '8h - 20h', 'B'),
  ('Itsandra', 'Atelier Sultan', 'Itsandra, Comores', 'Loft industriel avec salle de reunion privee.',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80', 6.00, 25.00, 600.00,
    ARRAY['Wifi', 'Salle de reunion', 'Cafe/The'], 4.5, 80, '8h - 20h', 'B'),
  ('Mutsamudu', 'Bureau Parfum', 'Mutsamudu, Comores', 'Espace de travail calme entoure de plantes.',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80', 5.00, 20.00, 500.00,
    ARRAY['Wifi', 'Climatisation'], 4.4, 60, '8h - 19h', 'A'),
  ('Mutsamudu', 'Hub Anjouan', 'Mutsamudu, Comores', 'Postes individuels equipes, vue sur la ville.',
    'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&q=80', 6.00, 22.00, 550.00,
    ARRAY['Wifi', 'Climatisation', 'Imprimante'], 4.3, 60, '8h - 19h', 'A'),
  ('Fomboni', 'Coworking Lagon', 'Fomboni, Comores', 'Tables partagees dans un cadre naturel apaisant.',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80', 5.00, 20.00, 480.00,
    ARRAY['Wifi', 'Cafe/The', 'Terrasse'], 4.6, 50, '8h - 18h', 'A'),
  ('Fomboni', 'Espace Tortue', 'Fomboni, Comores', 'Petit espace cosy pour indépendants et petites équipes.',
    'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=800&q=80', 4.00, 18.00, 420.00,
    ARRAY['Wifi', 'Terrasse'], 4.5, 50, '8h - 18h', 'A')
) AS v(city, name, address, description, image_url, price_per_hour, price_per_day, price_per_month, amenities, rating, wifi_speed, opening_hours, carbon_score)
  ON d.city = v.city
WHERE NOT EXISTS (SELECT 1 FROM public.coworking_spaces cs WHERE cs.name = v.name);

-- ============================================================================
-- Hébergements — 2 par nouvelle destination
-- ============================================================================

INSERT INTO public.accommodations
  (destination_id, name, type, description, image_url, price_per_night, amenities, rating, distance_to_center, carbon_score)
SELECT d.id, v.name, v.type, v.description, v.image_url, v.price_per_night, v.amenities, v.rating, v.distance_to_center, v.carbon_score
FROM public.destinations d
JOIN (VALUES
  ('Itsandra', 'Villa Sultan', 'eco-lodge', 'Villa contemporaine avec jardin tropical, a deux pas de la plage.',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', 85.00,
    ARRAY['Wifi', 'Climatisation', 'Jardin'], 4.6, '0,5 km', 'B'),
  ('Itsandra', 'Bungalow Itsandra', 'apartment', 'Bungalow simple et lumineux, ideal pour un sejour au calme.',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', 50.00,
    ARRAY['Wifi', 'Cuisine equipee'], 4.3, '1 km', 'B'),
  ('Mutsamudu', 'Maison des Epices', 'hotel', 'Hotel de charme pres du vieux quartier, piscine et terrasse.',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80', 70.00,
    ARRAY['Wifi', 'Piscine', 'Petit-dejeuner inclus'], 4.5, '0,8 km', 'A'),
  ('Mutsamudu', 'Gite Anjouanais', 'hostel', 'Gite convivial en bois local, ideal petits budgets.',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', 28.00,
    ARRAY['Wifi', 'Cuisine partagee'], 4.2, '2 km', 'A'),
  ('Fomboni', 'Cabane Nature Moheli', 'eco-lodge', 'Cabane perchee en pleine foret, immersion totale dans la nature.',
    'https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb?w=800&q=80', 95.00,
    ARRAY['Wifi', 'Petit-dejeuner inclus'], 4.8, '4 km', 'A'),
  ('Fomboni', 'Lodge du Parc Marin', 'eco-lodge', 'Bungalow sur pilotis face au lagon, acces direct au parc marin.',
    'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80', 110.00,
    ARRAY['Wifi', 'Piscine', 'Petit-dejeuner inclus'], 4.7, '1 km', 'A')
) AS v(city, name, type, description, image_url, price_per_night, amenities, rating, distance_to_center, carbon_score)
  ON d.city = v.city
WHERE NOT EXISTS (SELECT 1 FROM public.accommodations a WHERE a.name = v.name);

-- ============================================================================
-- Corrections sur les données existantes (Moroni)
-- ============================================================================

UPDATE public.coworking_spaces
SET amenities = ARRAY['Wifi', 'Climatisation', 'Salle de reunion']
WHERE amenities = '{}' OR amenities IS NULL;

UPDATE public.destinations d
SET coworking_count = (SELECT COUNT(*) FROM public.coworking_spaces cs WHERE cs.destination_id = d.id);
