-- ==============================================================================
-- AIGENSTRA & SITELENS: MASTER DATABASE SCHEMA & SECURITY SETUP
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Go to "SQL Editor" -> click "New Query"
-- 3. Paste this entire script and click "Run" (Cmd+Enter / Ctrl+Enter)
-- ==============================================================================

-- Enable required Postgres extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. USER PROFILES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view and update own profile" ON public.profiles;
CREATE POLICY "Users can view and update own profile" 
  ON public.profiles FOR ALL 
  USING (auth.uid() = user_id);

-- Profile Creation Function & Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $func_user$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (user_id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      updated_at = now();
  RETURN NEW;
END;
$func_user$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 2. PROJECTS (AIGENSTRA V2 CORE WORKSPACE)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  product_type TEXT DEFAULT 'SaaS',
  target_audience TEXT,
  problem_statement TEXT,
  raw_idea TEXT,
  stage TEXT NOT NULL DEFAULT 'idea' CHECK (stage IN ('idea', 'researching', 'planning', 'designing', 'building', 'almost_finished', 'launched')),
  coding_environment TEXT NOT NULL DEFAULT 'Cursor' CHECK (coding_environment IN ('Antigravity', 'Cursor', 'Claude Code', 'Codex', 'Replit', 'Lovable', 'v0', 'Other')),
  tech_stack TEXT DEFAULT 'Next.js 15, Supabase, Tailwind CSS',
  goal TEXT NOT NULL DEFAULT 'Build a production-grade verified software application',
  mode TEXT NOT NULL DEFAULT 'build' CHECK (mode IN ('build', 'audit')),
  repo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own projects" ON public.projects;
CREATE POLICY "Users can manage own projects" 
  ON public.projects FOR ALL 
  USING (auth.uid() = user_id);

-- Project Members (Collaborators & Roles)
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view members of own projects" ON public.project_members;
CREATE POLICY "Users can view members of own projects" 
  ON public.project_members FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_members.project_id AND projects.user_id = auth.uid())
  );

-- Project Settings
CREATE TABLE IF NOT EXISTS public.project_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  ai_model TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
  auto_audit BOOLEAN NOT NULL DEFAULT true,
  strict_security_rules BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.project_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage settings of own projects" ON public.project_settings;
CREATE POLICY "Users can manage settings of own projects" 
  ON public.project_settings FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_settings.project_id AND projects.user_id = auth.uid())
  );

-- Project Stages (Deterministic Progress Tracking)
CREATE TABLE IF NOT EXISTS public.project_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'needs_attention')),
  progress_pct INTEGER NOT NULL DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, stage_name)
);

ALTER TABLE public.project_stages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage stages of own projects" ON public.project_stages;
CREATE POLICY "Users can manage stages of own projects" 
  ON public.project_stages FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_stages.project_id AND projects.user_id = auth.uid())
  );

-- ==============================================================================
-- 3. PRODUCT INTELLIGENCE & RESEARCH
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.discovery_qna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  category TEXT DEFAULT 'general',
  step_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.discovery_qna ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage discovery QnA for own projects" ON public.discovery_qna;
CREATE POLICY "Users can manage discovery QnA for own projects" 
  ON public.discovery_qna FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = discovery_qna.project_id AND projects.user_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS public.research_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  market_context TEXT NOT NULL,
  user_context TEXT NOT NULL,
  competitor_analysis JSONB NOT NULL DEFAULT '[]'::jsonb,
  user_needs JSONB NOT NULL DEFAULT '[]'::jsonb,
  risks JSONB NOT NULL DEFAULT '[]'::jsonb,
  opportunities JSONB NOT NULL DEFAULT '[]'::jsonb,
  assumptions JSONB NOT NULL DEFAULT '[]'::jsonb,
  hypotheses JSONB NOT NULL DEFAULT '[]'::jsonb,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.research_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage research docs for own projects" ON public.research_documents;
CREATE POLICY "Users can manage research docs for own projects" 
  ON public.research_documents FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = research_documents.project_id AND projects.user_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS public.user_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  persona TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  happy_path JSONB NOT NULL DEFAULT '[]'::jsonb,
  edge_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
  failure_paths JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_journeys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage user journeys for own projects" ON public.user_journeys;
