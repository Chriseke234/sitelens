-- =========================================================
-- AIGENSTRA PHASES 5 TO 9: PROMPTS, AUDITS, FIXES & READINESS
-- =========================================================

-- 1. Build Sessions Table (Phase 5)
CREATE TABLE IF NOT EXISTS public.build_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'Backend',
  coding_agent TEXT NOT NULL DEFAULT 'Antigravity',
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'not_started', -- 'not_started', 'in_progress', 'implemented', 'needs_review'
  user_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Extend Prompt Versions with 16-part structure columns
ALTER TABLE public.prompt_versions
ADD COLUMN IF NOT EXISTS do_not_change TEXT[],
ADD COLUMN IF NOT EXISTS existing_architecture TEXT,
ADD COLUMN IF NOT EXISTS technical_constraints TEXT[],
ADD COLUMN IF NOT EXISTS ux_requirements TEXT[],
ADD COLUMN IF NOT EXISTS security_requirements TEXT[],
ADD COLUMN IF NOT EXISTS validation TEXT[],
ADD COLUMN IF NOT EXISTS expected_output TEXT;

-- 3. Extend Audit Findings with evidence and lifecycle fields (Phases 6-7)
ALTER TABLE public.audit_findings
ADD COLUMN IF NOT EXISTS affected_file_or_route TEXT,
ADD COLUMN IF NOT EXISTS verification_method TEXT,
ADD COLUMN IF NOT EXISTS confidence TEXT DEFAULT 'likely', -- 'confirmed', 'likely', 'potential', 'unable_to_verify'
ADD COLUMN IF NOT EXISTS lifecycle_status TEXT DEFAULT 'open'; -- 'open', 'fix_prompt_generated', 'user_implementing', 'ready_for_verification', 'resolved', 'regressed'

-- 4. Re-Audits Table (Phase 8)
CREATE TABLE IF NOT EXISTS public.re_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  previous_audit_id UUID REFERENCES public.project_audits(id) ON DELETE SET NULL,
  new_audit_id UUID REFERENCES public.project_audits(id) ON DELETE SET NULL,
  resolved_findings_count INTEGER DEFAULT 0,
  regressed_findings_count INTEGER DEFAULT 0,
  still_present_count INTEGER DEFAULT 0,
  comparison_summary TEXT,
  evidence_log JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Project Shares Table (Phase 9 Read-Only Shareable View)
CREATE TABLE IF NOT EXISTS public.project_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Production Readiness Checklist Table (Phase 9)
CREATE TABLE IF NOT EXISTS public.production_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'product', 'ux', 'engineering', 'security', 'performance', 'seo'
  item_key TEXT NOT NULL,
  title TEXT NOT NULL,
  is_checked BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (project_id, item_key)
);

-- Row Level Security (RLS)
ALTER TABLE public.build_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.re_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_checklists ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage build sessions of own projects"
  ON public.build_sessions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = build_sessions.project_id AND projects.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = build_sessions.project_id AND projects.user_id = auth.uid()));

CREATE POLICY "Users can manage re_audits of own projects"
  ON public.re_audits FOR ALL
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = re_audits.project_id AND projects.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = re_audits.project_id AND projects.user_id = auth.uid()));

CREATE POLICY "Users can manage project_shares of own projects"
  ON public.project_shares FOR ALL
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_shares.project_id AND projects.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_shares.project_id AND projects.user_id = auth.uid()));

CREATE POLICY "Public read-only access for active share tokens"
  ON public.project_shares FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Users can manage production_checklists of own projects"
  ON public.production_checklists FOR ALL
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = production_checklists.project_id AND projects.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = production_checklists.project_id AND projects.user_id = auth.uid()));
