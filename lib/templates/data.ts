import { ProductType, CodingEnvironment, ProjectMode } from "@/types";

export interface StarterTemplate {
  id: string;
  title: string;
  category: ProductType;
  badge: string;
  tagline: string;
  description: string;
  targetAudience: string;
  problemStatement: string;
  techStack: string;
  defaultEnvironment: CodingEnvironment;
  mode: ProjectMode;
  stages: string[];
  features: string[];
  imageUrl: string;
  rawIdea: string;
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: "saas-starter",
    title: "B2B SaaS Multi-Tenant Platform",
    category: "SaaS",
    badge: "Enterprise Foundation",
    tagline: "Subscription billing, organization tenancy, and RBAC authorization.",
    description:
      "A complete B2B software platform architecture with workspace isolation, tenant-level Postgres RLS policies, Stripe webhook processing, team invitations, and audit event logging.",
    targetAudience: "B2B businesses, engineering teams, and enterprise customers requiring isolated data tenancy.",
    problemStatement:
      "Building enterprise multi-tenancy, custom role permissions, and billing webhooks from scratch takes months of error-prone boilerplate.",
    techStack: "Next.js 15, Supabase Auth & Postgres, Tailwind CSS, Stripe",
    defaultEnvironment: "Cursor",
    mode: "build",
    stages: ["Tenant Isolation", "Role Permissions", "Billing State Machine", "RLS Verification"],
    features: [
      "Row-Level Security (RLS) tenant isolation per organization",
      "Tiered subscription billing with grace period handling",
      "Granular RBAC (Owner, Admin, Member, Read-Only)",
      "Automated security audit logging for compliance",
    ],
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    rawIdea: `We are building a production-grade B2B SaaS multi-tenant workspace platform.

Key Requirements:
1. Multi-tenant database architecture where all queries are scoped to 'organization_id' using Supabase Row-Level Security (RLS).
2. Role-Based Access Control (RBAC): Owner, Admin, Member, and Viewer roles with strict permission checks on API routes and UI components.
3. Subscription billing integration via Stripe Webhooks: Plan tier entitlement verification, usage meter tracking, and customer portal management.
4. User management: Secure team invites via magic links, SSO-readiness, and activity audit logging.
5. High-performance UI built with Next.js 15 App Router, React Server Components, Tailwind CSS, and optimistic UI updates.`,
  },
  {
    id: "marketplace",
    title: "Two-Sided Service Marketplace",
    category: "Marketplace",
    badge: "Ecosystem Engine",
    tagline: "Service listings, vetted provider profiles, and automated booking dispatch.",
    description:
      "Two-sided marketplace architecture connecting clients with verified local or digital service providers. Features availability calendars, escrow payment hold, and verified review trust scores.",
    targetAudience: "On-demand service seekers and vetted independent service professionals.",
    problemStatement:
      "Coordinating service availability, escrow order stages, and preventing platform disintermediation is complex and risky.",
    techStack: "Next.js 15, Supabase Postgres, Tailwind CSS, Resend",
    defaultEnvironment: "Cursor",
    mode: "build",
    stages: ["User Personas", "Booking Flow", "Payment Escrow", "Review Verification"],
    features: [
      "Dual user onboarding (Client and Service Provider profiles)",
      "Realtime booking scheduling with slot conflict locking",
      "Escrow milestone payment state transitions",
      "Verified customer review rating calculations",
    ],
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    rawIdea: `We are building an on-demand, two-sided service marketplace connecting customers with verified local service specialists.

Key Requirements:
1. Dual onboarding flows: Customer registration vs. Service Provider onboarding with KYC credential verification.
2. Booking Engine: Interactive provider availability slots, booking request submission, and automated slot locking to prevent double-booking.
3. Payment State Machine: Payment authorization hold upon booking, capture upon job completion confirmation, and dispute resolution fallback.
4. Real-time messaging & notifications: In-app buyer-seller chat and automated SMS/email booking confirmations.
5. Trust & Review System: Only verified clients who completed a booking can submit ratings, calculating a tamper-proof provider trust index.`,
  },
  {
    id: "ai-copilot",
    title: "AI Automation & Workflow Copilot",
    category: "AI Product",
    badge: "Generative Intelligence",
    tagline: "Streaming agent councils, token budget defense, and structured JSON schemas.",
    description:
      "Autonomous AI assistant workspace designed for reasoning, code distillation, and multi-agent synthesis with strict token quotas and prompt-injection defense layers.",
    targetAudience: "Developers, vibe coders, and knowledge workers looking for guided AI workflows.",
    problemStatement:
      "Vibe coding without structured prompts leads to hallucinations, broken architectural assumptions, and ballooning API costs.",
    techStack: "Next.js 15, Google Gemini API, Supabase Postgres, Tailwind",
    defaultEnvironment: "Antigravity",
    mode: "build",
    stages: ["Prompt Engineering", "Security Threat Model", "Streaming UX", "Token Defense"],
    features: [
      "Multi-agent debate engine (PM, Architect, Security, QA)",
      "Streaming responses with real-time UI markdown parsing",
      "Defensive prompt sanitization & token usage tracking",
      "Deterministic structured JSON extraction with Zod schemas",
    ],
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    rawIdea: `We are building an AI Workflow Copilot and Agent Council platform for product engineers and vibe coders.

Key Requirements:
1. Multidisciplinary AI Council: Orchestrate 4 specialized agents (Product Manager, Lead Architect, Security Auditor, and UX Engineer) that critique ideas in structured rounds.
2. High-performance streaming responses using Google Gemini Flash models with real-time token tracking and client-side renderers.
3. Structured Output Enforcement: All AI outputs conform to strict Zod schemas with fallback healing for malformed JSON.
4. Defensive Guardrails: Input prompt sanitization, rate limiting per user tier, and zero-leakage API key isolation.
5. Exportable Blueprint: Generates copyable, 16-part implementation prompts ready for IDE coding assistants.`,
  },
  {
    id: "mobile-backend",
    title: "Mobile App API & Realtime Backend",
    category: "Mobile App",
    badge: "High-Throughput Core",
    tagline: "JWT bearer auth, device push notifications, and offline sync.",
    description:
      "High-throughput REST and WebSocket backend optimized for React Native / Flutter clients. Includes device session management, rate limiting, and push notification triggers.",
    targetAudience: "Mobile app developers and cross-platform native product teams.",
    problemStatement:
      "Mobile APIs require strict versioning, push notification queueing, and session revocation that standard web templates lack.",
    techStack: "Next.js Route Handlers, Supabase Postgres & Realtime, Expo Push",
    defaultEnvironment: "Cursor",
    mode: "build",
    stages: ["API Specification", "Token Auth", "Push Queues", "DB Constraints"],
    features: [
      "JWT bearer token authentication with refresh rotation",
      "Expo and APNs push notification dispatch queue",
      "Realtime Postgres change subscriptions",
      "API versioning with idempotent request handling",
    ],
    imageUrl: "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=800&auto=format&fit=crop&q=80",
    rawIdea: `We are creating a robust backend architecture for a high-performance mobile application.

Key Requirements:
1. RESTful API route handlers with strict versioning headers (/api/v1/...) and request validation via Zod.
2. Device session registry: Track active mobile device tokens (iOS/Android) with immediate remote revocation capability.
3. Push Notification Engine: Background queue for sending transactional notifications via Expo Push and Apple APNs.
4. Offline-first synchronization: Timestamps and conflict resolution for client data uploaded after offline periods.
5. Realtime presence & data sync: Supabase Realtime channels for instant data feed updates without polling.`,
  },
  {
    id: "ecommerce-engine",
    title: "E-Commerce & Inventory Management",
    category: "E-commerce",
    badge: "Commerce Engine",
    tagline: "Product catalogs, cart state machines, and real-time inventory locks.",
    description:
      "End-to-end commerce backbone with stock reserve locks during checkout, webhook-driven order fulfillment, and multi-currency support.",
    targetAudience: "DTC brands, online retailers, and digital product merchants.",
    problemStatement:
      "Inventory overselling during flash sales and unhandled payment drop-offs ruin customer trust.",
    techStack: "Next.js 15, Supabase Postgres, Tailwind CSS, Stripe",
    defaultEnvironment: "Cursor",
    mode: "build",
    stages: ["Product Catalog", "Cart Lock", "Checkout Webhook", "Order Fulfillment"],
    features: [
      "Atomic inventory reservation during checkout sessions",
      "Stripe Checkout & Elements integration",
      "Order status state machine with automated emails",
      "Admin analytics dashboard for revenue and inventory alerts",
    ],
    imageUrl: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop&q=80",
    rawIdea: `We are developing an ultra-fast modern E-Commerce storefront and back-office order inventory engine.

Key Requirements:
1. Product Catalog with multi-variant options (size, color, SKU), high-res media galleries, and real-time stock indicators.
2. Atomic Stock Reservation: When a customer enters checkout, reserve inventory with a 15-minute lease to prevent overselling.
3. Seamless Checkout: Stripe Checkout integration with webhook listeners to fulfill orders and update database records automatically.
4. Customer Account Portal: Order tracking history, digital invoice downloads, and address book management.
5. Admin Dashboard: Product CRUD management, stock replenishment alerts, and daily sales metrics.`,
  },
];

export function getTemplateById(id: string): StarterTemplate | undefined {
  return STARTER_TEMPLATES.find((t) => t.id === id);
}
