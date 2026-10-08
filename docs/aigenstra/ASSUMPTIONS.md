# AIGENSTRA — ASSUMPTIONS

## Active System Assumptions

| ID | Assumption | Rationale | Revisit Criteria / Status |
|---|---|---|---|
| **ASM-001** | Users will copy/export generated prompts into their own external coding agent (Antigravity, Cursor, Claude Code). | Aigenstra does not execute code directly; it optimizes prompts for external execution. | **PROVISIONAL** (Valid for MVP) |
| **ASM-002** | Google Gemini 2.5 Flash provides sufficient reasoning speed and quality for structured discovery and prompt generation. | Low latency and high JSON adherence. Fallback offline generator ensures zero crash risk. | **CONFIRMED** |
| **ASM-003** | Supabase Row Level Security (RLS) is the canonical backend persistence layer for projects, prompts, decisions, and findings. | Server-side data isolation is mandatory across all project scopes. | **CONFIRMED** |
| **ASM-004** | A 16-part standardized prompt structure provides the highest fidelity across AI coding IDEs without hallucinations. | Eliminates ambiguities in scope, security, UX edge cases, and verification criteria. | **CONFIRMED** |
| **ASM-005** | Beginners prefer answering 3-5 high-priority questions rather than exhaustive 50-question forms. | Prevents survey fatigue and accelerates time-to-first-prompt. | **ACTIVE** |
