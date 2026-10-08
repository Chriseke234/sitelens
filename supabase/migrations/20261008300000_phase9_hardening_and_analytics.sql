-- ==============================================================================
-- Migration: Phase 9 Production Hardening, Telemetry & Analytics
-- Timestamp: 20261008300000
-- Multi-tenant isolation with Supabase RLS and idempotent policies
-- ==============================================================================

-- 1. Create project_telemetry_events table
CREATE TABLE IF NOT EXISTS public.project_telemetry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  stage TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.project_telemetry_events ENABLE ROW LEVEL SECURITY;

-- 2. Create project_error_logs table
CREATE TABLE IF NOT EXISTS public.project_error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  reference_id TEXT NOT NULL,
  error_code TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.project_error_logs ENABLE ROW LEVEL SECURITY;

-- 3. Create Indexes
CREATE INDEX IF NOT EXISTS idx_telemetry_project ON public.project_telemetry_events(project_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_event ON public.project_telemetry_events(event_type);
CREATE INDEX IF NOT EXISTS idx_telemetry_created ON public.project_telemetry_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_project ON public.project_error_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_ref ON public.project_error_logs(reference_id);

-- 4. Multi-Tenant RLS Policies
DROP POLICY IF EXISTS "Users can read telemetry for own projects" ON public.project_telemetry_events;
CREATE POLICY "Users can read telemetry for own projects"
  ON public.project_telemetry_events
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_telemetry_events.project_id AND projects.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert telemetry for own projects" ON public.project_telemetry_events;
CREATE POLICY "Users can insert telemetry for own projects"
  ON public.project_telemetry_events
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_telemetry_events.project_id AND projects.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can read error logs for own projects" ON public.project_error_logs;
CREATE POLICY "Users can read error logs for own projects"
  ON public.project_error_logs
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_error_logs.project_id AND projects.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert error logs for own projects" ON public.project_error_logs;
CREATE POLICY "Users can insert error logs for own projects"
  ON public.project_error_logs
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_error_logs.project_id AND projects.user_id = auth.uid()));
