-- Trouvé en testant le site : le bloc d'appel à l'action de l'accueil
-- (contenu admin réel, pas une valeur par défaut) annonce "plus de 12 000
-- professionnels" alors que le compteur réel juste au-dessus de la page
-- affiche 6-7 voyageurs. Retrait du chiffre inventé.
UPDATE public.homepage_cta
SET description = 'Rejoignez une communauté grandissante de professionnels qui ont choisi de travailler autrement, en harmonie avec la planète.'
WHERE description LIKE '%12 000%';
