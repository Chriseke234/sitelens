# AIGENSTRA — PROJECT MAP

## File & Directory Structure

```
c:\Users\CHRIS\OneDrive\Documents\Sitelens\
├── app/
│   ├── (auth)/                    # Authentication routes (login, signup, forgot/reset password)
│   ├── (dashboard)/               # Core dashboard workspace
│   │   ├── dashboard/             # Command center home screen
│   │   ├── projects/              # Projects list & creation wizard (/projects/new)
│   │   │   └── [id]/              # Individual project workspace
│   │   │       ├── overview/      # Project summary, stage progress, HUD
│   │   │       ├── discovery/     # Adaptive Question Engine & discovery intake
│   │   │       ├── journey/       # UX journeys, states, & edge cases
│   │   │       ├── product/       # PRD, functional/non-functional requirements
│   │   │       ├── architecture/  # Tech stack, database schema, API map
│   │   │       ├── decisions/     # Decision Log & ADRs
│   │   │       ├── prompts/       # Prompt Studio (Task-based prompt generator)
│   │   │       ├── audit/         # Audit Hub & findings
│   │   │       ├── fix-queue/     # Surgical fix prompt queue
│   │   │       ├── health/        # System health & token telemetry
│   │   │       ├── readiness/     # Production launch checklist
│   │   │       └── settings/      # Project configuration & agent profiles
│   │   ├── templates/             # Starter project templates
│   │   └── settings/              # User account settings
│   ├── api/                       # Next.js server-side Route Handlers
│   │   └── projects/[id]/         # Project intelligence API endpoints
│   ├── globals.css                # Global Tailwind styles & design tokens
│   └── layout.tsx                 # Root HTML shell
├── components/
│   ├── dashboard/                 # Sidebar, navigation, metrics
│   ├── projects/                  # Project wizards, navigation HUD
│   ├── audit/                     # Audit breakdown & report views
│   └── ui/                        # Reusable atomic UI components (buttons, cards, badges)
├── lib/
│   ├── ai/                        # AI intelligence engines
│   │   ├── client.ts              # Gemini API client & key validation
│   │   ├── product-intelligence.ts# Discovery, journey, & PRD engines
│   │   ├── prompt-engine.ts       # 16-part prompt compiler & agent formatters
│   │   ├── design-architecture.ts # Schema, architecture, & security planning
│   │   ├── project-audit.ts       # Multi-agent audit analysis & findings
│   │   └── re-audit-engine.ts     # Verification & regression detection
│   ├── supabase/                  # Supabase SSR client, server, & middleware
│   └── utils.ts                   # Class name utilities
├── supabase/
│   ├── aigenstra_master_schema.sql # Comprehensive Supabase DDL schema & RLS policies
│   └── migrations/                # Database migrations
├── types/
│   └── index.ts                   # Core TypeScript domain models & interfaces
└── docs/
    └── aigenstra/                 # Architecture & product documentation system
```
