-- Cahier §7.2 : "Affichage carte + liste synchronisée" — nécessite des
-- coordonnées sur les destinations. Nullable : une destination sans
-- coordonnées reste utilisable partout ailleurs, elle est simplement
-- omise de la vue carte plutôt que de bloquer sa création.
ALTER TABLE public.destinations
  ADD COLUMN IF NOT EXISTS latitude numeric(9,6),
  ADD COLUMN IF NOT EXISTS longitude numeric(9,6);

-- Best-effort pour les données déjà en place : quelques centres connus des
-- Comores, approximatifs, à corriger depuis l'admin si besoin.
UPDATE public.destinations SET latitude = -11.7042, longitude = 43.2402
  WHERE city ILIKE 'Moroni%' AND latitude IS NULL;
UPDATE public.destinations SET latitude = -11.5333, longitude = 43.3333
  WHERE city ILIKE '%Itsandra%' AND latitude IS NULL;
UPDATE public.destinations SET latitude = -12.1667, longitude = 44.4000
  WHERE city ILIKE '%Mutsamudu%' AND latitude IS NULL;
UPDATE public.destinations SET latitude = -12.3081, longitude = 43.7425
  WHERE city ILIKE '%Fomboni%' AND latitude IS NULL;
