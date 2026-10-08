# Phase 6 Audit — Project Connection + Repository Intelligence

> Status: **AUDIT COMPLETE — AWAITING REVIEW BEFORE IMPLEMENTATION**
> Date: 2026-10-08

Phase 6 moves Aigenstra from *product intelligence* ("what the software should be") to
*product intelligence + implementation intelligence* ("what the software actually is").
Aigenstra still does **not** build or modify the user's application.

---

## 1. Current Project Architecture (as inspected)

| Layer | Implementation | Notes |
|---|---|---|
| Framework | Next.js 15 App Router, React 19, TypeScript | `app/(dashboard)/projects/[id]/*` workspace |
| Styling | Tailwind 3.4, Lucide SVG icons | No component library beyond local `components/ui` |
| Backend | Supabase (Postgres + Auth + Storage), `@supabase/ssr` | Server client in `lib/supabase/server.ts` |
| AI provider | Gemini 2.5 Flash via raw `fetch` in each engine | `lib/ai/client.ts` only exposes the key — **no shared provider abstraction** |
| Dependencies | next, react, supabase, zod, cheerio, lucide, clsx, tailwind-merge | Lean — no zip / parser / vector libs |
| Tests | Custom runner `lib/audit/__tests__/run-tests.ts` | No Jest/Vitest |

### Phase 1–5 storage map (important — JSON-blob heavy)

| Concept | Where it lives today |
|---|---|
| Project | `projects` (has unused `repo_url`, `tech_stack` text) |
| Software Blueprint | `product_specs.problem_statement` (stringified JSON) |
| Engineering Blueprint | `architecture_docs.frontend` (JSONB) |
| Build Map | `architecture_docs` JSONB |
| Tasks (`AigenstraTask[]`) | `architecture_docs.storage.tasks` (JSONB array) |
| Context Packs | `architecture_docs.integrations.context_packs[taskId]` (JSONB map) |
| Compiled prompts | `prompts` + `prompt_versions` |
| Audit findings (pre-existing "Phase 6-7" scaffold) | `project_audits`, `audit_findings` |

All Aigenstra tables use RLS of the form `EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())`.

---

## 2. Current Context System

- **Context Engine** (`lib/ai/context-engine.ts`): builds a `ContextPack` from `AigenstraTask` + `SoftwareBlueprint` + `EngineeringBlueprint`. AI path with deterministic fallback.
- `ContextPackItem.relevance`: `DIRECT | SUPPORTING | DEPENDENCY | CONSTRAINT | SECURITY`.
- Exclusions in the deterministic path are **hard-coded** (admin, integrations, SEO) — not derived from the project.
- Staleness: `isStale` / `staleReason` fields exist but nothing sets them from real change events.
- **Prompt Compiler** (`lib/ai/prompt-compiler.ts`): 12 sections, agent adapters, optimizer.
  - `PROJECT_CONTEXT` **hard-codes** "Next.js 15 … Supabase" regardless of the user's real stack.
  - `CURRENT_STATE` is a generic placeholder ("Active project baseline with authentication…").
  - These are the two natural injection points for repository intelligence.
- **Prompt route** (`tasks/[taskId]/prompt`) passes raw DB rows (`product_specs` row, `architecture_docs` row) as `SoftwareBlueprint` / `EngineeringBlueprint` — type-unsafe; should reuse the loader used by the context route.

---

## 3. Existing File / Project Import Capabilities

| Capability | Exists? | Notes |
|---|---|---|
| `projects.repo_url` column | Yes | Never read or used for inspection |
| Project audit "code context" | Partial | `POST /api/projects/[id]/audit` accepts a pasted `codeContext` string; `sanitizeUntrustedData()` in `lib/ai/project-audit.ts` does basic redaction |
| Media upload | Yes | Images only, 10 MB, Supabase Storage bucket — not reusable for source trees |
| Zip/archive parsing | No | No dependency installed |
| Git provider OAuth | No | No GitHub App / OAuth app configured |
| Repository file model | No | |

**Conclusion:** no repository ingestion exists. The upload path must be built.

---

## 4. Repository Intelligence Gaps

1. No connection / source model.
2. No snapshot / revision model.
3. No file inventory, ignore rules, or sensitivity classification.
4. No framework / language / dependency detection.
5. No route / API / component / database / auth detection.
6. No symbol index, import graph, or structural code chunks.
7. No Planned-vs-Actual separation (blueprint is the only "truth").
8. No feature-to-code mapping.
9. Context Engine cannot select files or code sections.
10. Prompt Compiler assumes the stack instead of reading it.
11. Staleness is not relationship-aware.
12. No shared AI provider wrapper → every engine repeats raw Gemini `fetch` (not blocking, but Phase 6 will add a small shared helper rather than a 9th copy).

---

## 5. Required Additions

### 5.1 Data model (new migration `20261008000000_phase6_repository_intelligence.sql`)

