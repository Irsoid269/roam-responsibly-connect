-- Restrict catalog INSERT to admins; add review moderation fields

-- Drop overly permissive INSERT policies on catalogue tables
DROP POLICY IF EXISTS "Authenticated users can create destinations" ON public.destinations;
DROP POLICY IF EXISTS "Authenticated users can create coworking spaces" ON public.coworking_spaces;
DROP POLICY IF EXISTS "Authenticated users can create accommodations" ON public.accommodations;
DROP POLICY IF EXISTS "Authenticated users can create mobility options" ON public.mobility_options;
DROP POLICY IF EXISTS "Authenticated users can create activities" ON public.activities;

-- Admin-only INSERT on catalogue
CREATE POLICY "Admins can create destinations"
ON public.destinations
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create coworking spaces"
ON public.coworking_spaces
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create accommodations"
ON public.accommodations
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create mobility options"
ON public.mobility_options
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create activities"
ON public.activities
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Review moderation
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES auth.users(id);

-- Public only sees approved reviews
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Approved reviews are viewable by everyone"
ON public.reviews
FOR SELECT
USING (
  status = 'approved'
  OR auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
);

-- Admins/moderators can update any review (moderation)
CREATE POLICY "Admins can update all reviews"
ON public.reviews
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
);

CREATE POLICY "Admins can delete all reviews"
ON public.reviews
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert carbon history on behalf of ops if needed (users already can insert own)
CREATE POLICY "Admins can view all carbon history"
ON public.carbon_footprint_history
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
