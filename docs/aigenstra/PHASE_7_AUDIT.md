# Phase 7 Audit — Project Audit + Findings + Evidence

> Status: **AUDIT COMPLETE — AWAITING REVIEW BEFORE IMPLEMENTATION**  
> Date: 2026-10-08  
> Phase: 7 (Audit Engine, Evidence-Backed Findings, Fix Tasks, Prompt Compiler Handoff)

---

## 1. Executive Summary

Phase 6 connected Aigenstra to the actual repository, establishing **implementation intelligence** (file inventory, route mapping, framework/database/auth detectors, symbol indexing, bounded chunking, and drift observation).

Phase 7 introduces Aigenstra's **Audit Engine**. Its purpose is to answer:
> **"Does the actual implementation match what the product is supposed to do?"**

### The Three Realities of Aigenstra
1. **PRODUCT TRUTH**: What the user wants and specified (Discovery Q&A, Software Blueprint, User Journeys, Feature specs).
2. **PLANNED ARCHITECTURE**: What the engineering plan specified (Engineering Blueprint, Build Map, DB entities, auth contracts).
3. **ACTUAL IMPLEMENTATION**: What the codebase actually contains (Phase 6 Repository Snapshot, detected routes, symbols, chunks).

The Audit Engine compares these three realities, collects concrete evidence, categorizes findings, tracks requirement coverage, and compiles targeted fix prompts via the existing Phase 5 Prompt Compiler.

### Non-Negotiable Boundary
**Aigenstra is a prompt builder, NOT an app builder.**  
The Audit Engine **never modifies source code, never auto-commits, and never auto-deploys.**  
It produces evidence-backed findings and compiles targeted fix prompts that the user brings to their external coding agent.

---

## 2. Current State & Legacy Audit Gaps

### Current Architecture Inspection

| Component | Current State in Codebase | Phase 7 Requirement |
|---|---|---|
| **Audit Service** (`lib/ai/project-audit.ts`) | Single monolithic Gemini call sending pasted code snippets or dummy strings. Returns hardcoded scores (`product: 85, ux: 80...`). | **Replace with layered deterministic + targeted semantic pipeline.** No fake percentages (Rule 70). |
| **Audit Routes** (`app/api/projects/[id]/audit/route.ts`) | Legacy endpoints accepting raw un-chunked context strings. | **Accept audit scope**, link to `repository_snapshots.id`, execute deterministic checks first. |
| **Audit UI** (`app/(dashboard)/projects/[id]/audit/page.tsx`) | Legacy view showing 9 arbitrary score badges and a basic code input box. | **Modern single-page responsive audit hub**: executive status, evidence cards, expandable technical details, fix prompt modal. |
| **Fix Generation** (`lib/ai/project-audit.ts#generateDynamicFixPrompt`) | Generic 4-point template string unrelated to real code chunks. | **Full integration with Phase 5 Prompt Compiler** (`lib/ai/prompt-compiler.ts`): injects actual code chunks, evidence, constraints, and architecture preservation rules. |
| **Requirement Traceability** | None. Findings are not mapped to Blueprint features or user journeys. | **Full traceability**: every finding links to `source_requirement` and tracks coverage (`VERIFIED`, `PARTIALLY_SUPPORTED`, `MISSING`, `CONFLICTING`). |

---

## 3. Available Phase 6 Repository Intelligence

Phase 6 provides rich structured inputs that the Audit Engine will consume:

1. **Repository Snapshot** (`repository_snapshots`):
   - `manifest.architecture`: Framework, database, authentication, UI library, languages with confidence levels (`CONFIRMED_BY_SOURCE`).
   - `manifest.routes`: Mapped pages, APIs, layouts, and middleware.
   - `manifest.featureMap`: Mapped application areas.
2. **File Inventory** (`repository_files`):
   - File path, extension, type (`SOURCE`, `COMPONENT`, `ROUTE`, `API`, `DATABASE`, `CONFIG`, `TEST`), importance, and secret sensitivity.
3. **Symbol Index** (`repository_symbols`):
   - Exported functions, React components, hooks, schemas, API route handlers with start/end lines and dependencies.
4. **Structural Code Chunks** (`repository_chunks`):
   - Redacted, bounded snippets (< 400 tokens) with line numbers, ready for targeted semantic checks without token waste.
