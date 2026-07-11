-- Likes ("J'adore") + commentaires on community stories

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.community_story_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.community_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (story_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.community_story_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.community_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS community_story_likes_story_idx
  ON public.community_story_likes (story_id);
CREATE INDEX IF NOT EXISTS community_story_comments_story_idx
  ON public.community_story_comments (story_id, created_at DESC);

ALTER TABLE public.community_story_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_story_comments ENABLE ROW LEVEL SECURITY;

-- Likes: anyone can see; auth users toggle their own
DROP POLICY IF EXISTS "Anyone can read story likes" ON public.community_story_likes;
CREATE POLICY "Anyone can read story likes"
ON public.community_story_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can like stories" ON public.community_story_likes;
CREATE POLICY "Users can like stories"
ON public.community_story_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike stories" ON public.community_story_likes;
CREATE POLICY "Users can unlike stories"
ON public.community_story_likes FOR DELETE
USING (auth.uid() = user_id);

-- Comments: public read; auth users post/delete own
DROP POLICY IF EXISTS "Anyone can read story comments" ON public.community_story_comments;
CREATE POLICY "Anyone can read story comments"
ON public.community_story_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can comment on stories" ON public.community_story_comments;
CREATE POLICY "Users can comment on stories"
ON public.community_story_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.community_story_comments;
CREATE POLICY "Users can delete own comments"
ON public.community_story_comments FOR DELETE
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin')
);

-- Keep denormalized counters in sync
CREATE OR REPLACE FUNCTION public.sync_story_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_stories
    SET likes_count = (
      SELECT COUNT(*)::int FROM public.community_story_likes WHERE story_id = NEW.story_id
    ),
    updated_at = now()
    WHERE id = NEW.story_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_stories
    SET likes_count = (
      SELECT COUNT(*)::int FROM public.community_story_likes WHERE story_id = OLD.story_id
    ),
    updated_at = now()
    WHERE id = OLD.story_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_story_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_stories
    SET comments_count = (
      SELECT COUNT(*)::int FROM public.community_story_comments WHERE story_id = NEW.story_id
    ),
    updated_at = now()
    WHERE id = NEW.story_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_stories
    SET comments_count = (
      SELECT COUNT(*)::int FROM public.community_story_comments WHERE story_id = OLD.story_id
    ),
    updated_at = now()
    WHERE id = OLD.story_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_story_likes ON public.community_story_likes;
CREATE TRIGGER trg_sync_story_likes
AFTER INSERT OR DELETE ON public.community_story_likes
FOR EACH ROW EXECUTE FUNCTION public.sync_story_likes_count();

DROP TRIGGER IF EXISTS trg_sync_story_comments ON public.community_story_comments;
CREATE TRIGGER trg_sync_story_comments
AFTER INSERT OR DELETE ON public.community_story_comments
FOR EACH ROW EXECUTE FUNCTION public.sync_story_comments_count();
