-- Les Comores comptent 3 îles principales : Grande Comore (Ngazidja),
-- Anjouan (Nzwani) et Mohéli (Mwali). Les 4 destinations existantes gardent
-- leurs données (coworkings, hébergements, coordonnées) mais sont renommées
-- pour que l'île soit immédiatement visible, plutôt que le seul nom de la
-- ville ou d'un lodge fictif.
UPDATE public.destinations SET name = 'Grande Comore — Moroni' WHERE city = 'Moroni';
UPDATE public.destinations SET name = 'Grande Comore — Itsandra' WHERE city = 'Itsandra';
UPDATE public.destinations SET name = 'Anjouan — Mutsamudu' WHERE city = 'Mutsamudu';
UPDATE public.destinations SET name = 'Mohéli — Fomboni' WHERE city = 'Fomboni';