5. **Drift Observations** (`lib/repository/drift.ts`):
   - Pre-computed Planned vs. Actual stack discrepancies, unbuilt blueprint features, and duplicate system warnings.

---

## 4. Multi-Dimensional Audit Scope

The Audit Engine evaluates across 13 core dimensions:

1. **PRODUCT**: Does implementation support intended product capabilities and feature boundaries?
2. **UX**: Does user flow reasonably match the designed user journey (states, feedback, transitions)?
3. **UI**: Are required screens, interface states (loading, empty, error), and hierarchy present?
4. **FRONTEND**: Are component boundaries, client state handling, and responsive behaviors coherent?
5. **BACKEND**: Does implementation support server-side business logic and data validation?
6. **API**: Do endpoints exist, follow planned contracts, and enforce payload validation?
7. **DATABASE**: Does schema support planned entities, relations, ownership, and RLS policies?
8. **AUTHENTICATION**: Does identity flow match plan (sign-up, login, session, protection)?
9. **AUTHORIZATION**: Are server-side ownership boundaries enforced (e.g. IDOR defense)?
10. **SECURITY**: Obvious vulnerabilities, exposed secrets, unvalidated client inputs.
11. **PERFORMANCE**: Obvious architectural bottlenecks (unindexed queries, client waterfall requests).
12. **ACCESSIBILITY**: Semantic HTML, labels, keyboard interaction, state communication.
13. **TESTING**: Concrete test coverage evidence for critical business workflows.

---

## 5. Audit Engine Architecture & Pipeline

To maintain zero unnecessary token consumption and strict evidence integrity, the Audit Engine follows a strict **Deterministic First, Semantic Second** sequence:

```
AUDIT SCOPE (FULL | PRODUCT | SECURITY | UX | ENGINEERING | TESTING)
                      ↓
EXTRACT PRODUCT & ENGINEERING REQUIREMENTS (Blueprint, Entities, Journeys)
                      ↓
MAP REQUIREMENTS TO REPOSITORY AREAS (Feature Map, Routes, Symbols)
                      ↓
STAGE 1: DETERMINISTIC CHECKS (Zero AI Tokens)
  • Route & Page existence checks
  • Schema & Entity definition presence
  • Auth middleware & route protection patterns
  • Test suite file detection
  • Secret & config exposure regex checks
                      ↓
STAGE 2: TARGETED SEMANTIC CHECKS (Smallest Bounded Chunks)
  • Ownership & Authorization enforcement analysis
  • Workflow state completeness (empty/error/loading)
  • Business rule satisfaction
                      ↓
EVIDENCE COLLECTION & VALIDATION
  • Strict Evidence Rule: Never invent code paths or vulnerabilities
  • State: VERIFIED | PASS_WITH_NOTES | NEEDS_REVIEW | ISSUE | CRITICAL | NOT_VERIFIABLE
  • Confidence: HIGH | MEDIUM | LOW
                      ↓
DEDUPLICATION & ROOT CAUSE CORRELATION
                      ↓
AUDIT REPORT & REQUIREMENT COVERAGE AGGREGATION
```

---

## 6. Finding & Evidence Model

Every finding adheres to a strict schema comparing **Expected vs. Observed**:

