-- Migration 002: Row Level Security

ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_metadata ENABLE ROW LEVEL SECURITY;

-- Images: users can only CRUD their own
CREATE POLICY "Users can view own images"
  ON public.images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images"
  ON public.images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own images"
  ON public.images FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own images"
  ON public.images FOR DELETE
  USING (auth.uid() = user_id);

-- Metadata: same isolation
CREATE POLICY "Users can view own metadata"
  ON public.image_metadata FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metadata"
  ON public.image_metadata FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own metadata"
  ON public.image_metadata FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own metadata"
  ON public.image_metadata FOR DELETE
  USING (auth.uid() = user_id);
