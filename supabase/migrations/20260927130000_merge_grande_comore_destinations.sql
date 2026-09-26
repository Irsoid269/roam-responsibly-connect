-- Suite au constat en production : Moroni et Itsandra portent maintenant
-- toutes les deux le nom "Grande Comore" (résultat attendu et annoncé de la
-- migration précédente), ce qui affiche deux fiches identiques dans les
-- listes. Fusion en une seule destination "Grande Comore" : on garde la
-- fiche Moroni (photo réelle déjà uploadée, capitale) et on lui rattache
-- les coworkings/hébergements d'Itsandra avant de supprimer sa fiche.

DO $$
DECLARE
  v_moroni_id uuid;
  v_itsandra_id uuid;
BEGIN
  SELECT id INTO v_moroni_id FROM public.destinations WHERE city = 'Moroni' LIMIT 1;
  SELECT id INTO v_itsandra_id FROM public.destinations WHERE city = 'Itsandra' LIMIT 1;

  IF v_moroni_id IS NOT NULL AND v_itsandra_id IS NOT NULL THEN
    UPDATE public.coworking_spaces SET destination_id = v_moroni_id WHERE destination_id = v_itsandra_id;
    UPDATE public.accommodations SET destination_id = v_moroni_id WHERE destination_id = v_itsandra_id;
    DELETE FROM public.destinations WHERE id = v_itsandra_id;
  END IF;
END $$;

UPDATE public.destinations d
SET coworking_count = (SELECT COUNT(*) FROM public.coworking_spaces cs WHERE cs.destination_id = d.id);
