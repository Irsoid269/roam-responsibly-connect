-- Control which destinations appear in the homepage hero search

ALTER TABLE public.destinations
  ADD COLUMN IF NOT EXISTS show_in_hero BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN public.destinations.show_in_hero IS
  'When true, destination appears in the homepage hero search dropdown (admin-managed).';
