# Phase 8 Architecture Audit: Re-Audit, Verification, Regression Detection & Project Health

**Date:** 2026-10-08  
**Scope:** Closing the Audit-Fix Loop without becoming an autonomous app editor  
**Status:** Audit Complete — Ready for Review

---

## 1. Executive Summary & Core Purpose

In Phases 1 through 7, Aigenstra established:
1. **Product Truth:** Idea extraction, adaptive discovery, and 13-section Software Blueprint.
2. **Planned Architecture:** 15-domain Engineering Blueprint, API contracts, and Build Map.
3. **Actual Codebase Intelligence:** Pure static repo analysis, route extraction, symbols, chunks, and drift detection.
4. **Project Audit Engine:** 13-dimension static & targeted semantic audit producing evidence-backed findings and tailored fix prompts.

However, the feedback loop remained open: after an external coding agent (Cursor, Claude Code, Antigravity, etc.) edits the codebase, the user currently lacks a disciplined, automated mechanism to answer three fundamental questions:
1. **Did the requested change actually fix the problem?**
2. **Did fixing one thing break something else (regression)?**
3. **What is the current, verifiable health of the project within the audited scope?**

Phase 8 implements **Re-Audit, Targeted Verification, Regression Detection, and Factual Project Health**.

---

## 2. Non-Negotiable Product Boundary

> **Aigenstra is a PROMPT BUILDER, NOT AN APP BUILDER.**

- Aigenstra **never** auto-edits code, auto-commits changes, or auto-deploys.
- Aigenstra **never** marks an issue `RESOLVED` merely because:
  - The user clicked "done" or says it's fixed.
  - A fix prompt was generated or copied.
  - The affected file was modified (file modification is not proof of correctness).
- Verification is **strictly evidence-backed**: comparing Original Evidence vs. Current Evidence vs. Expected Behavior.
- If evidence is inconclusive, Aigenstra explicitly marks the finding `UNABLE_TO_VERIFY` or `NEEDS_MANUAL_REVIEW`.

---

## 3. Review of Existing Systems (Phases 1–7)

### 3.1 Reusable Capabilities
- **Repository Snapshots & Hashing (`lib/repository/change-detection.ts`):** `compareSnapshots` already calculates file-level diffs (`addedFiles`, `modifiedFiles`, `deletedFiles`) and flags affected functional areas.
- **Deterministic Static Engine (`lib/audit/deterministic.ts`):** Fast, zero-token checks for exposed secrets, route IDOR, missing screens, missing schema entities, and auth middleware.
- **Audit Findings Data Model (`lib/audit/store.ts` & `types/index.ts`):** Stores structured findings with finding codes (`SEC-001`, `AUTH-001`), line ranges, code snippets, expected behavior, observed behavior, and acceptance criteria.
- **Prompt Compiler Adapters (`lib/audit/fix-prompt.ts` & `lib/ai/prompt-compiler.ts`):** Multi-agent adapters format instructions with strict change boundaries and preservation directives.

### 3.2 Gaps Identified for Phase 8
1. **No Verification Entity:** Findings only have static statuses (`OPEN`, `FIX_PROMPT_READY`, `HANDED_OFF`, `AWAITING_VERIFICATION`). There is no first-class `Verification` record storing verification method, evidence diffs, confidence, and snapshot revisions.
2. **Missing Granular Re-Audit Scopes:** Phase 7 only had full/dimension audits. Re-auditing currently re-runs the entire pipeline instead of:
   - *Targeted finding verification* (1 finding)
   - *Feature re-audit* (1 feature)
   - *Area re-audit* (Authentication, Database, etc.)
3. **No Regression Tracking:** When a previous finding is resolved, and later a new snapshot re-introduces the vulnerability, Phase 7 would either ignore it or create a brand new finding with no lineage.
4. **No Trustworthy Project Health Representation:** No dashboard indicator synthesizes active criticals, regressions, requirement coverage, and snapshot recency without resorting to misleading pseudo-percentage "scores" (e.g. `98/100`).
5. **No Revised Fix Prompt Generation:** When a fix only partially resolves an issue or fails verification, the user needs an updated prompt detailing the *remaining gap* and *current evidence*, not the identical original prompt.

---

## 4. State Transitions & Verification Model

