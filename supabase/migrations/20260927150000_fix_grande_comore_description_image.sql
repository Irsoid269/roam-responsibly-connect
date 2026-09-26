-- Trouvé en testant le site comme un visiteur : la destination "Grande
-- Comore" affichait encore la description et la photo de l'ancienne fiche
-- "Comwork" (un seul coworking), devenues incohérentes depuis la fusion
-- Moroni + Itsandra en une destination-île. La photo (1587922546307) est
-- celle prévue pour Itsandra avant sa fusion — réutilisée ici, elle
-- convient tout autant à Grande Comore dans son ensemble.
UPDATE public.destinations SET
  description = 'La plus grande île des Comores : plages de sable blanc, volcan Karthala, marché animé de Moroni et espaces de coworking en centre-ville.',
  image_url = 'https://images.unsplash.com/photo-1587922546307-776227941871?w=1200&q=80'
WHERE name = 'Grande Comore';
