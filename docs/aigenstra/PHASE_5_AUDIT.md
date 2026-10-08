# Phase 5 Audit & Architectural Specification: Prompt Compiler + Token Optimization Engine

## 1. Executive Summary & Core Identity
Phases 1 through 4 established:
1. **Product Discovery & Understanding**: Adaptive Q&A, assumptions, decisions, product summary.
2. **Software Blueprint & Build Map**: 13-section progressive disclosure blueprint and sequential stages.
3. **Engineering Intelligence**: 15-domain architecture, API contracts, entity relations, and technical tradeoffs.
4. **Task Planning & Context Engine**: Right-sized tasks, next-task recommendation, bounded context packs with explicit inclusions/exclusions.

**Phase 5 Objective:** Implement the **Prompt Compiler + Token Optimization Engine**.
The purpose of Phase 5 is to turn:
> **PRODUCT UNDERSTANDING + SOFTWARE BLUEPRINT + ENGINEERING INTELLIGENCE + TASK + CONTEXT PACK**
into:
> **A HIGH-QUALITY, TASK-SPECIFIC, CONTEXT-AWARE CODING PROMPT**
while minimizing redundant context, unnecessary repetition, irrelevant information, and avoidable token consumption without sacrificing implementation quality.

> [!IMPORTANT]
> **NON-NEGOTIABLE AIGENSTRA PRODUCT RULE:**
> **AIGENSTRA IS A PROMPT BUILDER, NOT AN APP BUILDER.**
> Aigenstra does not directly implement the user's software. Aigenstra scopes the task, selects context, optimizes context, compiles the prompt, explains it, and prepares it for the user's chosen coding agent (Google Antigravity, Claude Code, Cursor, Codex). The external coding agent remains responsible for code execution.

---

## 2. Baseline Architecture & Current State Review

### Reusable Foundation from Phases 1–4
- **Project Intelligence**: Rich structured data in `product_specs`, `architecture_docs`, `agent_decisions`, `discovery_qna`.
- **Task & Context Models**: `AigenstraTask` with change boundaries (`mustChange`, `mayChange`, `mustNotChange`) and `ContextPack` with explainable inclusions and explicit exclusions.
- **Supabase Persistence**: `prompts` and `prompt_versions` tables with version history and build sessions.
- **UI Architecture**: Responsive Tailwind CSS UI, dark mode support, Lucide SVG icons (0 emojis), Next.js App Router.

### Gaps Discovered for Phase 5
1. **Generic Prompt Generation**: Currently, `lib/ai/prompt-engine.ts` generates category-based prompts disconnected from specific Task Plans (`AigenstraTask`) and curated `ContextPacks`.
2. **Lack of Context Deduplication & Token Optimization**: Prompts need automated deduplication to remove duplicate statements, prune irrelevant boilerplate, and prioritize confirmed decisions over unverified inferences.
3. **No Contradiction Detector**: Need automated checks to detect conflicting rules or constraints between user decisions and engineering defaults before prompt compilation.
4. **No Real Token & Character Metrics**: Token counts should be transparently estimated and tracked (pre-optimization vs post-optimization) without gimmick claims.
5. **Need Enhanced Coding Agent Adapters**: Specifically tailored profiles for:
   - **Google Antigravity**: Focus on thorough codebase inspection first, strict change boundaries, clean modular TypeScript, 100% responsive UI, SVG Lucide icons, and verification.
   - **Claude Code**: Direct CLI execution, high-autonomy codebase scanning, test-driven validation.
   - **Cursor**: App Router context tagging, inline composer formatting, preserve existing file structures.
   - **Codex / Generic LLM**: Standard structured markdown format.
6. **Unified Prompt Studio UX**: Interactive Task-to-Prompt compiler, section-by-section breakdown, token metrics display, diff viewer for prompt versions, copy-with-agent-instructions modal, and handoff workflow.

---

## 3. The Prompt Compiler Architecture

