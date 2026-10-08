-- =========================================================
-- AIGENSTRA PHASE 6: PROJECT CONNECTION & REPOSITORY INTELLIGENCE
-- Migration: 20261008000000_phase6_repository_intelligence.sql
-- =========================================================

-- 1. Project Connections (source configuration: folder, archive, github url, etc.)
CREATE TABLE IF NOT EXISTS public.project_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('UPLOAD_FOLDER', 'UPLOAD_ARCHIVE', 'GIT_PUBLIC', 'GIT_PROVIDER', 'LOCAL_PATH')),
  source_reference TEXT, -- repository name, URL, or archive filename
  branch TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISCONNECTED', 'ERROR')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Repository Snapshots (immutable inspection run per revision/upload)
CREATE TABLE IF NOT EXISTS public.repository_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.project_connections(id) ON DELETE SET NULL,
  revision TEXT, -- git commit SHA, archive hash, or timestamp fingerprint
  status TEXT NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'ANALYZING', 'READY', 'PARTIAL', 'FAILED', 'STALE')),
  file_count INTEGER NOT NULL DEFAULT 0,
  analyzed_file_count INTEGER NOT NULL DEFAULT 0,
  ignored_file_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
  errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  manifest JSONB NOT NULL DEFAULT '{}'::jsonb,
  project_map JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Repository Files (file inventory metadata per snapshot)