### 4.1 Verification Lifecycle States
```
FINDING DETECTED (OPEN)
         ↓
  FIX PROMPT GENERATED
         ↓
  CODING AGENT IMPLEMENTS FIX
         ↓
  SNAPSHOT REFRESHED (Snapshot B)
         ↓
  TARGETED RE-AUDIT & VERIFICATION
         ↓
┌───────────────────────┬─────────────────────────┬───────────────────────┐
▼                       ▼                         ▼                       ▼
RESOLVED        PARTIALLY_RESOLVED          STILL_PRESENT           UNABLE_TO_VERIFY
(Evidence proves   (API fixed, but DB       (Vulnerability still    (No test, static
 issue is gone)    remains open)            present in code)        check inconclusive)
                        ↓                         ↓                       ↓
                REVISED FIX PROMPT        REVISED FIX PROMPT      MANUAL REVIEW TASK
```

If a finding was previously `RESOLVED` in Snapshot B, but Snapshot C removes the safeguard:
```
RESOLVED (Snapshot B) ────> REGRESSED (Snapshot C) ────> REGRESSION FIX PROMPT
```

### 4.2 Allowed Verification Statuses
- `RESOLVED`: High/Medium confidence evidence confirms the issue condition no longer exists.
- `PARTIALLY_RESOLVED`: Partial evidence of resolution, but identified sub-requirements remain unmet.
- `STILL_PRESENT`: The original flawed code or condition persists.
- `REGRESSED`: The issue was previously verified as `RESOLVED`, but code changes re-introduced it.
- `UNABLE_TO_VERIFY`: Insufficient static or test evidence exists to guarantee resolution.
- `NEEDS_MANUAL_REVIEW`: Edge case or architectural ambiguity requiring developer judgment.

### 4.3 Verification Methods
- `STATIC_ANALYSIS`: Deterministic regex/AST checks (e.g., secret absent, route param check added).
- `TEST_EVIDENCE`: Existence and execution assertions of dedicated unit/integration test cases.
- `STRUCTURAL_CHECK`: File presence, route presence, database column presence.
- `SEMANTIC_ANALYSIS`: Bounded LLM reasoning (<3,500 tokens) comparing expected vs. observed logic.
- `USER_CONFIRMED`: Explicit user sign-off (treated as a weaker verification level).
- `MANUAL_REVIEW`: Human code inspection.

---

## 5. Regression Strategy & Historical Lineage

### 5.1 Historical Finding Linking
When an audit runs against Snapshot C:
1. Load all historically `RESOLVED` findings for the project.
2. Check if the files associated with those findings were modified in Snapshot C (`compareSnapshots`).
3. For any modified files, re-run targeted verification checks.
4. If the finding condition is triggered again:
   - Mark finding status as `REGRESSED`.
   - Link `previous_finding_id` to preserve resolution history.
   - Increment `regression_count`.
   - Flag as high urgency in the Project Health overview.

### 5.2 Blast Radius & Shared Dependency Warning
If a modified file is a shared utility or middleware (e.g., `middleware.ts`, `lib/supabase/server.ts`, `components/ui/button.tsx`):
- Aigenstra identifies all dependent routes and components.
- The UI surfaces a **"Shared Dependency Warning"**:
  > *"This fix altered `lib/auth/session.ts`, which is imported by 14 routes. Re-audit of Authentication and API layers recommended."*

---

## 6. Factual Project Health (Zero Fake Scores)

Instead of a deceptive aggregate score like `Project Health: 94%`, Aigenstra displays defensible, factual status metrics:

| Metric | Source | Interpretation |
|---|---|---|
| **Health Status** | Categorical synthesis | `HEALTHY_WITHIN_SCOPE` \| `NEEDS_ATTENTION` \| `HIGH_RISK` \| `INCOMPLETE` \| `STALE` |
| **Open Criticals** | Active Findings count | Critical severity findings requiring immediate remediation |
| **Open Highs** | Active Findings count | High severity issues affecting security/data/core workflows |
| **Regressions** | Historical Verification | Issues previously resolved that were re-introduced |
| **Blueprint Alignment** | Coverage analysis | `ALIGNED` \| `PARTIALLY_ALIGNED` \| `DIFFERENT` \| `UNKNOWN` |
| **Audit Recency** | Snapshot timestamp | Fresh (< 24h) vs. Outdated vs. Stale (> 7 days or new commits) |
| **Requirement Coverage**| Coverage matrix | Verified features / Planned features |

---

## 7. Revised Fix Prompt Generation

When verification results in `PARTIALLY_RESOLVED`, `STILL_PRESENT`, or `REGRESSED`, Aigenstra does not re-issue the initial prompt. It compiles a **Revised Fix Prompt** incorporating:
1. **What was already attempted:** Changed files and code in the latest snapshot.
2. **What succeeded:** Aspects of the original fix that verified correctly.
3. **What remains broken:** Specific line ranges, missed routes, or unhandled edge cases observed in the latest snapshot.
4. **Concrete acceptance criteria:** Required test assertions or static conditions for full resolution.

