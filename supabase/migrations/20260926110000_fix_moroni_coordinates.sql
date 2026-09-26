-- La migration précédente (20260926100000) a ajouté les colonnes
-- latitude/longitude mais n'avait pas repris la valeur pour Moroni (Comwork),
-- seules les 3 nouvelles destinations avaient leurs coordonnées via l'INSERT.
UPDATE public.destinations SET latitude = -11.7042, longitude = 43.2402
  WHERE city ILIKE 'Moroni%' AND latitude IS NULL;