```typescript
export interface AuditFinding {
  id: string;
  projectId: string;
  auditId: string;
  findingCode: string; // e.g., "AUTH-001", "UX-003", "DATA-002"
  category: AuditCategory;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  status: "VERIFIED" | "PASS_WITH_NOTES" | "NEEDS_REVIEW" | "ISSUE" | "CRITICAL" | "NOT_VERIFIABLE" | "NOT_APPLICABLE";
  title: string;
  summary: string; // Layer 1: Simple explanation for vibe coders
  description: string; // Layer 2: Technical detail
  impact: string; // Real-world consequence if unaddressed
  evidence: {
    filePath?: string;
    symbolName?: string;
    route?: string;
    lineRange?: [number, number];
    snippet?: string; // Always redacted of secrets
    blueprintRef?: string;
    engineeringRef?: string;
  };
  expectedBehavior: string; // What the Blueprint / Spec requires
  observedBehavior: string; // What the codebase appears to do
  recommendation: string; // Smallest sensible fix
  verificationCriteria: string[]; // How to prove the fix worked
  confidence: "HIGH" | "MEDIUM" | "LOW";
  affectedFeature?: string;
  affectedScreen?: string;
  affectedWorkflow?: string;
  fixStatus: "OPEN" | "FIX_PROMPT_READY" | "HANDED_OFF" | "AWAITING_VERIFICATION";
  userOverride?: {
    action: "DISMISSED" | "MARKED_NA" | "MANUAL_REVIEW";
    rationale: string;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

---

## 7. Fix Prompt Foundation (Prompt Compiler Integration)

Fix prompts will **not** use a detached prompt generator. Instead, they leverage the existing **Phase 5 Prompt Compiler** (`lib/ai/prompt-compiler.ts`):

1. **Input Payload**:
   - `objective`: Fix specific audit finding (`AUTH-001: Enforce customer ownership check`)
   - `problem_details`: Concrete observed evidence + gap description
   - `expected_behavior`: Planned behavior from Blueprint
   - `target_files`: Exact file path and symbol range from finding evidence
   - `code_context`: Structural chunk from `repository_chunks`
   - `constraints`:
     - **Preserve existing architecture**: Do not introduce duplicate libraries or rewrite working systems
     - **Maintain database RLS & existing auth middleware**
     - **Zero regression on existing test suite**
   - `acceptance_criteria`: Derived from `verificationCriteria`
2. **Output**:
   - 12-section production prompt formatted for the user's selected coding agent (Google Antigravity, Claude Code, Cursor, Windsurf, etc.).

---

## 8. Database Migration Plan (`20261008100000_phase7_audit_engine.sql`)

1. **Extend `project_audits`**:
   - Add `repository_snapshot_id UUID REFERENCES repository_snapshots(id)`
   - Add `blueprint_revision TEXT`, `engineering_revision TEXT`
   - Add `audit_scope TEXT NOT NULL DEFAULT 'FULL'`
   - Add `summary JSONB`, `coverage JSONB`, `warnings JSONB`
2. **Extend `audit_findings`**:
   - Add `audit_id UUID REFERENCES project_audits(id)`
   - Add `evidence JSONB NOT NULL DEFAULT '{}'::jsonb`
   - Add `expected_behavior TEXT`, `observed_behavior TEXT`
   - Add `source_requirement TEXT`, `verification_criteria JSONB DEFAULT '[]'::jsonb`
   - Add `confidence TEXT DEFAULT 'HIGH'`
   - Add `fix_status TEXT DEFAULT 'OPEN'`
   - Add `user_override JSONB`
3. **Create `audit_requirement_coverage`**:
   - Track coverage per Blueprint requirement (`VERIFIED`, `PARTIALLY_SUPPORTED`, `MISSING`, `CONFLICTING`, `UNABLE_TO_VERIFY`).
4. **Create `audit_fix_tasks`**:
   - Connects an audit finding to a remediation task and compiled prompt.
5. **Security & RLS**:
   - All tables enforce strict tenant isolation (`projects.user_id = auth.uid()`).
   - Idempotent `DROP POLICY IF EXISTS` guards prevent migration conflicts.

---

## 9. Security, Safety & Trust Boundaries

1. **Untrusted Codebase Boundary**:
   - Connected repository files are untrusted data.
   - Code comments, READMEs, and test strings cannot override system directives or security boundaries.
2. **Mandatory Redaction**:
   - Secrets are scrubbed via `sanitizeUntrustedData()` and `redactSecrets()` before any chunk enters audit context.
3. **No False Certification (Rule 71)**:
   - Aigenstra will never say *"Your project is 100% secure"* or *"Production ready"*.
   - It will report: *"No issues identified within the audited scope."*
4. **No Fake Scores (Rule 70)**:
   - Replaces opaque percentage scores (e.g. `Security: 94%`) with concrete counts and evidence-backed severity items (e.g., `1 Critical Authorization Issue, 2 Medium State Gaps`).

---

## 10. Verification Strategy

1. **Deterministic Unit Tests**:
   - Validate route and entity detection against synthetic repository snapshots.
   - Verify expected vs. observed diffing logic.
2. **Evidence Redaction Tests**:
   - Ensure secrets never appear in finding snippets or generated fix prompts.
3. **Fix Prompt Compilation Tests**:
   - Verify Prompt Compiler produces structured 12-section fix prompts containing exact file paths, evidence, and acceptance criteria.
4. **TypeScript & Build Verification**:
   - `npm run typecheck` passes with 0 errors.
   - `npm run build` succeeds cleanly.
