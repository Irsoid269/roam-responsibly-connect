-- AccommodationsPage.tsx affiche déjà "{distance_to_center} du centre" —
-- la seed 20260925100000 avait mis "du centre" DANS la valeur, causant un
-- doublon visuel ("2,5 km du centre du centre"). Correction : ne garder que
-- la distance dans la colonne.

UPDATE public.accommodations SET distance_to_center = '2,5 km' WHERE name = 'Villa Ylang';
UPDATE public.accommodations SET distance_to_center = '1 km' WHERE name = 'Case Corail';
UPDATE public.accommodations SET distance_to_center = '3 km' WHERE name = 'Auberge du Volcan';
UPDATE public.accommodations SET distance_to_center = '1,5 km' WHERE name LIKE '%sidence Baobab%' OR name = 'Résidence Baobab';