CREATE POLICY "Users can manage user journeys for own projects" 
  ON public.user_journeys FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = user_journeys.project_id AND projects.user_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS public.product_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  problem_statement TEXT NOT NULL,
  target_users JSONB NOT NULL DEFAULT '[]'::jsonb,
  goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  non_goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  user_stories JSONB NOT NULL DEFAULT '[]'::jsonb,
  functional_reqs JSONB NOT NULL DEFAULT '[]'::jsonb,
  non_functional_reqs JSONB NOT NULL DEFAULT '[]'::jsonb,
  business_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  acceptance_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
  edge_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
  mvp_scope JSONB NOT NULL DEFAULT '[]'::jsonb,
  future_scope JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.product_specs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage product specs for own projects" ON public.product_specs;
CREATE POLICY "Users can manage product specs for own projects" 
  ON public.product_specs FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = product_specs.project_id AND projects.user_id = auth.uid())
  );

-- ==============================================================================
-- 4. DESIGN, ARCHITECTURE & SECURITY
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.design_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sitemap JSONB NOT NULL DEFAULT '[]'::jsonb,
  user_flows JSONB NOT NULL DEFAULT '[]'::jsonb,
  pages JSONB NOT NULL DEFAULT '[]'::jsonb,
  components JSONB NOT NULL DEFAULT '[]'::jsonb,
  responsive_reqs JSONB NOT NULL DEFAULT '[]'::jsonb,
  accessibility_reqs JSONB NOT NULL DEFAULT '[]'::jsonb,
  states JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.design_specs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage design specs for own projects" ON public.design_specs;
CREATE POLICY "Users can manage design specs for own projects" 
  ON public.design_specs FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = design_specs.project_id AND projects.user_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS public.architecture_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  frontend JSONB NOT NULL DEFAULT '{}'::jsonb,
  backend JSONB NOT NULL DEFAULT '{}'::jsonb,
  database_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  authentication JSONB NOT NULL DEFAULT '{}'::jsonb,
  storage JSONB NOT NULL DEFAULT '{}'::jsonb,
  integrations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.architecture_docs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage architecture docs for own projects" ON public.architecture_docs;
CREATE POLICY "Users can manage architecture docs for own projects" 
  ON public.architecture_docs FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = architecture_docs.project_id AND projects.user_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS public.security_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  authentication_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  authorization_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  database_security JSONB NOT NULL DEFAULT '[]'::jsonb,
  api_security JSONB NOT NULL DEFAULT '[]'::jsonb,
  input_validation JSONB NOT NULL DEFAULT '[]'::jsonb,
  secret_management JSONB NOT NULL DEFAULT '[]'::jsonb,
  threat_model JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.security_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage security plans for own projects" ON public.security_plans;
CREATE POLICY "Users can manage security plans for own projects" 
  ON public.security_plans FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = security_plans.project_id AND projects.user_id = auth.uid())
  );

-- ==============================================================================
-- 5. MULTI-AGENT COUNCIL & ADRs
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.agent_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'closed')),
  agent_messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_discussions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage agent discussions for own projects" ON public.agent_discussions;
CREATE POLICY "Users can manage agent discussions for own projects" 
  ON public.agent_discussions FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = agent_discussions.project_id AND projects.user_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS public.agent_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  discussion_id UUID REFERENCES public.agent_discussions(id) ON DELETE SET NULL,
  decision_number INTEGER NOT NULL,
  topic TEXT NOT NULL,
  problem TEXT NOT NULL,
  decision TEXT NOT NULL,
  reason TEXT NOT NULL,
  agent_contributions JSONB NOT NULL DEFAULT '[]'::jsonb,
  alternatives_considered JSONB NOT NULL DEFAULT '[]'::jsonb,
  impacted_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'approved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_decisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage agent decisions for own projects" ON public.agent_decisions;
CREATE POLICY "Users can manage agent decisions for own projects" 
  ON public.agent_decisions FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = agent_decisions.project_id AND projects.user_id = auth.uid())
  );

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

ALTER TABLE public.adrs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage ADRs of own projects" ON public.adrs;
CREATE POLICY "Users can manage ADRs of own projects" 
  ON public.adrs FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = adrs.project_id AND projects.user_id = auth.uid())
  );

-- ==============================================================================
-- 6. PROMPT STUDIO & 16-PART PROMPT ENGINE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('product', 'ux', 'design', 'architecture', 'database', 'authentication', 'backend', 'api', 'frontend', 'testing', 'security', 'deployment', 'audit', 'fix')),
  title TEXT NOT NULL,
  current_version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'used', 'successful', 'deprecated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage prompts for own projects" ON public.prompts;
