-- Contenu de démonstration pour le back-office — demandé explicitement par
-- l'équipe Amani : photos et prix FICTIFS, en attendant les vrais tarifs des
-- prestataires (VLC, DISCOVERMORES) pour les 16 activités du catalogue qui
-- n'en ont jamais eu (ni dans le cahier des charges, ni en base). Objectif :
-- que le site ne montre plus "Sur devis"/"Durée à venir" partout pendant que
-- la vraie donnée commerciale est collectée. À REMPLACER par les vrais
-- tarifs dès qu'ils sont disponibles — voir AdminActivities (back-office)
-- pour les modifier un par un.
--
-- Images : photos Unsplash libres de droit, choisies par thème (plongée,
-- dauphins, randonnée volcanique, cuisine locale, etc.), chacune vérifiée
-- manuellement (HTTP 200 + contenu visuel conforme) avant intégration.

-- ============================================================================
-- Activités : prix, durée, image (les 17 lignes du catalogue)
-- ============================================================================

UPDATE public.activities SET
  image_url = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
  price = 35, currency = 'EUR', duration_hours = 3
WHERE slug = 'saveurs-comoriennes-chez-habitant';

UPDATE public.activities SET
  image_url = 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80',
  price = 30, currency = 'EUR', duration_hours = 3
WHERE slug = 'paint-and-discover';

UPDATE public.activities SET
  image_url = 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&q=80',
  price = 25, currency = 'EUR', duration_hours = 2
WHERE slug = 'secrets-vanille';

UPDATE public.activities SET
  image_url = 'https://images.unsplash.com/photo-1601058268499-e52658b8bb88?w=800&q=80',
  price = 30, currency = 'EUR', duration_hours = 3
WHERE slug = 'initiation-menuiserie-comorienne';

UPDATE public.activities SET
  image_url = 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
  price = 55, currency = 'EUR', duration_hours = 6
WHERE slug = 'circuit-nord';

UPDATE public.activities SET
  image_url = 'https://images.unsplash.com/photo-1546484475-7f7bd55792da?w=800&q=80',
  price = 55, currency = 'EUR', duration_hours = 6
WHERE slug = 'circuit-sud';

UPDATE public.activities SET
  image_url = 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
  price = 65, currency = 'EUR', duration_hours = 3
WHERE slug = 'quad-nord';

-- Rando Karthala a déjà un vrai prix/durée (75€/10h) — on ajoute seulement l'image.
UPDATE public.activities SET
  image_url = 'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?w=800&q=80'
WHERE slug = 'rando-karthala';

UPDATE public.activities SET
  image_url = 'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?w=800&q=80',
  price = 70, currency = 'EUR', duration_hours = 4
WHERE slug = 'buggy-karthala-nord';

UPDATE public.activities SET
  image_url = 'https://images.unsplash.com/photo-1607153333879-c174d265f1d2?w=800&q=80',
  price = 45, currency = 'EUR', duration_hours = 3
WHERE slug = 'recherche-dauphins';

UPDATE public.activities SET
  image_url = 'https://images.unsplash.com/photo-1607153333879-c174d265f1d2?w=800&q=80',
  price = 90, currency = 'EUR', duration_hours = 8
WHERE slug = 'dauphins-circuit-nord';

UPDATE public.activities SET
  image_url = 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&q=80',
  price = 35, currency = 'EUR', duration_hours = 2
WHERE slug = 'randonnee-palmee-iconi';

UPDATE public.activities SET
  image_url = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
  price = 60, currency = 'EUR', duration_hours = 3
WHERE slug = 'plongee-sous-marine-bapteme';

UPDATE public.activities SET
  image_url = 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=800&q=80',
  price = 65, currency = 'EUR', duration_hours = 4
WHERE slug = 'geants-ocean';

UPDATE public.activities SET
  image_url = 'https://images.unsplash.com/photo-1516815231560-8f41ec531527?w=800&q=80',
  price = 30, currency = 'EUR', duration_hours = 3
