-- ==============================================================================
-- Migration: Phase 8 Re-Audit, Verification, Regression & Project Health Engine
-- Timestamp: 20261008200000
-- Multi-tenant isolation with Supabase RLS and idempotent drop/create policies
-- ==============================================================================

-- 1. Create audit_verifications table
CREATE TABLE IF NOT EXISTS public.audit_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  finding_id UUID NOT NULL REFERENCES public.audit_findings(id) ON DELETE CASCADE,
  audit_id UUID REFERENCES public.project_audits(id) ON DELETE SET NULL,
  repository_snapshot_id UUID REFERENCES public.repository_snapshots(id) ON DELETE SET NULL,
  verification_scope TEXT NOT NULL DEFAULT 'TARGETED_FINDING',
  expected_behavior TEXT NOT NULL,
  observed_behavior TEXT NOT NULL,
  original_evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  current_evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  verification_method TEXT NOT NULL DEFAULT 'STATIC_ANALYSIS',
  status TEXT NOT NULL DEFAULT 'UNABLE_TO_VERIFY',
  confidence TEXT NOT NULL DEFAULT 'MEDIUM',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.audit_verifications ENABLE ROW LEVEL SECURITY;

-- 2. Create audit_health_snapshots table
CREATE TABLE IF NOT EXISTS public.audit_health_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  audit_id UUID REFERENCES public.project_audits(id) ON DELETE SET NULL,
  repository_snapshot_id UUID REFERENCES public.repository_snapshots(id) ON DELETE SET NULL,
  health_status TEXT NOT NULL DEFAULT 'HEALTHY_WITHIN_SCOPE',
  health_scope TEXT NOT NULL DEFAULT 'FULL',
  critical_count INTEGER NOT NULL DEFAULT 0,
  high_count INTEGER NOT NULL DEFAULT 0,
  medium_count INTEGER NOT NULL DEFAULT 0,
  regression_count INTEGER NOT NULL DEFAULT 0,
  verified_count INTEGER NOT NULL DEFAULT 0,
  unverified_count INTEGER NOT NULL DEFAULT 0,
  blueprint_alignment TEXT NOT NULL DEFAULT 'ALIGNED',
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommended_next_action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.audit_health_snapshots ENABLE ROW LEVEL SECURITY;

-- 3. Alter audit_findings to support regression lineage and resolution tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_findings' AND column_name = 'previous_finding_id'
  ) THEN
    ALTER TABLE public.audit_findings ADD COLUMN previous_finding_id UUID REFERENCES public.audit_findings(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_findings' AND column_name = 'regression_count'
  ) THEN
    ALTER TABLE public.audit_findings ADD COLUMN regression_count INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_findings' AND column_name = 'resolved_at'
  ) THEN
    ALTER TABLE public.audit_findings ADD COLUMN resolved_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_findings' AND column_name = 'verification_id'
  ) THEN
    ALTER TABLE public.audit_findings ADD COLUMN verification_id UUID REFERENCES public.audit_verifications(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4. Create Indexes
CREATE INDEX IF NOT EXISTS idx_audit_verifications_project ON public.audit_verifications(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_verifications_finding ON public.audit_verifications(finding_id);
CREATE INDEX IF NOT EXISTS idx_audit_verifications_snapshot ON public.audit_verifications(repository_snapshot_id);
CREATE INDEX IF NOT EXISTS idx_audit_health_project ON public.audit_health_snapshots(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_health_created ON public.audit_health_snapshots(created_at DESC);

-- 5. Row-Level Security Policies (Multi-Tenant Isolation)

-- audit_verifications policies
DROP POLICY IF EXISTS "Users can read verifications for own projects" ON public.audit_verifications;
CREATE POLICY "Users can read verifications for own projects"
  ON public.audit_verifications
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = audit_verifications.project_id AND projects.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert verifications for own projects" ON public.audit_verifications;
CREATE POLICY "Users can insert verifications for own projects"
  ON public.audit_verifications
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = audit_verifications.project_id AND projects.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update verifications for own projects" ON public.audit_verifications;
CREATE POLICY "Users can update verifications for own projects"
  ON public.audit_verifications
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = audit_verifications.project_id AND projects.user_id = auth.uid()));

-- audit_health_snapshots policies
DROP POLICY IF EXISTS "Users can read health snapshots for own projects" ON public.audit_health_snapshots;
CREATE POLICY "Users can read health snapshots for own projects"
  ON public.audit_health_snapshots
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = audit_health_snapshots.project_id AND projects.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert health snapshots for own projects" ON public.audit_health_snapshots;
CREATE POLICY "Users can insert health snapshots for own projects"
  ON public.audit_health_snapshots
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = audit_health_snapshots.project_id AND projects.user_id = auth.uid()));
