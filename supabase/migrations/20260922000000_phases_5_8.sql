-- SiteLens Schema Migration - Phases 5-8 Extensions
-- Adds scoring_version to audits and creates audit_ai_reports table with RLS policies

-- 1. Add scoring_version to audits table
ALTER TABLE public.audits 
ADD COLUMN IF NOT EXISTS scoring_version TEXT DEFAULT 'v1';

-- 2. CREATE AUDIT AI REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.audit_ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL UNIQUE REFERENCES public.audits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  key_findings JSONB NOT NULL DEFAULT '[]'::jsonb,
  priority_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  category_explanations JSONB NOT NULL DEFAULT '[]'::jsonb,
  business_context TEXT,
  limitations TEXT,
  model TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_audit_ai_reports_audit_id ON public.audit_ai_reports(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_ai_reports_user_id ON public.audit_ai_reports(user_id);

-- ROW LEVEL SECURITY (RLS) FOR AUDIT AI REPORTS
ALTER TABLE public.audit_ai_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view AI reports of own audits" ON public.audit_ai_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert AI reports for own audits" ON public.audit_ai_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update AI reports for own audits" ON public.audit_ai_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete AI reports for own audits" ON public.audit_ai_reports
  FOR DELETE USING (auth.uid() = user_id);
