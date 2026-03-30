-- Migration 003: Storage buckets

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Storage policies: user-scoped paths
-- Path pattern: {user_id}/originals/{filename} and {user_id}/thumbnails/{filename}

CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
