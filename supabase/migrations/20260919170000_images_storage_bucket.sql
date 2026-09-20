-- The "images" bucket + policies were defined in migration 20260126072504 but were
-- never applied to this project (confirmed missing via the Storage API on 2026-09-19).
-- Recreated here, idempotently, since ImageUpload.tsx (AdminActivities, AdminDestinations,
-- and any future admin screen reusing it) uploads to bucket "images" and fails without it.

INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Images are publicly accessible" ON storage.objects;
CREATE POLICY "Images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update their images" ON storage.objects;
CREATE POLICY "Authenticated users can update their images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can delete images" ON storage.objects;
CREATE POLICY "Admins can delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'images' AND public.has_role(auth.uid(), 'admin'));