CREATE TABLE IF NOT EXISTS public.repository_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  snapshot_id UUID NOT NULL REFERENCES public.repository_snapshots(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  extension TEXT NOT NULL,
  size_bytes INTEGER NOT NULL DEFAULT 0,
  sha256_hash TEXT,
  file_type TEXT NOT NULL DEFAULT 'UNKNOWN',
  language TEXT,
  importance TEXT NOT NULL DEFAULT 'MEDIUM',
  sensitivity TEXT NOT NULL DEFAULT 'NONE' CHECK (sensitivity IN ('NONE', 'POSSIBLE_SECRET', 'CONFIG_SENSITIVE', 'CONFIRMED_SECRET')),
  is_ignored BOOLEAN NOT NULL DEFAULT false,
  ignore_reason TEXT,
  analysis_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (analysis_status IN ('PENDING', 'ANALYZED', 'SKIPPED', 'FAILED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Repository Symbols (extracted structural code symbols)
CREATE TABLE IF NOT EXISTS public.repository_symbols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  snapshot_id UUID NOT NULL REFERENCES public.repository_snapshots(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES public.repository_files(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL, -- 'FUNCTION', 'COMPONENT', 'HOOK', 'ROUTE_HANDLER', 'CLASS', 'INTERFACE', 'TYPE', 'SERVICE', 'SCHEMA', 'CONSTANT'
  start_line INTEGER,
  end_line INTEGER,
  is_exported BOOLEAN NOT NULL DEFAULT false,
  signature TEXT,
  documentation TEXT,
  dependencies JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Repository Chunks (minimal structural bounded snippets, redacted & token-counted)
CREATE TABLE IF NOT EXISTS public.repository_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  snapshot_id UUID NOT NULL REFERENCES public.repository_snapshots(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES public.repository_files(id) ON DELETE CASCADE,
  symbol_id UUID REFERENCES public.repository_symbols(id) ON DELETE SET NULL,
  file_path TEXT NOT NULL,
  chunk_type TEXT NOT NULL, -- 'COMPONENT', 'FUNCTION', 'ROUTE_HANDLER', 'SCHEMA', 'TYPE', 'CONFIG_SNIPPET', 'DOCUMENTATION'
  start_line INTEGER NOT NULL,
  end_line INTEGER NOT NULL,
  content TEXT NOT NULL, -- Always redacted of secrets before storage
  character_count INTEGER NOT NULL DEFAULT 0,
  estimated_tokens INTEGER NOT NULL DEFAULT 0,
  content_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Repository Relations (import and reference edges between files/symbols)
CREATE TABLE IF NOT EXISTS public.repository_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  snapshot_id UUID NOT NULL REFERENCES public.repository_snapshots(id) ON DELETE CASCADE,
  source_path TEXT NOT NULL,
  target_path TEXT NOT NULL,
  relation_type TEXT NOT NULL, -- 'IMPORTS', 'CALLS', 'EXPOSES_ROUTE', 'USES_SCHEMA', 'MOUNTS_COMPONENT'
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Repository Feature Map (mapping product blueprint features & screens to actual codebase areas)
CREATE TABLE IF NOT EXISTS public.repository_feature_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  snapshot_id UUID NOT NULL REFERENCES public.repository_snapshots(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  feature_title TEXT NOT NULL,
  code_area TEXT NOT NULL,
  related_paths JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence TEXT NOT NULL DEFAULT 'STRONGLY_INFERRED' CHECK (confidence IN ('CONFIRMED_BY_SOURCE', 'STRONGLY_INFERRED', 'POSSIBLY_INFERRED', 'UNKNOWN')),
  observation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Task Context Overrides (per-task manual file inclusion/exclusion/importance by advanced user)
CREATE TABLE IF NOT EXISTS public.task_context_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  override_action TEXT NOT NULL CHECK (override_action IN ('FORCE_INCLUDE', 'FORCE_EXCLUDE', 'MARK_IMPORTANT')),
  user_rationale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (project_id, task_id, file_path)
);

-- =========================================================
-- INDEXES FOR PERFORMANCE
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_project_connections_project ON public.project_connections(project_id);
CREATE INDEX IF NOT EXISTS idx_repo_snapshots_project ON public.repository_snapshots(project_id);
CREATE INDEX IF NOT EXISTS idx_repo_snapshots_active ON public.repository_snapshots(project_id, is_active);
CREATE INDEX IF NOT EXISTS idx_repo_files_snapshot ON public.repository_files(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_repo_files_proj_path ON public.repository_files(project_id, path);
CREATE INDEX IF NOT EXISTS idx_repo_symbols_snapshot ON public.repository_symbols(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_repo_symbols_file ON public.repository_symbols(file_id);
CREATE INDEX IF NOT EXISTS idx_repo_symbols_name ON public.repository_symbols(snapshot_id, name);
CREATE INDEX IF NOT EXISTS idx_repo_chunks_snapshot ON public.repository_chunks(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_repo_chunks_file ON public.repository_chunks(file_id);
CREATE INDEX IF NOT EXISTS idx_repo_relations_snapshot ON public.repository_relations(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_repo_feature_map_snapshot ON public.repository_feature_map(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_task_context_overrides_task ON public.task_context_overrides(project_id, task_id);

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================
ALTER TABLE public.project_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repository_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repository_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repository_symbols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repository_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repository_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repository_feature_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_context_overrides ENABLE ROW LEVEL SECURITY;

-- 1. project_connections
DROP POLICY IF EXISTS "Users manage connections of own projects" ON public.project_connections;
CREATE POLICY "Users manage connections of own projects"
  ON public.project_connections FOR ALL
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_connections.project_id AND projects.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_connections.project_id AND projects.user_id = auth.uid()));

-- 2. repository_snapshots
DROP POLICY IF EXISTS "Users manage snapshots of own projects" ON public.repository_snapshots;
CREATE POLICY "Users manage snapshots of own projects"
  ON public.repository_snapshots FOR ALL
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = repository_snapshots.project_id AND projects.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = repository_snapshots.project_id AND projects.user_id = auth.uid()));

-- 3. repository_files
DROP POLICY IF EXISTS "Users manage files of own projects" ON public.repository_files;
CREATE POLICY "Users manage files of own projects"
  ON public.repository_files FOR ALL
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = repository_files.project_id AND projects.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = repository_files.project_id AND projects.user_id = auth.uid()));

-- 4. repository_symbols
DROP POLICY IF EXISTS "Users manage symbols of own projects" ON public.repository_symbols;
CREATE POLICY "Users manage symbols of own projects"
  ON public.repository_symbols FOR ALL
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = repository_symbols.project_id AND projects.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = repository_symbols.project_id AND projects.user_id = auth.uid()));

-- 5. repository_chunks
DROP POLICY IF EXISTS "Users manage chunks of own projects" ON public.repository_chunks;
CREATE POLICY "Users manage chunks of own projects"
  ON public.repository_chunks FOR ALL
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = repository_chunks.project_id AND projects.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = repository_chunks.project_id AND projects.user_id = auth.uid()));

-- 6. repository_relations
DROP POLICY IF EXISTS "Users manage relations of own projects" ON public.repository_relations;
CREATE POLICY "Users manage relations of own projects"
  ON public.repository_relations FOR ALL
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = repository_relations.project_id AND projects.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = repository_relations.project_id AND projects.user_id = auth.uid()));

-- 7. repository_feature_map
DROP POLICY IF EXISTS "Users manage feature map of own projects" ON public.repository_feature_map;
CREATE POLICY "Users manage feature map of own projects"
  ON public.repository_feature_map FOR ALL
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = repository_feature_map.project_id AND projects.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = repository_feature_map.project_id AND projects.user_id = auth.uid()));

-- 8. task_context_overrides
DROP POLICY IF EXISTS "Users manage task overrides of own projects" ON public.task_context_overrides;
CREATE POLICY "Users manage task overrides of own projects"
  ON public.task_context_overrides FOR ALL
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = task_context_overrides.project_id AND projects.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = task_context_overrides.project_id AND projects.user_id = auth.uid()));

