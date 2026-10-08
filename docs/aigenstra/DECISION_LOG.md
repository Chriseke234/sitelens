# AIGENSTRA — DECISION LOG

## Architectural & Product Decisions

| ID | Date | Decision | Rationale | Impacted Areas | Status |
|---|---|---|---|---|---|
| **DEC-001** | 2026-10-04 | Position Aigenstra strictly as a Prompt Builder, not an App Builder | Prevents misaligned expectations and focuses the platform on high-precision prompt engineering. | Marketing, UX copy, workspace workflow | **ACTIVE** |
| **DEC-002** | 2026-10-04 | Single "Aigenstra" tour guide persona instead of exposed multi-agent council | Beginners are overwhelmed by multi-agent debates; internal reasoning should remain internal. | UI navigation, discovery engine, prompts | **ACTIVE** |
| **DEC-003** | 2026-10-04 | Two-level communication: Default simple language + Expandable Technical Details | Enables vibe coders to move quickly while allowing technical engineers to inspect architecture. | PRD, Blueprint, Build Map, Prompts | **ACTIVE** |
| **DEC-004** | 2026-10-04 | "I don't know" is a first-class valid response in Question Engine | Prevents user drop-off during onboarding and establishes provisional assumptions. | Discovery Q&A, Assumptions Engine | **ACTIVE** |
| **DEC-005** | 2026-10-04 | Task-specific Context Curation & Token Optimization | Massive context dumps confuse coding LLMs; minimal relevant context yields superior results. | Prompt Engine, Context Engine, UI preview | **ACTIVE** |
| **DEC-006** | 2026-10-04 | Common prompt representation + agent-specific adapters | Avoids maintaining separate prompt logic per agent while tailoring formatting for Cursor, Antigravity, Claude Code, etc. | `lib/ai/prompt-engine.ts` | **ACTIVE** |
| **DEC-007** | 2026-10-04 | Strict Zero-Fake policy for metrics and token statistics | Trustworthiness is core to the brand. Estimated metrics are explicitly labeled. | Dashboard, usage telemetry, audit reports | **ACTIVE** |