### The 12 Standard Prompt Sections
Every compiled prompt follows a strict, highly structured 12-section layout designed for maximum coding agent accuracy:
1. **ROLE & PERSONA**: Senior engineer directive targeted for the selected coding agent.
2. **OBJECTIVE**: Precise, single-responsibility task target with clear business/user value.
3. **PROJECT CONTEXT**: App type, tech stack, architecture overview.
4. **CURRENT STATE & PRESERVATION**: Summary of existing working systems; what must NOT be broken.
5. **RELEVANT CONTEXT**: Curated blueprint entities, schemas, API contracts, and user journeys.
6. **FUNCTIONAL & UX REQUIREMENTS**: Explicit step-by-step functionality, UI states (empty, loading, error, success), and responsive viewports (mobile 360px+, tablet, desktop).
7. **CHANGE BOUNDARIES & CONSTRAINTS**:
   - `MUST CHANGE`: Exact target files/routes.
   - `MAY CHANGE`: Supporting types or utility files.
   - `MUST NOT CHANGE`: Protected auth middleware, unrelated tables, or core settings.
8. **SECURITY & DATA INTEGRITY**: Row-Level Security (RLS), Zod schema validation, server-side authentication, secret isolation.
9. **EDGE CASES & ERROR HANDLING**: Network disconnects, session expiry, race conditions, invalid inputs.
10. **ACCEPTANCE CRITERIA**: Concrete, measurable verification checklist.
11. **TESTING & VALIDATION EXPECTATIONS**: Specific unit, integration, authorization, and typecheck commands (`npm run typecheck`, `npm run build`).
12. **EXPECTED OUTPUT REPORT**: Instructions for the coding agent to summarize changed files, security measures applied, and test verification results.

---

## 4. Token Optimization & Context Deduplication Engine

### Optimization Principles
- **Signal-to-Noise Maximization**: Preserve 100% of functional requirements, security rules, and acceptance criteria; strip repetitive explanations and generic conversational fluff.
- **Decision Hierarchy**: Confirmed user decisions override default assumptions or inferred recommendations.
- **Bounded Inclusions**: Only include data entities and API routes directly affected by the task.
- **Contradiction Resolution**: Flag and resolve conflicting constraints before sending to the coding agent.
- **Factual Token Accounting**: Real character and token estimates calculated transparently.

---

## 5. Agent Adapters

| Agent Profile | Key Directive Emphasis |
| :--- | :--- |
| **Google Antigravity** | Inspect codebase before modifying, adhere to strict change boundaries, produce clean TypeScript, responsive UI (360px+), SVG icons only, verify with `typecheck`/`build`. |
| **Claude Code** | Autonomous codebase exploration, focused tool commands, test execution, concise execution reports. |
| **Cursor** | Context-tagged instructions (`@context`), Composer-optimized inline directives, file preservation. |
| **Codex / Generic** | Standard platform-agnostic 12-section engineering specification. |

---

## 6. Implementation Sequence & Safety Plan

1. **Domain Types (`types/index.ts`)**:
   - Add `CompiledPrompt`, `PromptSection`, `PromptQualityStatus`, `AgentAdapterProfile`, `TokenOptimizationResult`, `PromptOptimizationMetrics`.
2. **AI Intelligence Layer**:
   - `lib/ai/prompt-optimizer.ts`: Deduplication, contradiction detection, and token calculation.
   - `lib/ai/prompt-compiler.ts`: Multi-agent prompt compilation from Task + Context Pack + Blueprints.
3. **API Layer**:
   - `app/api/projects/[id]/tasks/[taskId]/prompt/route.ts`: Task-specific prompt compilation endpoint.
   - `app/api/projects/[id]/prompts/route.ts`: Project prompt repository and version management.
4. **Interactive UI**:
   - `components/projects/prompt-studio-view.tsx`: Advanced Prompt Studio with Agent Selector, Token Metrics, 12-Section Viewer, Copy/Export, and Handoff Guide.
   - Update `app/(dashboard)/projects/[id]/prompts/page.tsx` and integrate task prompt trigger into `components/projects/task-planning-view.tsx`.
5. **Verification**:
   - Run `npm run typecheck` and `npm run build`.
   - Update `docs/aigenstra/CURRENT_STATE.md`, `CHANGE_LOG.md`, and walkthrough artifact.
