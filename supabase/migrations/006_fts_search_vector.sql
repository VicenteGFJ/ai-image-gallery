-- Migration 006: Full-text search vector (trigger-maintained)

ALTER TABLE public.image_metadata ADD COLUMN search_vector tsvector;

CREATE INDEX idx_metadata_search_vector ON public.image_metadata USING GIN(search_vector);

CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    array_to_string(COALESCE(NEW.tags, '{}'), ' ')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER image_metadata_search_vector
  BEFORE INSERT OR UPDATE ON public.image_metadata
  FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- Backfill existing rows
UPDATE public.image_metadata SET search_vector = to_tsvector('english',
  COALESCE(title, '') || ' ' ||
  COALESCE(description, '') || ' ' ||
  array_to_string(COALESCE(tags, '{}'), ' ')
);
