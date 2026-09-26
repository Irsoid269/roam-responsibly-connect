-- Suite à la demande de retirer la ville du nom de la destination : on ne
-- garde que l'île. NB : Moroni et Itsandra sont toutes les deux sur Grande
-- Comore, donc ces deux destinations porteront désormais le même nom
-- "Grande Comore" — elles restent deux fiches distinctes (coworkings,
-- hébergements, coordonnées différents), simplement affichées sous le même
-- nom d'île.
UPDATE public.destinations SET name = 'Grande Comore' WHERE city IN ('Moroni', 'Itsandra');
UPDATE public.destinations SET name = 'Anjouan' WHERE city = 'Mutsamudu';
UPDATE public.destinations SET name = 'Mohéli' WHERE city = 'Fomboni';