---

## 8. Database Architecture Plan

### 8.1 New Table: `audit_verifications`
```sql
CREATE TABLE IF NOT EXISTS public.audit_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  finding_id UUID NOT NULL REFERENCES public.audit_findings(id) ON DELETE CASCADE,
  audit_id UUID REFERENCES public.project_audits(id) ON DELETE SET NULL,
  repository_snapshot_id UUID REFERENCES public.repository_snapshots(id) ON DELETE SET NULL,
  verification_scope TEXT NOT NULL, -- 'TARGETED_FINDING', 'FEATURE', 'AREA', 'FULL'
  expected_behavior TEXT NOT NULL,
  observed_behavior TEXT NOT NULL,
  original_evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  current_evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  verification_method TEXT NOT NULL, -- 'STATIC_ANALYSIS', 'TEST_EVIDENCE', 'SEMANTIC_ANALYSIS', etc.
  status TEXT NOT NULL, -- 'RESOLVED', 'PARTIALLY_RESOLVED', 'STILL_PRESENT', 'REGRESSED', 'UNABLE_TO_VERIFY', 'NEEDS_MANUAL_REVIEW'
  confidence TEXT NOT NULL, -- 'HIGH', 'MEDIUM', 'LOW'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
```

### 8.2 New Table: `audit_health_snapshots`
```sql
CREATE TABLE IF NOT EXISTS public.audit_health_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  audit_id UUID REFERENCES public.project_audits(id) ON DELETE SET NULL,
  repository_snapshot_id UUID REFERENCES public.repository_snapshots(id) ON DELETE SET NULL,
  health_status TEXT NOT NULL, -- 'HEALTHY_WITHIN_SCOPE', 'NEEDS_ATTENTION', 'HIGH_RISK', 'INCOMPLETE', 'STALE'
  health_scope TEXT NOT NULL,
  critical_count INTEGER NOT NULL DEFAULT 0,
  high_count INTEGER NOT NULL DEFAULT 0,
  medium_count INTEGER NOT NULL DEFAULT 0,
  regression_count INTEGER NOT NULL DEFAULT 0,
  verified_count INTEGER NOT NULL DEFAULT 0,
  unverified_count INTEGER NOT NULL DEFAULT 0,
  blueprint_alignment TEXT NOT NULL, -- 'ALIGNED', 'PARTIALLY_ALIGNED', 'DIFFERENT', 'UNKNOWN'
  recommended_next_action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
```

### 8.3 Finding Table Extension
Add columns to `audit_findings`:
- `previous_finding_id UUID REFERENCES public.audit_findings(id)`
- `regression_count INTEGER DEFAULT 0`
- `resolved_at TIMESTAMPTZ`
- `verification_id UUID REFERENCES public.audit_verifications(id)`

---

## 9. Security & Untrusted Code Considerations

1. **Untrusted Code Integrity:** New code commits may contain adversarial prompt injections in comments or strings. Verification evaluator treats all code as raw string literals.
2. **Secret Scrubbing:** Any new snippets captured during re-audit are scrubbed with `redactSecrets()` before persistence or UI rendering.
3. **Multi-Tenant Isolation:** All Supabase tables use RLS with `EXISTS (SELECT 1 FROM public.projects WHERE projects.id = table.project_id AND projects.user_id = auth.uid())`.

---

## 10. Implementation Roadmap

1. **Database Schema:** Migration `20261008200000_phase8_verification_engine.sql` + RLS policies.
2. **Domain Models:** TypeScript types in `types/index.ts`.
3. **Targeted Verification Evaluator:** `lib/audit/verify.ts` comparing Original vs. Current Evidence.
4. **Regression Engine:** `lib/audit/regression.ts` checking snapshot diffs and previous resolutions.
5. **Revised Prompt Builder:** `lib/audit/revised-fix-prompt.ts` with delta gap instructions.
6. **Project Health Engine:** `lib/audit/health.ts` computing defensible, factual health indicators.
7. **REST APIs:** `/api/projects/[id]/audit/verify`, `/health`, and `/findings/[id]/revised-prompt`.
8. **UI Enhancement:** Responsive, SVG-only Verification modal, Evidence Diff viewer, and Health Overview in `components/projects/audit-dashboard-view.tsx`.
9. **Automated Unit Tests:** Testing all verification transitions, regression flags, and revised prompt generation.