CREATE POLICY "Users can manage prompts for own projects" 
  ON public.prompts FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = prompts.project_id AND projects.user_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS public.prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  role TEXT NOT NULL,
  project_context TEXT NOT NULL,
  current_state TEXT NOT NULL,
  objective TEXT NOT NULL,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  constraints JSONB NOT NULL DEFAULT '[]'::jsonb,
  security_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  edge_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
  acceptance_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
  validation JSONB NOT NULL DEFAULT '[]'::jsonb,
  output_requirements TEXT NOT NULL,
  full_prompt_text TEXT NOT NULL,
  do_not_change TEXT[],
  existing_architecture TEXT,
  technical_constraints TEXT[],
  ux_requirements TEXT[],
  expected_output TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.prompt_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage prompt versions for own projects" ON public.prompt_versions;
CREATE POLICY "Users can manage prompt versions for own projects" 
  ON public.prompt_versions FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.prompts 
      JOIN public.projects ON projects.id = prompts.project_id 
      WHERE prompts.id = prompt_versions.prompt_id AND projects.user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS public.build_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'Backend',
  coding_agent TEXT NOT NULL DEFAULT 'Antigravity',
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'implemented', 'needs_review')),
  user_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.build_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage build sessions of own projects" ON public.build_sessions;
CREATE POLICY "Users can manage build sessions of own projects" 
  ON public.build_sessions FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = build_sessions.project_id AND projects.user_id = auth.uid())
  );

-- ==============================================================================
-- 7. 9-AGENT AUDIT HUB, FINDINGS & FIX ENGINE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.project_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'analyzing', 'completed', 'failed')),
  readiness_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.project_audits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage project audits for own projects" ON public.project_audits;
CREATE POLICY "Users can manage project audits for own projects" 
  ON public.project_audits FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_audits.project_id AND projects.user_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS public.audit_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  project_audit_id UUID REFERENCES public.project_audits(id) ON DELETE CASCADE,
  finding_code TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('product', 'ux', 'frontend', 'backend', 'security', 'performance', 'seo', 'accessibility', 'code_quality')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  title TEXT NOT NULL,
  simple_explanation TEXT NOT NULL,
  technical_explanation TEXT NOT NULL,
  evidence TEXT NOT NULL,
  potential_impact TEXT NOT NULL,
  recommended_fix TEXT NOT NULL,
  related_files JSONB NOT NULL DEFAULT '[]'::jsonb,
  affected_file_or_route TEXT,
  verification_method TEXT,
  confidence TEXT DEFAULT 'likely',
  lifecycle_status TEXT DEFAULT 'open',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'partially_resolved', 'unable_to_verify')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_findings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage audit findings for own projects" ON public.audit_findings;
CREATE POLICY "Users can manage audit findings for own projects" 
  ON public.audit_findings FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = audit_findings.project_id AND projects.user_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS public.fix_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id UUID NOT NULL REFERENCES public.audit_findings(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  verification_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'copied', 'applied', 'verified')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fix_prompts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage fix prompts for own projects" ON public.fix_prompts;
CREATE POLICY "Users can manage fix prompts for own projects" 
  ON public.fix_prompts FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = fix_prompts.project_id AND projects.user_id = auth.uid())
  );

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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.re_audits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage re_audits of own projects" ON public.re_audits;
CREATE POLICY "Users can manage re_audits of own projects" 
  ON public.re_audits FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = re_audits.project_id AND projects.user_id = auth.uid())
  );

-- ==============================================================================
-- 8. PRODUCTION READINESS & SHARING
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.production_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_key TEXT NOT NULL,
  title TEXT NOT NULL,
  is_checked BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, item_key)
);

ALTER TABLE public.production_checklists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage production_checklists of own projects" ON public.production_checklists;
CREATE POLICY "Users can manage production_checklists of own projects" 
  ON public.production_checklists FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = production_checklists.project_id AND projects.user_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS public.project_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage project_shares of own projects" ON public.project_shares;
CREATE POLICY "Users can manage project_shares of own projects" 
  ON public.project_shares FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_shares.project_id AND projects.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Public read-only access for active share tokens" ON public.project_shares;
CREATE POLICY "Public read-only access for active share tokens" 
  ON public.project_shares FOR SELECT 
  USING (
    is_active = true AND (expires_at IS NULL OR expires_at > now())
  );

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

ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read templates" ON public.project_templates;
CREATE POLICY "Authenticated users can read templates" 
  ON public.project_templates FOR SELECT 
  USING (auth.role() = 'authenticated');

-- ==============================================================================
-- 9. LEGACY SITELENS AUDIT TABLES
-- ==============================================================================
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
  scoring_version TEXT DEFAULT 'v1',
  favicon_url TEXT,
  desktop_screenshot_url TEXT,
  mobile_screenshot_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own legacy audits" ON public.audits;
