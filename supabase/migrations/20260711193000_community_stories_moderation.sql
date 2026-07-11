-- Community stories: client submits, admin approves before public display

CREATE TABLE IF NOT EXISTS public.community_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  author_location TEXT,
  destination TEXT NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 20 AND 1000),
  image_url TEXT,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  moderated_at TIMESTAMP WITH TIME ZONE,
  moderated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS community_stories_status_idx
  ON public.community_stories (status, created_at DESC);

ALTER TABLE public.community_stories ENABLE ROW LEVEL SECURITY;

-- Public sees only approved stories
CREATE POLICY "Approved community stories are public"
ON public.community_stories
FOR SELECT
USING (
  status = 'approved'
  OR auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
);

-- Authenticated clients can submit (always pending)
CREATE POLICY "Users can create their own community stories"
ON public.community_stories
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'
);

-- Authors can update their pending stories
CREATE POLICY "Users can update their pending stories"
ON public.community_stories
FOR UPDATE
USING (
  auth.uid() = user_id
  AND status = 'pending'
);

-- Admins / moderators can moderate any story
CREATE POLICY "Admins can update all community stories"
ON public.community_stories
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
);

CREATE POLICY "Admins can delete community stories"
ON public.community_stories
FOR DELETE
USING (
  public.has_role(auth.uid(), 'admin')
  OR (auth.uid() = user_id AND status = 'pending')
);
