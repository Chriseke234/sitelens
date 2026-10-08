# AIGENSTRA — PHASE 1 AUDIT & REPOSITORY INSPECTION

## Date: 2026-10-04
## Focus: Product Understanding + Question Engine + Project Foundation

---

## 1. Existing Architecture & Stack
- **Framework:** Next.js 15.1.7 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 3.4.17 with dark mode support, Lucide React SVG icons (0 emojis)
- **Database & Auth:** Supabase PostgreSQL with `@supabase/ssr` 0.5.2, strict Row Level Security (RLS) policies enforcing `auth.uid() = user_id`
- **AI Integration:** Google Gemini API (`gemini-2.5-flash`), with resilient deterministic offline fallbacks when API keys are absent

---

## 2. Existing Project Model & Data Representation
- **Table `public.projects`:** Stores `id`, `user_id`, `name`, `description`, `raw_idea`, `product_type`, `target_audience`, `problem_statement`, `stage` (`idea`, `researching`, `planning`, etc.), `coding_environment`, `mode` (`build` / `audit`).
- **Table `public.discovery_qna`:** Stores `id`, `project_id`, `question`, `answer`, `category` (question priority / domain), `step_order`.
- **Table `public.agent_decisions`:** Stores structured decisions and provisional assumptions with `topic`, `decision`, `reason`, `status`.
- **Table `public.product_specs`:** Stores normalized problem statements, personas, functional requirements, and edge cases.

---

## 3. Existing User Flow vs Intended Phase 1 Flow
- **Current Flow:**
  1. User creates project workspace with name, type, and raw idea.
  2. Workspace Overview displays tour guide HUD with real progress metrics.
  3. Discovery page presents prioritized questions (`MUST KNOW`, `HELPFUL`, `OPTIONAL`) with "Why we're asking" accordions and "I don't know — Recommend for me" handling.
- **Intended Phase 1 Enhancements:**
  1. Internal **Idea Understanding Record** generation upon project creation (synthesizing raw idea into normalized description, actors, workflows, uncertainties, confidence).
  2. Branching and question deduplication in the **Adaptive Question Engine** across 15 standard product categories (Actors, Goals, Access, Workflows, Payments, Communication, Data, Integrations, Admin, Scale, etc.).
  3. **Sufficiency Check:** Automatically recognizing when enough high-impact decisions have been resolved (3–5 key questions) and transitioning smoothly from `DISCOVERY` to `UNDERSTANDING_READY`.
  4. Human-readable **Product Understanding Summary** confirming:
     - What you're building
     - Who it's for
     - Main user journey
     - Core capabilities
     - Active assumptions (provisional vs confirmed)
     - Decisions left to make
  5. Initial **Blueprint Skeleton** and **Build Map Foundation** without premature full prompt compilation.

---

## 4. Reusable Infrastructure to Preserve
- Supabase SSR authentication client, server session handlers, and middleware.
- Database schemas in `supabase/aigenstra_master_schema.sql`.
- Atomic UI component library (`Button`, `Card`, `Badge`, `Logo`, `Spinner`).
- Gemini API client wrapper with JSON generation configs and offline fallbacks.

---

## 5. Problems & Discrepancies Discovered
- **Premature Prompt Generation Risk:** Earlier iterations allowed jumping directly to prompt generation before establishing clear product understanding and assumptions.
- **Question Deduplication:** Need strict context check so the Question Engine never asks about topics already clarified in the user's raw idea or earlier answers.
- **Contradiction Detection:** If a user modifies an earlier answer, related decisions must be flagged as potentially superseded.

---

## 6. Phase 1 Implementation Plan
1. **Idea Understanding Synthesizer (`lib/ai/product-understanding.ts`):** Transform raw idea into a structured Understanding Record.
2. **Adaptive Question Engine Refinement (`lib/ai/product-intelligence.ts`):** Multi-category branching, deduplication against known facts, and sufficiency check.
3. **Product Understanding Summary & Skeleton (`components/projects/product-summary-view.tsx`):** Beginner-friendly summary card with "Looks good" confirmation and assumption manager.
4. **Initial Blueprint & Build Map Foundations:** Data structures ready for Phase 2 without generating premature code prompts.
5. **Quality & Verification Pass:** TypeScript compilation, responsive mobile layout checks, and error resilience.

---

## 7. Risks & Mitigations
- **Risk:** Slow LLM response during discovery questions.
  - **Mitigation:** Fallback deterministic question generator with zero network delay and offline resilience.
- **Risk:** User enters vague/fragmented idea.
  - **Mitigation:** Gentle adaptive questions that guide the user step-by-step rather than rejecting ambiguous input.
