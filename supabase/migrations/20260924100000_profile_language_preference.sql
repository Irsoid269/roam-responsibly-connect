-- Cahier §7.11 : la langue d'interface doit être "persistée dans le profil",
-- pas seulement dans le stockage local du navigateur (qui se perd en
-- changeant d'appareil). Colonne libre en texte plutôt qu'un enum Postgres :
-- la liste des langues supportées est un détail d'UI (src/i18n.ts), pas une
-- contrainte qui doit nécessiter une migration si elle change.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'fr'
    CHECK (language IN ('fr', 'en', 'zdj'));
