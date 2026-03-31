-- Migration 007: Store original filename for duplicate detection

ALTER TABLE public.images ADD COLUMN original_filename TEXT;

-- Index for fast per-user duplicate lookups
CREATE INDEX idx_images_user_original_filename
  ON public.images(user_id, original_filename)
  WHERE original_filename IS NOT NULL;
