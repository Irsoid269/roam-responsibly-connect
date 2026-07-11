-- Control which destinations appear in the homepage "Où allez-vous travailler ?" grid

ALTER TABLE public.destinations
  ADD COLUMN IF NOT EXISTS show_on_home BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN public.destinations.show_on_home IS
  'When true, destination appears in the homepage destinations cards section (admin-managed).';
