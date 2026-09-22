-- SiteLens Schema Migration - Initial Release
-- Creates profiles, audits, audit_pages, audit_issues, media_scans, media_evidence tables with RLS policies

-- Enable pgcrypto extension for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. AUDITS TABLE
CREATE TABLE IF NOT EXISTS public.audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'analyzing', 'completed', 'failed')),
  overall_score INTEGER CHECK (overall_score IS NULL OR (overall_score >= 0 AND overall_score <= 100)),
  seo_score INTEGER CHECK (seo_score IS NULL OR (seo_score >= 0 AND seo_score <= 100)),
  performance_score INTEGER CHECK (performance_score IS NULL OR (performance_score >= 0 AND performance_score <= 100)),
  accessibility_score INTEGER CHECK (accessibility_score IS NULL OR (accessibility_score >= 0 AND accessibility_score <= 100)),
  ux_score INTEGER CHECK (ux_score IS NULL OR (ux_score >= 0 AND ux_score <= 100)),
  trust_score INTEGER CHECK (trust_score IS NULL OR (trust_score >= 0 AND trust_score <= 100)),
  conversion_score INTEGER CHECK (conversion_score IS NULL OR (conversion_score >= 0 AND conversion_score <= 100)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- 3. AUDIT PAGES TABLE
CREATE TABLE IF NOT EXISTS public.audit_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  status_code INTEGER,
  load_time INTEGER,
  screenshot_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. AUDIT ISSUES TABLE
CREATE TABLE IF NOT EXISTS public.audit_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  page_id UUID REFERENCES public.audit_pages(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('seo', 'performance', 'accessibility', 'ux', 'trust', 'conversion')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. MEDIA SCANS TABLE
CREATE TABLE IF NOT EXISTS public.media_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'analyzing', 'completed', 'failed')),
  overall_assessment TEXT CHECK (overall_assessment IS NULL OR overall_assessment IN ('likely_ai_generated', 'likely_authentic', 'inconclusive')),
  confidence NUMERIC(5,2) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 100)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- 6. MEDIA EVIDENCE TABLE
CREATE TABLE IF NOT EXISTS public.media_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_scan_id UUID NOT NULL REFERENCES public.media_scans(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('metadata', 'provenance', 'watermark', 'forensic', 'detection')),
  signal TEXT NOT NULL,
  description TEXT NOT NULL,
  result TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_audits_user_id ON public.audits(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_pages_audit_id ON public.audit_pages(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_issues_audit_id ON public.audit_issues(audit_id);
CREATE INDEX IF NOT EXISTS idx_media_scans_user_id ON public.media_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_media_evidence_scan_id ON public.media_evidence(media_scan_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_evidence ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- POLICIES FOR AUDITS
CREATE POLICY "Users can view own audits" ON public.audits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audits" ON public.audits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own audits" ON public.audits
  FOR UPDATE USING (auth.uid() = user_id);

-- POLICIES FOR AUDIT PAGES
CREATE POLICY "Users can view pages of own audits" ON public.audit_pages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.audits
      WHERE audits.id = audit_pages.audit_id AND audits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert pages for own audits" ON public.audit_pages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.audits
      WHERE audits.id = audit_pages.audit_id AND audits.user_id = auth.uid()
    )
  );

-- POLICIES FOR AUDIT ISSUES
CREATE POLICY "Users can view issues of own audits" ON public.audit_issues
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.audits
      WHERE audits.id = audit_issues.audit_id AND audits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert issues for own audits" ON public.audit_issues
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.audits
      WHERE audits.id = audit_issues.audit_id AND audits.user_id = auth.uid()
    )
  );

-- POLICIES FOR MEDIA SCANS
CREATE POLICY "Users can view own media scans" ON public.media_scans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own media scans" ON public.media_scans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own media scans" ON public.media_scans
  FOR UPDATE USING (auth.uid() = user_id);

-- POLICIES FOR MEDIA EVIDENCE
CREATE POLICY "Users can view evidence of own media scans" ON public.media_evidence
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.media_scans
      WHERE media_scans.id = media_evidence.media_scan_id AND media_scans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert evidence for own media scans" ON public.media_evidence
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.media_scans
      WHERE media_scans.id = media_evidence.media_scan_id AND media_scans.user_id = auth.uid()
    )
  );

-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