WHERE slug = 'peche-traditionnelle';

UPDATE public.activities SET
  image_url = 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80',
  price = 60, currency = 'EUR', duration_hours = 14
WHERE slug = 'bivouac-nord';

UPDATE public.activities SET
  image_url = 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80',
  price = 380, currency = 'EUR', duration_hours = 72
WHERE slug = 'circuit-moheli-3-jours-2-nuits';

-- ============================================================================
-- Hébergements — table vide jusqu'ici, 4 hébergements fictifs rattachés à la
-- première destination existante (Comwork / Moroni).
-- ============================================================================

INSERT INTO public.accommodations
  (destination_id, name, type, description, image_url, price_per_night, amenities, rating, distance_to_center, carbon_score)
SELECT d.id, v.name, v.type, v.description, v.image_url, v.price_per_night, v.amenities, v.rating, v.distance_to_center, v.carbon_score
FROM (SELECT id FROM public.destinations ORDER BY created_at LIMIT 1) d
CROSS JOIN (VALUES
  ('Villa Ylang', 'eco-lodge', 'Villa éco-luxe avec piscine à débordement face à l''océan, matériaux locaux et énergie solaire.',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80', 90.00,
    ARRAY['Wifi', 'Climatisation', 'Piscine', 'Petit-déjeuner inclus'], 4.7, '2,5 km du centre', 'A'),
  ('Case Corail', 'apartment', 'Appartement lumineux dans une résidence avec piscine partagée, à deux pas de la plage.',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80', 55.00,
    ARRAY['Wifi', 'Cuisine équipée', 'Piscine'], 4.4, '1 km du centre', 'B'),
  ('Auberge du Volcan', 'hostel', 'Auberge conviviale en bois local, dortoirs et chambres privées, terrasse commune.',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', 25.00,
    ARRAY['Wifi', 'Cuisine partagée', 'Terrasse'], 4.2, '3 km du centre', 'B'),
  ('Résidence Baobab', 'coliving', 'Coliving pensé pour les télétravailleurs : bureaux partagés, wifi fibre, communauté internationale.',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', 40.00,
    ARRAY['Wifi fibre', 'Espace coworking', 'Buanderie'], 4.5, '1,5 km du centre', 'A')
) AS v(name, type, description, image_url, price_per_night, amenities, rating, distance_to_center, carbon_score)
WHERE d.id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.accommodations LIMIT 1);

-- ============================================================================
-- Mobilité douce — table vide jusqu'ici, 4 options fictives rattachées à la
-- même destination.
-- ============================================================================

INSERT INTO public.mobility_options
  (destination_id, name, type, description, image_url, price_per_hour, price_per_day, carbon_per_km)
SELECT d.id, v.name, v.type, v.description, v.image_url, v.price_per_hour, v.price_per_day, v.carbon_per_km
FROM (SELECT id FROM public.destinations ORDER BY created_at LIMIT 1) d
CROSS JOIN (VALUES
  ('Vélo électrique Amani', 'electric-bike', 'Vélo à assistance électrique, autonomie 50 km, idéal pour explorer la côte.',
    'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&q=80', 8.00, 30.00, 0.005),
  ('Trottinette électrique', 'electric-scooter', 'Trottinette électrique en libre-service, pratique pour les trajets courts en ville.',
    'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80', 5.00, 20.00, 0.007),
  ('Vélo classique', 'bicycle', 'Vélo tout terrain, sans émission, en location à la journée ou à l''heure.',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80', 4.00, 15.00, 0),
  ('Balade guidée à pied — Médina de Moroni', 'walking-tour', 'Visite guidée à pied de la médina et du front de mer avec un guide local.',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', 10.00, NULL, 0)
) AS v(name, type, description, image_url, price_per_hour, price_per_day, carbon_per_km)
WHERE d.id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.mobility_options LIMIT 1);
