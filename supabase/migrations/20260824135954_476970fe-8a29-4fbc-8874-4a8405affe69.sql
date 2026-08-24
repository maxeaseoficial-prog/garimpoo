CREATE TABLE public.instagram_cache (
  place_id TEXT PRIMARY KEY,
  instagram_handle TEXT,
  instagram_url TEXT,
  confidence TEXT,
  source TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.instagram_cache TO service_role;
ALTER TABLE public.instagram_cache ENABLE ROW LEVEL SECURITY;