CREATE POLICY "Users can manage own legacy audits" 
  ON public.audits FOR ALL 
  USING (auth.uid() = user_id);

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

ALTER TABLE public.audit_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own legacy audit pages" ON public.audit_pages;
CREATE POLICY "Users can manage own legacy audit pages" 
  ON public.audit_pages FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.audits WHERE audits.id = audit_pages.audit_id AND audits.user_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS public.audit_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  page_id UUID REFERENCES public.audit_pages(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('seo', 'performance', 'accessibility', 'ux', 'trust', 'conversion')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence TEXT NOT NULL,
  impact TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_issues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own legacy audit issues" ON public.audit_issues;
CREATE POLICY "Users can manage own legacy audit issues" 
  ON public.audit_issues FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.audits WHERE audits.id = audit_issues.audit_id AND audits.user_id = auth.uid())
  );

-- ==============================================================================
-- 10. INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_stages_project_id ON public.project_stages(project_id);
CREATE INDEX IF NOT EXISTS idx_discovery_qna_project_id ON public.discovery_qna(project_id);
CREATE INDEX IF NOT EXISTS idx_research_docs_project_id ON public.research_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_user_journeys_project_id ON public.user_journeys(project_id);
CREATE INDEX IF NOT EXISTS idx_product_specs_project_id ON public.product_specs(project_id);
CREATE INDEX IF NOT EXISTS idx_design_specs_project_id ON public.design_specs(project_id);
CREATE INDEX IF NOT EXISTS idx_architecture_docs_project_id ON public.architecture_docs(project_id);
CREATE INDEX IF NOT EXISTS idx_security_plans_project_id ON public.security_plans(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_discussions_project_id ON public.agent_discussions(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_decisions_project_id ON public.agent_decisions(project_id);
CREATE INDEX IF NOT EXISTS idx_adrs_project_id ON public.adrs(project_id);
CREATE INDEX IF NOT EXISTS idx_prompts_project_id ON public.prompts(project_id);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_prompt_id ON public.prompt_versions(prompt_id);
CREATE INDEX IF NOT EXISTS idx_build_sessions_project_id ON public.build_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_audits_project_id ON public.project_audits(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_findings_project_id ON public.audit_findings(project_id);
CREATE INDEX IF NOT EXISTS idx_fix_prompts_finding_id ON public.fix_prompts(finding_id);
CREATE INDEX IF NOT EXISTS idx_re_audits_project_id ON public.re_audits(project_id);
CREATE INDEX IF NOT EXISTS idx_production_checklists_project_id ON public.production_checklists(project_id);
CREATE INDEX IF NOT EXISTS idx_project_shares_token ON public.project_shares(share_token);

-- ==============================================================================
-- 11. STARTER TEMPLATES SEED DATA
-- ==============================================================================
INSERT INTO public.project_templates (name, description, product_type, target_audience, problem_statement, raw_idea, coding_environment, tech_stack)
VALUES 
(
  'B2B SaaS Analytics & Intelligence Platform',
  'Multi-tenant subscription SaaS with analytics dashboard, team permissions, and AI synthesis.',
  'SaaS',
  'Product Managers, Data Leads, and Engineering Managers',
  'Teams struggle to connect qualitative user insights with quantitative telemetry data in one place.',
  'An intelligence dashboard where teams connect mixpanel/posthog data and get AI-generated UX improvements.',
  'Cursor',
  'Next.js 15 App Router, Supabase Postgres & Auth, Tailwind CSS, Recharts'
),
(
  'Two-Sided Service Marketplace',
  'Buyer/seller platform with booking management, trust verification, and direct messaging.',
  'Marketplace',
  'Freelance Consultants and SMB Clients',
  'SMBs waste hours vetting trustworthy technical consultants with proven track records.',
  'A verified marketplace connecting niche AI consultants with early-stage founders.',
  'Cursor',
  'Next.js 15, Supabase, Tailwind CSS, Lucide Icons'
),
(
  'AI Copilot & Workflow Automation Tool',
  'Internal productivity tool with streaming LLM responses, prompt versioning, and document parsing.',
  'Internal Tool',
  'Operations and Support Teams',
  'Customer support teams spend 40% of time rewriting repetitive complex technical explanations.',
  'An AI co-pilot that drafts accurate ticket replies by referencing internal documentation.',
  'Antigravity',
  'Next.js 15, Supabase pgvector, Google Gemini API, Tailwind CSS'
)
ON CONFLICT DO NOTHING;
