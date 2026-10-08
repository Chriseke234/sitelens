-- =========================================================
-- AIGENSTRA PHASE 7: PROJECT AUDIT + FINDINGS + EVIDENCE
-- Migration: 20261008100000_phase7_audit_engine.sql
-- =========================================================

-- 1. Enhance or create public.project_audits
CREATE TABLE IF NOT EXISTS public.project_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  repository_snapshot_id UUID REFERENCES public.repository_snapshots(id) ON DELETE SET NULL,
  blueprint_revision TEXT,
  engineering_revision TEXT,
  audit_scope TEXT NOT NULL DEFAULT 'FULL', -- 'FULL', 'PRODUCT', 'UX', 'UI', 'ENGINEERING', 'SECURITY', 'PERFORMANCE', 'TESTING'
  status TEXT NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'ANALYZING', 'COMPLETED', 'PARTIAL', 'FAILED')),
  readiness_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  coverage JSONB NOT NULL DEFAULT '{}'::jsonb,
  warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMPTZ
);

-- Ensure columns exist if table was already created in earlier migrations
ALTER TABLE public.project_audits ADD COLUMN IF NOT EXISTS repository_snapshot_id UUID REFERENCES public.repository_snapshots(id) ON DELETE SET NULL;
ALTER TABLE public.project_audits ADD COLUMN IF NOT EXISTS blueprint_revision TEXT;
ALTER TABLE public.project_audits ADD COLUMN IF NOT EXISTS engineering_revision TEXT;
ALTER TABLE public.project_audits ADD COLUMN IF NOT EXISTS audit_scope TEXT NOT NULL DEFAULT 'FULL';
ALTER TABLE public.project_audits ADD COLUMN IF NOT EXISTS summary JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.project_audits ADD COLUMN IF NOT EXISTS coverage JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.project_audits ADD COLUMN IF NOT EXISTS warnings JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 2. Enhance or create public.audit_findings
CREATE TABLE IF NOT EXISTS public.audit_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  audit_id UUID REFERENCES public.project_audits(id) ON DELETE CASCADE,
  finding_code TEXT NOT NULL, -- e.g. "AUTH-001", "SEC-002", "UX-003", "PROD-001"
  category TEXT NOT NULL, -- 'PRODUCT', 'UX', 'UI', 'FRONTEND', 'BACKEND', 'API', 'DATABASE', 'AUTHENTICATION', 'AUTHORIZATION', 'SECURITY', 'PERFORMANCE', 'ACCESSIBILITY', 'TESTING'
  severity TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO', 'critical', 'high', 'medium', 'low', 'info')),
  status TEXT NOT NULL DEFAULT 'ISSUE' CHECK (status IN ('VERIFIED', 'PASS_WITH_NOTES', 'NEEDS_REVIEW', 'ISSUE', 'CRITICAL', 'NOT_VERIFIABLE', 'NOT_APPLICABLE', 'open', 'in_progress', 'resolved', 'partially_resolved', 'unable_to_verify')),
  title TEXT NOT NULL,
  summary TEXT, -- Layer 1: Simple explanation for vibe coders
  description TEXT NOT NULL, -- Layer 2: Technical detail
  impact TEXT NOT NULL, -- Real-world consequence if unaddressed
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb, -- Concrete file path, line range, symbol, route, and redacted snippet
  expected_behavior TEXT,
  observed_behavior TEXT,
  recommendation TEXT NOT NULL,
  verification_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence TEXT NOT NULL DEFAULT 'HIGH' CHECK (confidence IN ('HIGH', 'MEDIUM', 'LOW', 'confirmed', 'likely', 'potential', 'unable_to_verify')),
  affected_feature TEXT,
  affected_screen TEXT,
  affected_workflow TEXT,
  affected_file TEXT,
  affected_symbol TEXT,
  source_requirement TEXT,
  fix_status TEXT NOT NULL DEFAULT 'OPEN' CHECK (fix_status IN ('OPEN', 'FIX_PROMPT_READY', 'HANDED_OFF', 'AWAITING_VERIFICATION')),
  user_override JSONB, -- { action: 'DISMISSED'|'MARKED_NA'|'MANUAL_REVIEW', rationale: string, timestamp: string }
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure all Phase 7 columns exist if table was partially created
ALTER TABLE public.audit_findings ADD COLUMN IF NOT EXISTS audit_id UUID REFERENCES public.project_audits(id) ON DELETE CASCADE;
ALTER TABLE public.audit_findings ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE public.audit_findings ADD COLUMN IF NOT EXISTS evidence JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.audit_findings ADD COLUMN IF NOT EXISTS expected_behavior TEXT;
ALTER TABLE public.audit_findings ADD COLUMN IF NOT EXISTS observed_behavior TEXT;
ALTER TABLE public.audit_findings ADD COLUMN IF NOT EXISTS verification_criteria JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.audit_findings ADD COLUMN IF NOT EXISTS confidence TEXT NOT NULL DEFAULT 'HIGH';
ALTER TABLE public.audit_findings ADD COLUMN IF NOT EXISTS affected_feature TEXT;
ALTER TABLE public.audit_findings ADD COLUMN IF NOT EXISTS affected_screen TEXT;
ALTER TABLE public.audit_findings ADD COLUMN IF NOT EXISTS affected_workflow TEXT;
ALTER TABLE public.audit_findings ADD COLUMN IF NOT EXISTS affected_file TEXT;
ALTER TABLE public.audit_findings ADD COLUMN IF NOT EXISTS affected_symbol TEXT;
ALTER TABLE public.audit_findings ADD COLUMN IF NOT EXISTS source_requirement TEXT;
ALTER TABLE public.audit_findings ADD COLUMN IF NOT EXISTS fix_status TEXT NOT NULL DEFAULT 'OPEN';
ALTER TABLE public.audit_findings ADD COLUMN IF NOT EXISTS user_override JSONB;

