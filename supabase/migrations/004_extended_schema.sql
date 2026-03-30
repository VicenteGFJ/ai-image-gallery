-- Migration 004: Extended schema for future features
-- These tables are created now to ensure forward compatibility.
-- They are NOT used in Waves 1-3.

-- User profiles (future: display name, avatar, usage tracking)
CREATE TABLE public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  storage_used_bytes BIGINT DEFAULT 0,
  storage_limit_bytes BIGINT DEFAULT 1073741824,
  total_images INTEGER DEFAULT 0,
  total_ai_analyses INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Albums / folders (future: organize images)
CREATE TABLE public.albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image_id UUID REFERENCES public.images(id) ON DELETE SET NULL,
  image_count INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Album-image junction (future: many-to-many)
CREATE TABLE public.album_images (
  album_id UUID REFERENCES public.albums(id) ON DELETE CASCADE NOT NULL,
  image_id UUID REFERENCES public.images(id) ON DELETE CASCADE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (album_id, image_id)
);

-- EXIF metadata (future: camera data, GPS)
CREATE TABLE public.image_exif (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_id UUID REFERENCES public.images(id) ON DELETE CASCADE NOT NULL UNIQUE,
  camera_make VARCHAR(100),
  camera_model VARCHAR(100),
  focal_length DECIMAL(10,2),
  aperture DECIMAL(10,2),
  iso INTEGER,
  shutter_speed VARCHAR(20),
  gps_latitude DECIMAL(10,7),
  gps_longitude DECIMAL(10,7),
  taken_at TIMESTAMPTZ,
  raw_exif JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- AI processing audit log (future: cost tracking, debugging)
CREATE TABLE public.ai_processing_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_id UUID REFERENCES public.images(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  model_used VARCHAR(50) NOT NULL,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  processing_time_ms INTEGER,
  cost_usd DECIMAL(10,6),
  raw_request JSONB,
  raw_response JSONB,
  status VARCHAR(20) NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- User settings (future: preferences)
CREATE TABLE public.user_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  images_per_page INTEGER DEFAULT 20,
  theme VARCHAR(20) DEFAULT 'system',
  language VARCHAR(10) DEFAULT 'en',
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS for extended tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_exif ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_processing_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile" ON public.user_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own albums" ON public.albums FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own album images" ON public.album_images FOR ALL
  USING (album_id IN (SELECT id FROM public.albums WHERE user_id = auth.uid()));
CREATE POLICY "Users view own exif" ON public.image_exif FOR ALL
  USING (image_id IN (SELECT id FROM public.images WHERE user_id = auth.uid()));
CREATE POLICY "Users view own ai log" ON public.ai_processing_log FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);

-- Indexes for extended tables
CREATE INDEX idx_albums_user_id ON public.albums(user_id);
CREATE INDEX idx_album_images_image_id ON public.album_images(image_id);
CREATE INDEX idx_image_exif_image_id ON public.image_exif(image_id);
CREATE INDEX idx_ai_log_image_id ON public.ai_processing_log(image_id);
CREATE INDEX idx_ai_log_user_id ON public.ai_processing_log(user_id);

-- Triggers for extended tables
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER albums_updated_at BEFORE UPDATE ON public.albums FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