| Table | Purpose |
|---|---|
| `project_connections` | One row per connected source (`UPLOAD_FOLDER`, `UPLOAD_ARCHIVE`, `GIT_PUBLIC` reserved, `GIT_PROVIDER` reserved). Status `ACTIVE / DISCONNECTED`. Supports multiple per project (frontend/backend/mobile) |
| `repository_snapshots` | Snapshot per analysis: revision (commit SHA or archive fingerprint), status `QUEUED / ANALYZING / READY / PARTIAL / FAILED / STALE`, counts, warnings, errors, `is_active`, manifest JSONB, project map JSONB |
| `repository_files` | File inventory: path, ext, size, sha256 hash, file_type, language, importance, sensitivity, ignored flag + reason, analysis status |
| `repository_symbols` | Functions, components, hooks, routes, types, classes, constants — with line ranges and export flag |
| `repository_chunks` | Structural code chunks (symbol-bounded) with redacted content, char count, token estimate, hash |
| `repository_relations` | Import / reference edges (`file → file`, `symbol → symbol`) |
| `repository_feature_map` | Blueprint feature/screen/entity → code areas, with confidence |
| `task_context_overrides` | Per-task include/exclude/important file or chunk overrides |

All tables: `project_id` FK with `ON DELETE CASCADE`, RLS via project ownership, indexes on `(snapshot_id)`, `(project_id, path)`.

### 5.2 Analyzer pipeline (modular — `lib/repository/`)

```
SOURCE → INGEST → INVENTORY → SAFETY FILTER → DETECTORS → FRAMEWORK ANALYZER
       → LANGUAGE ANALYZER → STRUCTURAL ANALYZER → MANIFEST + PROJECT MAP → PERSIST
```

| Module | Responsibility | AI? |
|---|---|---|
| `ingest/` | Normalize uploaded files to `{path, size, content?}` | No |
| `inventory.ts` | Classify type/language/importance, hash | No |
| `ignore-rules.ts` | Configurable exclusions (node_modules, .git, dist, build, .next, coverage, lockfiles, binaries) | No |
| `secrets.ts` | Sensitive-file detection + value redaction (`KEY=[REDACTED]`) | No |
| `detectors/` | Framework, language, package manager, database, auth, UI lib, testing, deployment | No |
| `analyzers/nextjs.ts` | App/Pages router routes, route groups, dynamic segments, layouts, route handlers + HTTP methods, middleware | No |
| `analyzers/generic-js.ts` | Express/Vite/React fallback | No |
| `analyzers/python.ts` (light) | Django/FastAPI detection only (extensible stub) | No |
| `languages/typescript.ts` | Regex/token-level symbol + import extraction (no compiler dependency) | No |
| `chunker.ts` | Symbol-bounded chunks with line ranges | No |
| `architecture.ts` | Actual architecture map + confidence (`CONFIRMED_BY_SOURCE / STRONGLY_INFERRED / POSSIBLY_INFERRED / UNKNOWN`) | No |
| `drift.ts` | Planned (Engineering Blueprint) vs Actual differences + duplicate-system warnings | No |
| `feature-map.ts` | Blueprint features/screens/entities → code areas (path/name token matching) | Optional AI for ambiguous areas only |
| `change-detection.ts` | Snapshot diff by hash (added/modified/deleted/renamed-by-hash) + affected areas | No |
| `retrieval.ts` | Task → file → symbol → chunk retrieval with layered relevance | Optional AI only as last resort |

**Static analysis first. AI is not called during baseline analysis by default.** AI is reserved for
area annotation / ambiguous feature mapping and is cached by file hash.

### 5.3 Context Engine extension (not rewrite)

- Add optional `repositoryContext` argument to `generateTaskContextPack`.
- Extend `ContextPack` with optional fields (backward-compatible):
  `repository?: { snapshotId, revision, files: RelevantFile[], chunks: RelevantChunk[], existingCapabilities[], warnings[] }`
  and `sourceVersions` for reproducibility.
- Extend `ContextPackItem.relevance` with `REFERENCE`; add `source: "Repository"` items.
- Relevance levels for files: `DIRECT / RELATED / DEPENDENCY / REFERENCE / IRRELEVANT / UNKNOWN` — always **per task**, never global.

### 5.4 Prompt Compiler extension (not rewrite)

- `PROJECT_CONTEXT`: use actual detected stack when a READY/PARTIAL snapshot exists; fall back to the current text otherwise.
- `CURRENT_STATE`: list existing capabilities ("Authentication already exists — Supabase Auth in `lib/supabase/*`, `middleware.ts`") and **"extend, don't rebuild"** instructions.
- `RELEVANT_CONTEXT`: append relevant files + small code excerpts (redacted), each with "why included".
- Add stale-snapshot warning and snapshot reference to the compiled prompt metadata.

### 5.5 UI

- New workspace tab **Project Intelligence** (`/projects/[id]/intelligence`) with sub-views:
  Overview (beginner summary) · Architecture (Planned vs Actual) · Routes & APIs · Data & Auth · Dependencies · Files (advanced) · Analysis history.
- Connection flow: "Connect your project" card with what/why/what-not, primary **Connect Project**, secondary **Analyze later**.
- Task drawer: "Project context Aigenstra found" panel with included files, why, compact excluded summary, include/exclude overrides.
- Prompt Studio: "What Aigenstra found in your project" + stale warning + Refresh.

