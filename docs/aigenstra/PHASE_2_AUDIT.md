# Phase 2 Audit & Architectural Plan: Software Blueprint + Build Map

## 1. Executive Summary
Phase 1 successfully established the product foundation: idea intake, real-time understanding synthesis, adaptive discovery questioning with deduplication and "I don't know" fallback logic, and a structured product summary.

Phase 2 transitions the user from **"Let's figure out what you are building"** to **"Here is the complete blueprint and build map for your software."**

**Aigenstra Non-Negotiable Core Rule:**
> Aigenstra is a **prompt builder and architecture guide**, NOT an app builder. Phase 2 maps the product and its build stages in structured, human-understandable clarity with progressive disclosure to prepare for optimal coding prompt generation in subsequent phases.

---

## 2. Current Architecture & Phase 1 Baseline

### Working Infrastructure Reused
- **Supabase Backend**: Storage of projects (`projects`), discovery Q&As (`discovery_qna`), stage tracking (`project_stages`), specifications (`product_specs`, `user_journeys`, `architecture_docs`, `design_specs`, `security_plans`, `agent_decisions`).
- **AI Intelligence Stack**: Google Gemini structured JSON output via `lib/ai/` with robust offline/graceful fallbacks.
- **UI Architecture**: Tailwind CSS, Lucide React (SVG only), Radix UI primitives, responsive dashboard layouts (mobile, tablet, desktop).

### Gaps Discovered for Phase 2
1. **Blueprint Data Depth**: Existing `ProductSpec`, `DesignSpec`, and `ArchitectureDoc` exist as isolated legacy tables without the unified 13-section structure and source/confidence metadata required by Phase 2.
2. **Confidence & Source Attribution**: Phase 2 requires tracking provenance (`USER_CONFIRMED`, `USER_DESCRIBED`, `SYSTEM_INFERRED`, `SYSTEM_RECOMMENDED`, `ASSUMED`) and status (`CONFIRMED`, `PROPOSED`, `ASSUMED`, `NEEDS_DECISION`, `DEFERRED`, `COMPLETED`) across all blueprint items.
3. **Build Map Representation**: Currently stages are abstract ("idea", "planning", "building"). Users need human-centered build stages (e.g., `01 Foundation`, `02 Accounts`, `03 Core Experience`, `04 Business Tools`, `05 Administration`, `06 Quality & Security`) with explicit "Why this exists" rationales, readiness statuses, and prerequisites.
4. **Blueprint Health Engine**: Need consistency checking for orphaned journeys, unassigned data entities, undefined permissions, or contradictory requirements before users proceed.
5. **Progressive Disclosure UX**: Default view must be clear, human plain-English, with a toggleable "Technical View" showing engineering implications (DB schema, API routes, security boundaries) without overwhelming non-technical creators.

---

## 3. Comprehensive 13 Blueprint Sections

1. **Product Overview**: Name, summary, problem statement, core value proposition, product type, target outcome.
2. **Users & Roles**: Role name, description, user goals, permissions, restrictions, relationship with other roles.
3. **User Journeys**: Step-by-step user actions, system responses, success outcomes, failure/friction states.
4. **Features Matrix**: Core/MVP features, supporting features, administrative features, future enhancements with priority.
5. **Pages & Screens**: Screen name, purpose, access role, key components, empty states, loading states, error states.
6. **Workflows**: Multi-step business processes (e.g. checkout, approval, onboarding, notification trigger).
7. **Business Rules**: Constraints, validation policies, rate limits, calculations, and operational guarantees.
8. **Data Model & Entities**: Entity names, purpose, attributes, ownership/access scope, and lifecycle states.
9. **Integrations**: Third-party services (Auth, Payments, Email, AI, Storage, Analytics) with purpose and fallback.
10. **Administration & Ops**: Internal tools, moderation, user management, metrics, audit logs.
11. **Security & Privacy**: Auth model, role-based access control, data protection, privacy considerations.
12. **Quality & Performance**: Responsive requirements, accessibility standards, latency expectations, edge cases.
13. **Future Considerations**: Scalability pathways, v2 candidate features, architectural extensibility notes.

---

## 4. User-Centric Build Map Engine

The Build Map translates the blueprint into an actionable sequence of build stages:
- **Stage ID & Name**: e.g., `STAGE_01_FOUNDATION`, `STAGE_02_USER_ACCOUNTS`, `STAGE_03_CORE_WORKFLOW`
- **User-Centric Title**: "Foundation & Data Model", "Customer Booking Flow", etc.
- **Why This Exists**: Plain-English explanation of why this step is sequenced here and what problem it solves.
- **Deliverables / Scope**: Concrete list of screens, database tables, and logic built in this stage.
- **Dependencies**: Prerequisite stages required before starting.
- **Status**: `NOT_STARTED` | `READY` | `IN_PROGRESS` | `BLOCKED` | `COMPLETED` | `DEFERRED`
- **Target Coding Agent Hints**: Guidance on how coding agents should approach this specific stage.

---

## 5. Blueprint Health & Consistency Checker

Automated validation rules:
- **Role Coverage**: Are all roles referenced in at least one user journey and page?
- **Data Entity Ownership**: Does every data entity have a designated owner role and CRUD lifecycle?
- **Journey Resolution**: Do all user journeys have defined success and failure states?
- **Screen State Completeness**: Do all screens declare empty and error states?
- **Dependency Flow**: Are there circular dependencies or orphan stages in the Build Map?

---

## 6. Implementation Strategy & Safety
- **Zero Disruption**: Phase 1 discovery and project persistence remain intact.
- **Non-Technical First**: UI defaults to clean cards, badges, and plain-English narratives with instant toggle for technical deep dives.
- **Interactive Editing & Decision Making**: Users can accept proposed items, edit details, or mark items as confirmed.
- **Supabase Persistence**: Save all blueprint sections and build map stages to project storage for instant resumption and seamless transition to Phase 3.
