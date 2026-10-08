# AIGENSTRA — PRODUCT PRINCIPLES

## 1. Single Intelligent Guide Experience
The user interacts with one cohesive assistant: **Aigenstra**. All internal specialist reasoning (product management, UX, database architecture, security threat modeling, QA verification) remains internal. The user is never subjected to multi-agent council arguments or technical jargon unless they explicitly choose to view technical details.

## 2. Progressive Disclosure & Two Levels of Communication
- **Default Mode (Beginner-Friendly):** Clear explanations, human questions, relatable examples, concrete summaries, and guided next steps.
- **Technical Mode (Expandable):** Detailed architecture diagrams, database schemas, API specs, security threat vectors, and engineering notes.

## 3. Human, Adaptive Questioning
- Questions must always serve a clear purpose (categorized internally as `MUST KNOW`, `HELPFUL`, or `OPTIONAL`).
- Questions translate technical implications into plain-language business decisions (e.g., asking "Who should be allowed to view or edit this data?" instead of "Should we enforce RBAC via RLS?").
- Always explain *Why we're asking*.
- **"I don't know" is always a valid choice**, automatically triggering a sensible default, provisional assumption, and an explanation.

## 4. Explicit Assumptions & Decision Tracking
- No assumptions are made silently. Provisional assumptions are surfaced clearly with rationale and can be modified at any time.
- All agreed architectural and product decisions are preserved in an immutable, searchable Decision Log to prevent contradictions.

## 5. Token Efficiency & Minimal Context Packs
- **More context is not better; relevant context is better.**
- Coding prompts are built by dynamically selecting only the files, entities, constraints, and acceptance criteria relevant to the single task at hand.
- Redundant project overviews and irrelevant files are aggressively pruned.

## 6. Real, Verifiable Metrics (Zero Fake Functionality)
- Never display fake token savings, fake AI responses, artificial audit scores, or fabricated progress percentages.
- If data or measurements are estimated or unavailable, they are transparently labeled as such.

## 7. Production-First Engineering Standards
- All compiled prompts and architectural outputs adhere to strict best practices:
  - Clean, well-commented, production-ready TypeScript.
  - Server-side authorization and Zero-Trust data isolation.
  - Responsive design across mobile (360px), tablet (768px), and desktop (1280px+).
  - Explicit UI states (loading, empty, error, success).
  - SVG icons exclusively (Lucide) — zero emojis.
