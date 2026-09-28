-- Aigenstra Phases 1-4 Database Schema Extensions Migration
-- Migration Name: 20260928000000_aigenstra_phases_1_4_refinements.sql

-- 1. ADD COLUMNS TO PROJECTS FOR STEP 1 & 2 CREATION FLOW
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'SaaS',
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS problem_statement TEXT,
ADD COLUMN IF NOT EXISTS raw_idea TEXT;

-- 2. PROJECT MEMBERS TABLE (Collaborators & Roles)
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- 3. PROJECT SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.project_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  ai_model TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
  auto_audit BOOLEAN NOT NULL DEFAULT true,
  strict_security_rules BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. PROJECT STAGES TABLE (Deterministic Progress Tracking)
CREATE TABLE IF NOT EXISTS public.project_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL, -- discovery, user_journey, requirements, architecture, security, agent_council, prompts, audit, findings
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'needs_attention')),
  progress_pct INTEGER NOT NULL DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, stage_name)
);

-- 5. ARCHITECTURE DECISION RECORDS (ADRs) TABLE
CREATE TABLE IF NOT EXISTS public.adrs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  adr_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('proposed', 'accepted', 'superseded', 'rejected')),
  context TEXT NOT NULL,
  decision TEXT NOT NULL,
  reason TEXT NOT NULL,
  consequences TEXT NOT NULL,
  alternatives JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. PROJECT TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public.project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  product_type TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  raw_idea TEXT NOT NULL,
  coding_environment TEXT NOT NULL DEFAULT 'Cursor',
  tech_stack TEXT DEFAULT 'Next.js 15, Supabase, Tailwind CSS',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_stages_project_id ON public.project_stages(project_id);
CREATE INDEX IF NOT EXISTS idx_adrs_project_id ON public.adrs(project_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR PROJECT MEMBERS
DO $$ BEGIN
  CREATE POLICY "Users can view members of own projects" ON public.project_members FOR SELECT USING (
    user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_members.project_id AND projects.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- POLICIES FOR PROJECT SETTINGS
DO $$ BEGIN
  CREATE POLICY "Users can manage settings of own projects" ON public.project_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_settings.project_id AND projects.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- POLICIES FOR PROJECT STAGES
DO $$ BEGIN
  CREATE POLICY "Users can manage stages of own projects" ON public.project_stages FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_stages.project_id AND projects.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- POLICIES FOR ADRs
DO $$ BEGIN
  CREATE POLICY "Users can manage ADRs of own projects" ON public.adrs FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = adrs.project_id AND projects.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- POLICIES FOR TEMPLATES (Public read for authenticated users)
DO $$ BEGIN
  CREATE POLICY "Authenticated users can read templates" ON public.project_templates FOR SELECT USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