-- 3. Requirement Coverage Table
CREATE TABLE IF NOT EXISTS public.audit_requirement_coverage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  audit_id UUID NOT NULL REFERENCES public.project_audits(id) ON DELETE CASCADE,
  requirement_id TEXT NOT NULL,
  requirement_type TEXT NOT NULL DEFAULT 'FEATURE', -- 'FEATURE', 'WORKFLOW', 'SECURITY_RULE', 'DATA_ENTITY', 'API_CONTRACT'
  title TEXT NOT NULL,
  coverage_status TEXT NOT NULL CHECK (coverage_status IN ('VERIFIED', 'PARTIALLY_SUPPORTED', 'MISSING', 'CONFLICTING', 'UNABLE_TO_VERIFY', 'NOT_APPLICABLE')),
  evidence_paths JSONB NOT NULL DEFAULT '[]'::jsonb,
  observations TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Audit Fix Tasks Table (relationship between audit finding, task, and compiled fix prompt)
CREATE TABLE IF NOT EXISTS public.audit_fix_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  audit_id UUID REFERENCES public.project_audits(id) ON DELETE SET NULL,
  finding_id UUID NOT NULL REFERENCES public.audit_findings(id) ON DELETE CASCADE,
  task_id TEXT, -- reference to AigenstraTask.id if converted to task
  title TEXT NOT NULL,
  fix_prompt_id UUID REFERENCES public.prompts(id) ON DELETE SET NULL,
  fix_status TEXT NOT NULL DEFAULT 'OPEN' CHECK (fix_status IN ('OPEN', 'FIX_PROMPT_READY', 'HANDED_OFF', 'AWAITING_VERIFICATION')),
  target_agent TEXT NOT NULL DEFAULT 'google_antigravity',
  context_pack JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================
-- INDEXES FOR PERFORMANCE
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_project_audits_project ON public.project_audits(project_id);
CREATE INDEX IF NOT EXISTS idx_project_audits_snapshot ON public.project_audits(repository_snapshot_id);
CREATE INDEX IF NOT EXISTS idx_audit_findings_audit ON public.audit_findings(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_findings_project ON public.audit_findings(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_findings_category ON public.audit_findings(project_id, category);
CREATE INDEX IF NOT EXISTS idx_audit_findings_severity ON public.audit_findings(project_id, severity);
CREATE INDEX IF NOT EXISTS idx_audit_req_coverage_audit ON public.audit_requirement_coverage(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_fix_tasks_finding ON public.audit_fix_tasks(finding_id);
CREATE INDEX IF NOT EXISTS idx_audit_fix_tasks_project ON public.audit_fix_tasks(project_id);

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================
ALTER TABLE public.project_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_requirement_coverage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_fix_tasks ENABLE ROW LEVEL SECURITY;

-- 1. project_audits
DROP POLICY IF EXISTS "Users manage audits of own projects" ON public.project_audits;
CREATE POLICY "Users manage audits of own projects"
  ON public.project_audits FOR ALL
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_audits.project_id AND projects.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_audits.project_id AND projects.user_id = auth.uid()));

-- 2. audit_findings
DROP POLICY IF EXISTS "Users manage findings of own projects" ON public.audit_findings;
CREATE POLICY "Users manage findings of own projects"
  ON public.audit_findings FOR ALL
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = audit_findings.project_id AND projects.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = audit_findings.project_id AND projects.user_id = auth.uid()));

-- 3. audit_requirement_coverage
DROP POLICY IF EXISTS "Users manage coverage of own projects" ON public.audit_requirement_coverage;
CREATE POLICY "Users manage coverage of own projects"
  ON public.audit_requirement_coverage FOR ALL
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = audit_requirement_coverage.project_id AND projects.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = audit_requirement_coverage.project_id AND projects.user_id = auth.uid()));

-- 4. audit_fix_tasks
DROP POLICY IF EXISTS "Users manage fix tasks of own projects" ON public.audit_fix_tasks;
CREATE POLICY "Users manage fix tasks of own projects"
  ON public.audit_fix_tasks FOR ALL
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = audit_fix_tasks.project_id AND projects.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = audit_fix_tasks.project_id AND projects.user_id = auth.uid()));
