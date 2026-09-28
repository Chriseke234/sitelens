-- Aigenstra V2 - AI Product Engineering Workspace Database Schema Migration
-- Migration Name: 20260927000000_aigenstra_v2.sql

-- 1. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'idea' CHECK (stage IN ('idea', 'researching', 'planning', 'designing', 'building', 'almost_finished', 'launched')),
  coding_environment TEXT NOT NULL DEFAULT 'Cursor' CHECK (coding_environment IN ('Antigravity', 'Cursor', 'Claude Code', 'Replit', 'Lovable', 'v0', 'Other')),
  tech_stack TEXT,
  goal TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'build' CHECK (mode IN ('build', 'audit')),
  repo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. DISCOVERY QNA TABLE
CREATE TABLE IF NOT EXISTS public.discovery_qna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  category TEXT DEFAULT 'general',
  step_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. RESEARCH DOCUMENTS TABLE
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

-- 4. USER JOURNEYS TABLE
CREATE TABLE IF NOT EXISTS public.user_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  persona TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { stepNumber, title, userGoal, userAction, systemResponse, friction, errorStates, alternativePaths, security }
  happy_path JSONB NOT NULL DEFAULT '[]'::jsonb,
  edge_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
  failure_paths JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. PRODUCT SPECS TABLE
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

-- 6. DESIGN & UX SPECS TABLE
CREATE TABLE IF NOT EXISTS public.design_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sitemap JSONB NOT NULL DEFAULT '[]'::jsonb,
  user_flows JSONB NOT NULL DEFAULT '[]'::jsonb,
  pages JSONB NOT NULL DEFAULT '[]'::jsonb,
  components JSONB NOT NULL DEFAULT '[]'::jsonb,
  responsive_reqs JSONB NOT NULL DEFAULT '[]'::jsonb,
  accessibility_reqs JSONB NOT NULL DEFAULT '[]'::jsonb,
  states JSONB NOT NULL DEFAULT '[]'::jsonb, -- empty, loading, error, success states
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. ARCHITECTURE DOCS TABLE
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

-- 8. SECURITY PLANS TABLE
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

-- 9. AGENT DISCUSSIONS & DECISIONS TABLES
CREATE TABLE IF NOT EXISTS public.agent_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'closed')),
  agent_messages JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { agentId, agentName, role, content, timestamp }
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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

-- 10. PROMPTS & PROMPT VERSIONS TABLES
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. AUDIT FINDINGS & FIX PROMPTS TABLES
CREATE TABLE IF NOT EXISTS public.project_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'analyzing', 'completed', 'failed')),
  readiness_scores JSONB NOT NULL DEFAULT '{}'::jsonb, -- product, ux, architecture, database, api, security, testing, accessibility, performance, seo
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.audit_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  project_audit_id UUID REFERENCES public.project_audits(id) ON DELETE CASCADE,
  finding_code TEXT NOT NULL, -- e.g. SEC-001, UX-004
  category TEXT NOT NULL CHECK (category IN ('product', 'ux', 'frontend', 'backend', 'security', 'performance', 'seo', 'accessibility', 'code_quality')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  title TEXT NOT NULL,
  simple_explanation TEXT NOT NULL, -- Layer 1: What this means for vibe coders
  technical_explanation TEXT NOT NULL, -- Layer 2: Deep technical details
  evidence TEXT NOT NULL,
  potential_impact TEXT NOT NULL,
  recommended_fix TEXT NOT NULL,
  related_files JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'partially_resolved', 'unable_to_verify')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_discovery_qna_project_id ON public.discovery_qna(project_id);
CREATE INDEX IF NOT EXISTS idx_research_docs_project_id ON public.research_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_user_journeys_project_id ON public.user_journeys(project_id);
CREATE INDEX IF NOT EXISTS idx_product_specs_project_id ON public.product_specs(project_id);
CREATE INDEX IF NOT EXISTS idx_design_specs_project_id ON public.design_specs(project_id);
CREATE INDEX IF NOT EXISTS idx_architecture_docs_project_id ON public.architecture_docs(project_id);
CREATE INDEX IF NOT EXISTS idx_security_plans_project_id ON public.security_plans(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_discussions_project_id ON public.agent_discussions(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_decisions_project_id ON public.agent_decisions(project_id);
CREATE INDEX IF NOT EXISTS idx_prompts_project_id ON public.prompts(project_id);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_prompt_id ON public.prompt_versions(prompt_id);
CREATE INDEX IF NOT EXISTS idx_project_audits_project_id ON public.project_audits(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_findings_project_id ON public.audit_findings(project_id);
CREATE INDEX IF NOT EXISTS idx_fix_prompts_finding_id ON public.fix_prompts(finding_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_qna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.architecture_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fix_prompts ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR PROJECTS
DO $$ BEGIN
  CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- POLICIES FOR PROJECT SUB-TABLES (CHECKING PROJECT OWNERSHIP)
DO $$ BEGIN
  CREATE POLICY "Users can view discovery QnA for own projects" ON public.discovery_qna FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = discovery_qna.project_id AND projects.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage discovery QnA for own projects" ON public.discovery_qna FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = discovery_qna.project_id AND projects.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view research docs for own projects" ON public.research_documents FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = research_documents.project_id AND projects.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage research docs for own projects" ON public.research_documents FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = research_documents.project_id AND projects.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage user journeys for own projects" ON public.user_journeys FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = user_journeys.project_id AND projects.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage product specs for own projects" ON public.product_specs FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = product_specs.project_id AND projects.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage design specs for own projects" ON public.design_specs FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = design_specs.project_id AND projects.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage architecture docs for own projects" ON public.architecture_docs FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = architecture_docs.project_id AND projects.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage security plans for own projects" ON public.security_plans FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = security_plans.project_id AND projects.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage agent discussions for own projects" ON public.agent_discussions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = agent_discussions.project_id AND projects.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage agent decisions for own projects" ON public.agent_decisions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = agent_decisions.project_id AND projects.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage prompts for own projects" ON public.prompts FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = prompts.project_id AND projects.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage prompt versions for own projects" ON public.prompt_versions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.prompts JOIN public.projects ON projects.id = prompts.project_id WHERE prompts.id = prompt_versions.prompt_id AND projects.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage project audits for own projects" ON public.project_audits FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_audits.project_id AND projects.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage audit findings for own projects" ON public.audit_findings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = audit_findings.project_id AND projects.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage fix prompts for own projects" ON public.fix_prompts FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = fix_prompts.project_id AND projects.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
