# Phase 4 Audit & Architectural Specification: Task Planning + Context Engine

## 1. Executive Summary & Core Identity
Phases 1, 2, and 3 established product understanding, the 13-section Software Blueprint, the sequential Build Map, and the 15-domain Engineering Intelligence layer.

**Phase 4 Objective:** Implement **Task Planning + Context Engine**:
1. **Task Planning**: Answers *"What exactly needs to be done next?"* by generating right-sized, implementation-bounded tasks from the Build Map and Engineering Blueprint, recommending the next logical task with "Why next" rationales, and checking dependencies and blockers.
2. **Context Engine**: Answers *"What information does the coding agent actually need for this task?"* by curating a structured **Context Pack** (Task Brief, Blueprint slice, Engineering requirements, Decisions, Constraints, Acceptance Criteria) while explicitly documenting **Excluded Context with reasons** to prevent token bloat and cognitive overload.

> [!IMPORTANT]
> **AIGENSTRA CORE BOUNDARY:** Aigenstra is a **prompt builder and architecture guide**, NOT an app builder. Aigenstra does not execute implementation code. Phase 4 scopes the work and prepares relevant context for external coding agents (Google Antigravity, Claude Code, Cursor, Codex).

---

## 2. Baseline Architecture & Current State

### Reusable Foundation from Phases 1–3
- **Supabase Backend**: Persistence across `projects`, `discovery_qna`, `project_stages`, `product_specs` (Software Blueprint), `architecture_docs` (Build Map & Engineering Blueprint), `agent_decisions`.
- **Domain Models**: Item provenance, 15 engineering domains, feature traceability matrix, and state transitions.
- **AI Intelligence Stack**: Google Gemini structured JSON output via `lib/ai/` with deterministic offline fallbacks.
- **UI System**: Responsive design (mobile 360px+, tablet, desktop) using Tailwind CSS, Radix UI, and SVG Lucide icons exclusively (0 emojis).

### Gaps Discovered for Phase 4
1. **Lack of Implementation-Sized Task Model**: Previous phases mapped high-level stages and feature lists, but not bounded, testable coding tasks with change boundaries (Must Change / Must Not Change), explicit acceptance criteria, and readiness states.
2. **No Context Selection Engine**: Previously, prompt generation contemplated sending all project information at once. Phase 4 requires intelligent context pruning, selecting only direct and supporting context while explicitly excluding unrelated systems.
3. **No Explainable Context Model ("Why this context?")**: Users and coding agents need clear rationale for why specific context items are included or excluded.
4. **No Stale Context Detection**: When a user changes a database decision or product requirement, any pre-generated task context must be flagged for review.
5. **No Next-Task Recommendation Engine**: Non-technical creators need guidance on which task to tackle first based on architectural prerequisites.

---

## 3. The Task Planning Architecture

### Task Sizing & Bounds
- **Right-Sized**: Tasks represent meaningful increments (e.g. "Create Customer Authentication & Protected Routes", not "Build entire app" and not "Change button color").
- **Complexity Levels**: `SMALL`, `MEDIUM`, `LARGE`, `COMPLEX`. Overly broad tasks automatically propose task splitting.
- **Change Boundaries**:
  - `mustChange`: Specific files, components, and handlers that must be modified.
  - `mayChange`: Supporting utilities or styles that may be updated.
  - `mustNotChange`: Protected core logic, payment rules, or unrelated dashboards that must remain untouched.

### Task Status & Readiness Lifecycle
- **Status**: `BACKLOG` | `READY` | `IN_PROGRESS` | `BLOCKED` | `COMPLETED` | `DEFERRED`
- **Readiness State**: `READY` | `NEEDS_INFORMATION` | `NEEDS_DECISION` | `BLOCKED` | `READY_FOR_CONTEXT` | `READY_FOR_PROMPT`

---

## 4. The Context Engine & Context Pack

### Context Relevance Hierarchy
- **Level 1 — Task Brief & Purpose**: Always included.
- **Level 2 — Direct Dependencies**: Required services and schemas.
- **Level 3 — Direct Product Requirements**: Specific user goals and screens.
- **Level 4 — Engineering Requirements**: APIs, RLS policies, and validation rules.
- **Level 5 — Applicable Decisions & Assumptions**: Confirmed tech choices.
- **Level 6 — Constraints & Acceptance Criteria**: Must change / Must not change rules.
- **Level 7 — Unrelated Context**: Explicitly excluded with reasons (e.g. Admin analytics excluded from Customer login task).

### Context Pack Structure
```typescript
interface ContextPack {
  id: string;
  taskId: string;
  taskTitle: string;
  summary: string;
  includedItems: Array<{ source: string; title: string; content: string; reason: string; priority: number }>;
  excludedItems: Array<{ source: string; title: string; reason: string }>;
  constraints: { mustChange: string[]; mayChange: string[]; mustNotChange: string[] };
  acceptanceCriteria: string[];
  securityConsiderations: string[];
  testingRequirements: string[];
  estimatedSize: { itemCount: number; characterCount: number; label: string };
  isStale: boolean;
  staleReason?: string;
  created_at: string;
}
```

---

## 5. Next-Task Recommendation Engine
Inputs: Build Map dependencies, resolved vs unresolved decisions, task readiness, and prerequisite flows.
Output: Top recommended task, plain-English "Why next" rationale, and alternative ready tasks.

---

## 6. Implementation Sequence & Safety Plan
- **Step 1: Domain Models**: Add Task, ContextPack, and TaskRecommendation types in `types/index.ts`.
- **Step 2: AI Intelligence Engines**:
  - `lib/ai/task-engine.ts`: Generates bounded tasks from Build Map and Engineering Blueprint.
  - `lib/ai/context-engine.ts`: Curates task-specific Context Packs and explains exclusions.
- **Step 3: REST API Routes**: `app/api/projects/[id]/tasks/route.ts` and `app/api/projects/[id]/tasks/[taskId]/context/route.ts`.
- **Step 4: Interactive UI**: `components/projects/task-planning-view.tsx` with Next-Task Guide, Task Detail drawer, Context Pack visualizer (Included vs Excluded), and Stale Context badges.
- **Step 5: Route Integration**: Update workspace navigation and connect `app/(dashboard)/projects/[id]/tasks/page.tsx`.
- **Step 6: Validation**: Run `npm run typecheck` and `npm run build` to verify 100% production readiness.
