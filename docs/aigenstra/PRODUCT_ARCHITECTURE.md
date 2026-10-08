# AIGENSTRA — PRODUCT ARCHITECTURE

## System Overview

Aigenstra is built on Next.js 15 (App Router) with React Server Components, TypeScript, Tailwind CSS, and a Supabase backend utilizing PostgreSQL and Row Level Security (RLS).

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           AIGENSTRA CLIENT (Next.js 15)                 │
│                                                                         │
│  ┌─────────────────────────┐  ┌──────────────────────────────────────┐  │
│  │   Tour Guide UI / HUD   │  │    Progressive Disclosure Views      │  │
│  │  (Beginner Default UX)  │  │   (Expandable Tech Architecture)     │  │
│  └─────────────────────────┘  └──────────────────────────────────────┘  │
│                                                                         │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    CORE ENGINE LAYER (Server-Side)                      │
│                                                                         │
│  ┌───────────────────────────┐  ┌────────────────────────────────────┐  │
│  │     Question Engine       │  │     Software Blueprint Engine      │  │
│  │ (Must-Know/Helpful/Opt)   │  │   (PRD, Journey, DB & API Specs)   │  │
│  ├───────────────────────────┤  ├────────────────────────────────────┤  │
│  │    Context Engine &       │  │          Prompt Compiler           │  │
│  │    Token Optimizer        │  │   (16-Part Agent-Specific Prompts) │  │
│  ├───────────────────────────┤  ├────────────────────────────────────┤  │
│  │  Decision Log & Memory    │  │       Audit & Fix Generator        │  │
│  └───────────────────────────┘  └────────────────────────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE PERSISTENCE LAYER                      │
│                                                                         │
│  • projects                • discovery_qna       • product_specs        │
│  • architecture_docs       • security_plans      • project_stages       │
│  • prompts & prompt_versions                     • audit_findings       │
│  • fix_prompts             • adrs & decisions    • project_settings     │
│  (Enforced via Row-Level Security: auth.uid() = user_id)               │
└─────────────────────────────────────────────────────────────────────────┘
```

## Core Subsystems

### 1. Adaptive Question Engine
- Evaluates raw product intake and prior Q&A.
- Categorizes questions into `MUST_KNOW`, `HELPFUL`, `OPTIONAL`.
- Formats questions in plain business language and attaches "Why we're asking".
- Automatically provisions sensible defaults when the user answers "I don't know".

### 2. Context Engine & Token Optimizer
- Given an active task (e.g. "Implement customer authentication"), selects only relevant schemas, routes, constraints, and dependencies.
- Eliminates duplicate descriptions, redundant comments, and out-of-scope files.
- Computes estimated token count and transparently displays rationale.

### 3. Prompt Compiler & Agent Adapters
- Emits standardized 16-part prompts comprising:
  1. Role
  2. Project Context
  3. Current Project State
  4. Objective
  5. Requirements
  6. Existing Architecture
  7. Technical Constraints
  8. UX Requirements
  9. Security Requirements
  10. Edge Cases
  11. Do Not Change
  12. Acceptance Criteria
  13. Testing Requirements
  14. Validation Commands
  15. Expected Output
  16. Full Prompt Text
- Supports agent-specific formatting profiles (Google Antigravity, Cursor, Claude Code, Codex, Lovable).

### 4. Audit Hub & Fix Engine
- Scans user repositories or implemented components for security, architecture, UX, and code quality issues.
- Emits structured findings with severity levels (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`).
- Generates scoped, surgical fix prompts rather than re-prompting the entire project.
