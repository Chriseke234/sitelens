-- SiteLens Schema Migration - Phases 9-17 Pre-Launch Extensions
-- Adds screenshot & favicon columns to audits, creates storage buckets & policies

-- 1. ADD FAVICON AND SCREENSHOT COLUMNS TO AUDITS
ALTER TABLE public.audits 
ADD COLUMN IF NOT EXISTS favicon_url TEXT,
ADD COLUMN IF NOT EXISTS desktop_screenshot_url TEXT,
ADD COLUMN IF NOT EXISTS mobile_screenshot_url TEXT;

-- 2. CREATE STORAGE BUCKETS (If using Supabase Storage API)
INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('media_uploads', 'media_uploads', true)
ON CONFLICT (id) DO NOTHING;

-- STORAGE POLICIES FOR SCREENSHOTS
DO $$ BEGIN
  CREATE POLICY "Public Read Screenshots" ON storage.objects FOR SELECT USING (bucket_id = 'screenshots');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users Upload Screenshots" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'screenshots' AND auth.uid()::text = (storage.foldername(name))[2]
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- STORAGE POLICIES FOR MEDIA UPLOADS
DO $$ BEGIN
  CREATE POLICY "Public Read Media Uploads" ON storage.objects FOR SELECT USING (bucket_id = 'media_uploads');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users Upload Media Files" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'media_uploads' AND auth.uid()::text = (storage.foldername(name))[2]
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
