-- Cahier §7.9 / US-19 : un avis est marqué "vérifié" quand son auteur a
-- effectivement complété un séjour pour l'entité notée. Calculé côté
-- serveur (trigger BEFORE INSERT, SECURITY DEFINER) pour qu'un client ne
-- puisse jamais se déclarer "vérifié" lui-même — la valeur envoyée par le
-- client pour cette colonne, s'il y en avait une, serait de toute façon
-- écrasée avant l'insertion.
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.set_review_verified()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.verified := EXISTS (
    SELECT 1
    FROM public.reservations r
    JOIN public.reservation_items ri ON ri.reservation_id = r.id
    WHERE r.user_id = NEW.user_id
      AND r.status = 'completed'
      AND ri.item_type = NEW.target_type
      AND ri.item_id = NEW.target_id
  );
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.set_review_verified() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_set_review_verified ON public.reviews;
CREATE TRIGGER trg_set_review_verified
BEFORE INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.set_review_verified();

-- Cahier §7.9 : tags par destination sur les récits communautaires.
ALTER TABLE public.community_stories
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

-- Cahier §7.9 : preuve optionnelle jointe à un signalement.
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS evidence_url text;
