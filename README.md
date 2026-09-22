# SiteLens - Digital Intelligence & Audit Platform

> **Core Value Proposition:** Understand what's wrong with your website and assess the authenticity of digital media with evidence-based intelligence.

SiteLens is a production-ready SaaS digital intelligence platform that performs two primary workflows:
1. **Website Audits:** Comprehensive analysis of websites across Technical SEO, Performance, Accessibility, UX, Trust, and Conversion signals using transparent, deterministic scoring combined with structured AI insights.
2. **Media Authenticity Analysis:** Evidence-based assessment of uploaded images for metadata, provenance signals, and AI-generation indicators.

---

## 🛠 Tech Stack

- **Frontend:** [Next.js](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Lucide React Icons](https://lucide.dev/)
- **Backend & Database:** Next.js Server-Side APIs, [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
- **Validation:** [Zod](https://zod.dev/)
- **AI Integration:** OpenAI API (Structured JSON schema outputs)

---

## 📁 Architecture & Folder Structure

```
Sitelens/
├── app/
│   ├── (marketing)/         # Public marketing pages & landing experience
│   ├── dashboard/           # User dashboard & audit history management
│   ├── audits/              # Website audit report views & detailed breakdown
│   ├── media/               # Media authenticity analysis tool
│   ├── settings/            # Profile and account settings
│   ├── api/                 # Server-side API handlers & webhook endpoints
│   ├── error.tsx            # Global runtime error boundary
│   ├── loading.tsx          # Global fallback loading states
│   ├── not-found.tsx        # Branded 404 page
│   ├── layout.tsx           # Root HTML layout with providers & fonts
│   └── globals.css          # Tailwind directives & CSS theme variables
├── components/
│   ├── ui/                  # Reusable UI primitives (Button, Card, Badge, Spinner, EmptyState)
│   ├── layout/              # Navbar and Footer shells
│   ├── audit/               # Audit form inputs, metric cards, and report tables
│   └── media/               # File dropzone, provenance cards, signal indicators
├── lib/
│   ├── supabase/            # Supabase client helpers (client & server)
│   ├── ai/                  # Structured OpenAI prompt generators & JSON parsers
│   ├── audit/               # Deterministic website parsing & score calculation engine
│   ├── media/               # EXIF/Metadata extraction & signal analysis helpers
│   ├── utils.ts             # CN helper, score colors, formatting functions
│   └── validation/          # Zod validation schemas for forms & API payloads
├── types/
│   └── index.ts             # Global TypeScript interfaces & data models
├── .env.example             # Template for required environment variables
└── README.md                # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or 20.x installed
- npm / pnpm / yarn package manager

### Environment Setup
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Populate the required environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `OPENAI_API_KEY`: OpenAI API key for AI audit interpretations

### Development Server
Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

### Quality & Build Verification Commands
```bash
# Run TypeScript typechecks
npm run typecheck

# Run linter
npm run lint

# Build for production
npm run build
```

---

## 🔒 Important Development Rules

- **Deterministic Scoring:** Technical scores (SEO, Performance, Accessibility) are computed using exact measurable findings. AI is used exclusively for analysis interpretation.
- **Evidence-Based Claims:** AI media analysis never claims 100% absolute proof; all assessments present verifiable signals, confidence scores, and limitations.
- **No Mock Data in Real Code:** Real functionality consumes structured APIs and database schemas directly.
- **Responsive & Accessible:** Fully responsive design across Desktop, Tablet, and Mobile viewports using SVG icons.
