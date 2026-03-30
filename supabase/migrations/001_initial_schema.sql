-- Migration 001: Core schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Images table
CREATE TABLE public.images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_path TEXT NOT NULL,
  thumbnail_path TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type VARCHAR(50) NOT NULL DEFAULT 'image/jpeg',
  width INTEGER,
  height INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Image metadata (AI analysis results)
CREATE TABLE public.image_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_id UUID REFERENCES public.images(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  ai_processing_status VARCHAR(20) DEFAULT 'pending' NOT NULL
    CHECK (ai_processing_status IN ('pending', 'processing', 'complete', 'failed')),
  ai_error_message TEXT,
  model_used VARCHAR(50),
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Full-text search index
CREATE INDEX idx_metadata_fts ON public.image_metadata
  USING GIN(to_tsvector('english', COALESCE(description, '') || ' ' || array_to_string(tags, ' ')));

-- Performance indexes
CREATE INDEX idx_images_user_id ON public.images(user_id);
CREATE INDEX idx_images_uploaded_at ON public.images(uploaded_at DESC);
CREATE INDEX idx_metadata_image_id ON public.image_metadata(image_id);
CREATE INDEX idx_metadata_user_id ON public.image_metadata(user_id);
CREATE INDEX idx_metadata_status ON public.image_metadata(ai_processing_status);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER images_updated_at
  BEFORE UPDATE ON public.images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER metadata_updated_at
  BEFORE UPDATE ON public.image_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
