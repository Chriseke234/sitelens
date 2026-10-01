# Aigenstra — AI Product Engineering & Audit Platform for Vibe Coders

> **Core Philosophy:** *Think before you vibe. From idea to verified product.*

Aigenstra is a production-ready AI product engineering workspace designed to turn unstructured ideas and vibe-coded prototypes into rock-solid, production-grade applications with full traceability and automated multi-agent audits.

---

## 🚀 Key Modules

1. **Discovery & Intelligence Engine:** Unstructured idea intake, Q&A clarification, market/competitor research with verified assumptions.
2. **Product PRD & Specs:** Personas, critical functional/non-functional requirements, edge case traps, and 1-click PRD export.
3. **UX & Architecture System:** User journey flows with error/loading/empty states, database schemas, threat models, and server-side authorization matrices.
4. **Multi-Agent Council & ADRs:** 7-agent debate (Product, UX, Design, Architecture, Security, QA, Orchestrator) with formal Architectural Decision Records.
5. **Prompt Studio & 16-Part Prompt Engine:** Surgical prompts formatted for Cursor, Antigravity, Claude Code, and Codex with strict `DO NOT CHANGE` and non-regression guardrails.
6. **9-Agent Project Audit Hub:** Comprehensive code and project evaluation with secret redaction and SSRF boundaries.
7. **Evidence-Based Fix Engine:** 5-stage lifecycle tracking (`open` ➔ `fix_prompt_generated` ➔ `user_implementing` ➔ `ready_for_verification` ➔ `resolved`).
8. **Re-Audit & Full Traceability Matrix:** Regression detection and requirement-to-code traceability trail.
9. **Production Readiness Checklist & Sharing:** 24-item pre-launch verification checklist and shareable tokenized engineering reports.

---

## 🛠 Tech Stack

- **Frontend:** [Next.js 15](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/)
- **Backend & Database:** Next.js Server-Side APIs, [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Auth)
- **AI Models:** Google Gemini 2.5 Flash, Multi-Agent Council Orchestration

---

## 📁 Architecture & Folder Structure

```
Aigenstra/
├── app/
│   ├── (auth)/              # Authentication flows (Login, Signup, Reset Password)
│   ├── (dashboard)/         # Workspaces, Projects, Prompt Studio, Audits, Readiness
│   ├── (public)/            # Shareable tokenized reports (/share/project/[token])
│   ├── api/                 # Server-side APIs with RLS and authorization checks
│   ├── loading.tsx          # Branded Aigenstra ambient loading state
│   ├── error.tsx            # Global runtime error boundary
│   └── layout.tsx           # Global layout & metadata
├── components/
│   ├── ui/                  # Reusable UI primitives (Button, Card, Badge, Spinner)
│   ├── layout/              # Navbar and Footer with Aigenstra brand mark
│   ├── projects/            # Workspace navigation, wizard, prompts, and audit cards
│   └── landing/             # Responsive marketing sections
├── lib/
│   ├── ai/                  # Multi-agent council, prompt engine, and audit engines
│   └── supabase/            # Client and server Supabase database clients
└── supabase/
    ├── migrations/          # Incremental SQL migration scripts
    └── aigenstra_master_schema.sql # Unified master database schema
```