---

## 6. Security Considerations

| Risk | Mitigation |
|---|---|
| Secrets in repo (`.env*`, `*.pem`, `id_rsa`, service-account JSON) | Detected by name **and** content patterns. Content of sensitive files is **never stored, never sent to AI**. Only key *names* kept (`API_KEY=[REDACTED]`) |
| Inline secrets in normal source | Redaction pass on every stored chunk (JWTs, `sk_live_`, `AKIA…`, `ghp_`, connection strings with passwords, PEM blocks, generic `secret/token/password = "…"`) |
| Prompt injection via README/comments | Repository text is wrapped as `<untrusted_repository_content>`; AI calls carry an explicit "data, not instructions" system rule; never concatenated into system instructions |
| Cross-project access | RLS on every new table **plus** explicit server-side `projects.user_id = user.id` check in every route (defense in depth — the existing context route currently relies on RLS alone) |
| Arbitrary code execution | No `npm install`, no scripts, no `eval`, no dynamic `import()` of user code. Pure string/static parsing |
| Zip-slip / path traversal | Normalize paths, reject `..`, absolute paths, drive letters, null bytes |
| Zip bombs / oversized uploads | Hard caps: total files, per-file size, total bytes; text-only content read |
| SSRF (future Git URL) | Allow-list `github.com` / `gitlab.com` hosts only; no arbitrary URL fetch in Phase 6 |
| Logging | Never log file contents; log counts and paths only |
| Manual override of sensitive file | Overrides cannot bypass redaction or sensitive exclusion |

---

## 7. Storage Considerations

- Store **metadata + symbols + redacted structural chunks**, not full raw files. Chunks cover only analyzable source/config/docs under size caps.
- Sensitive files: metadata only (path, size, "sensitive"), zero content.
- Binary/assets: metadata only.
- Retention: keep **active + 1 previous** snapshot by default; older snapshot rows deleted (cascade) unless referenced by a prompt version (prompt keeps snapshot ID + file hashes, which remain meaningful even if chunks are pruned).
- Postgres JSONB is adequate for manifest/project map. No vector extension in Phase 6.

## 8. Performance Risks

| Risk | Mitigation |
|---|---|
| Vercel request body limit (~4.5 MB) | Client-side filtering before upload; batched upload of text files; binaries never uploaded |
| Serverless timeout during analysis | Deterministic analyzers are linear-time regex passes; analysis split into ingest batches + finalize step |
| Large repos (thousands of files) | Caps (default 3,000 analyzable files, 512 KB per file); priority ordering (routes/api/db/auth first); `PARTIAL` status if caps hit |
| Re-analysis cost | SHA-256 per file; unchanged files reuse previous symbols/chunks |
| Row explosion | Only "meaningful" symbols (exported or top-level components/functions/types); chunks only for those |
| Retrieval latency | Indexed `(snapshot_id, path)`, `(snapshot_id, name)`; retrieval runs in-memory on the active snapshot index |

## 9. Connection Source Feasibility

| Source | Feasible now? | Decision |
|---|---|---|
| **Folder upload** (browser `webkitdirectory`) | Yes, zero dependencies | **Recommended primary** — ignore + secret filtering happens in the browser, so `.env` contents never leave the user's machine |
| **Archive upload (.zip)** | Yes with a zip reader | Needs either a small dependency (`fflate`) or a hand-written central-directory reader using Node `zlib` |
| **Public GitHub URL** | Yes via GitHub REST (tree + blobs), unauthenticated 60 req/h | Possible, but rate limits make it fragile for larger repos |
| **GitHub OAuth / App** | No credentials configured | Architecture reserved (`GIT_PROVIDER`), not built |

## 10. Migration Plan

1. Add new migration (additive only — no changes to existing tables except nullable `projects` columns are **not** needed).
2. Add Phase 6 types to `types/index.ts` (additive; optional fields on `ContextPack` / `CompiledPrompt`).
3. Build `lib/repository/*` (pure, testable, no DB access).
4. Build `lib/repository/store.ts` (DB persistence layer, server-only).
5. API routes under `app/api/projects/[id]/repository/*`.
6. Extend context engine + prompt compiler + their routes (backward-compatible: no snapshot → identical Phase 5 behaviour).
7. UI: Project Intelligence page + task/prompt panels + nav entry.
8. Tests for detectors, secrets, ignore rules, route detection, symbol extraction, retrieval, change detection.
9. `npm run typecheck`, `npm run build`, test runner.
10. Update `CURRENT_STATE.md`, `PROJECT_ARCHITECTURE.md` (new), `IMPLEMENTATION_PLAN.md`, `CHANGE_LOG.md`.

> **Pre-existing doc discrepancy:** `IMPLEMENTATION_PLAN.md` lists "Phase 6: Closed-Loop Audit Hub". That will be corrected to Phase 6 = Repository Intelligence, Phase 7 = Audit + Findings + Evidence.

## 11. Explicitly Out of Scope

Full audit engine, vulnerability scanning, security certification, automated fixes, autonomous coding,
source modification, GitHub ecosystem features, deployment, billing, collaboration, embeddings/vector search.
