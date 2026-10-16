import { ProductType } from "@/types";

export interface ProductTypeArchitectureProfile {
  productType: ProductType;
  label: string;
  architecturalSummary: string;
  researchFocusAreas: string[];
  essentialQuestionDimensions: string[];
  typicalScreenPatterns: string[];
  typicalDataEntities: string[];
  uxAndConversionPriorities: string[];
  securityAndBackendPriorities: string[];
  antiBloatGuardrails: string[];
}

export const PRODUCT_TYPE_PROFILES: Record<ProductType, ProductTypeArchitectureProfile> = {
  "SaaS": {
    productType: "SaaS",
    label: "B2B / B2C Software-as-a-Service (SaaS)",
    architecturalSummary:
      "Multi-tenant recurring software platform centered around user/workspace onboarding, core value-creation workflows, role-based access control, and subscription/usage lifecycle management.",
    researchFocusAreas: [
      "Target customer workflow bottleneck and time-to-first-value (activation)",
      "Competitor SaaS pricing/tier mechanics and feature gating",
      "Multi-tenancy isolation model (individual user accounts vs. team workspaces/organizations)",
      "Core recurring workflow frequency and state transitions",
    ],
    essentialQuestionDimensions: [
      "Workspace & Tenancy Model: Will users work solo in personal accounts, or invite team members into shared workspaces with roles?",
      "Core Activation Workflow: What is the exact primary action a user must complete in their first session to get value?",
      "Monetization & Tier Gating: Will there be free/paid subscription tiers, usage limits, or trial periods at launch?",
      "Data & External Integrations: What specific domain records are created, and do they connect to external webhooks or APIs?",
    ],
    typicalScreenPatterns: [
      "Authentication & Workspace Onboarding (/login, /signup, /onboarding)",
      "Primary Workspace Dashboard & KPI Telemetry (/dashboard)",
      "Core Domain Workflow Studio & Execution View",
      "Workspace Settings, Team Members & Subscription Billing (/dashboard/settings)",
    ],
    typicalDataEntities: [
      "profiles / users",
      "workspaces / organizations (if team-based)",
      "workspace_members (role-scoped)",
      "domain-specific core entity (derived strictly from user idea)",
      "subscriptions / usage_logs (if monetized)",
    ],
    uxAndConversionPriorities: [
      "Frictionless onboarding that reaches the core workflow in under 60 seconds",
      "Clear empty states with guided first-action triggers",
      "Optimistic UI updates and skeleton loaders on all dashboard mutations",
    ],
    securityAndBackendPriorities: [
      "Supabase Row-Level Security (RLS) scoped to user_id or workspace_id",
      "Server-side ownership and role verification on all mutations",
      "Zod payload validation and idempotent webhook handlers",
    ],
    antiBloatGuardrails: [
      "Do not invent generic 'CoreResource' or 'WorkspaceItem' tables; name entities after the user's actual domain.",
      "Do not add complex enterprise SSO or multi-region replication unless requested.",
    ],
  },

  "Landing Page": {
    productType: "Landing Page",
    label: "High-Conversion Marketing & Product Landing Page",
    architecturalSummary:
      "Conversion-engineered web experience focused on immediate value communication, visual storytelling, interactive product previews, trust/social proof, SEO performance, and lead capture or waitlist persistence.",
    researchFocusAreas: [
      "Target audience primary pain point and above-the-fold value proposition hook",
      "Conversion goal (waitlist signup, lead capture form, consultation booking, or direct purchase redirect)",
      "Objection-handling sequence (how it works, feature breakdown, social proof, FAQ, pricing)",
      "Visual hierarchy, interactive micro-experiences, and Core Web Vitals / SEO metadata",
    ],
    essentialQuestionDimensions: [
      "Primary Conversion Goal: What is the single main action visitors should take (e.g., join waitlist, book a demo, request a quote, start free trial)?",
      "Lead Capture Data: What exact fields should be collected and stored in Supabase when a visitor converts (e.g., email only, name + company + use-case)?",
      "Key Page Sections & Interactive Proof: Which sections are essential (e.g., interactive demo/calculator, pricing tiers, customer testimonials, FAQ)?",
      "Post-Conversion Experience: What happens immediately after a visitor submits the CTA (e.g., instant confirmation state, downloadable asset, calendar redirect)?",
    ],
    typicalScreenPatterns: [
      "Hero Section with Primary Value Proposition, Interactive Visual & CTA (/)",
      "Problem-to-Solution Storytelling & Feature Showcase Grid",
      "Social Proof, Metrics/Benchmarks & Pricing/Comparison Section",
      "Lead Capture / Waitlist Form with Instant Confirmation State",
    ],
    typicalDataEntities: [
      "leads / waitlist_entries (stored in Supabase with rate-limiting and validation)",
      "page_analytics / conversion_events (if conversion tracking is requested)",
    ],
    uxAndConversionPriorities: [
      "Sub-second Largest Contentful Paint (LCP) and zero layout shift (CLS)",
      "Clear visual hierarchy with unmistakable primary CTA contrast across 360px mobile to 4K desktop",
      "Real Unsplash photography and crisp Lucide SVG iconography (zero emojis)",
    ],
    securityAndBackendPriorities: [
      "Server Action / API validation with Zod for lead/waitlist submissions",
      "Duplicate email handling and spam/rate-limit protection on public forms",
      "Supabase RLS allowing public INSERT on lead capture while restricting SELECT to service role/admin",
    ],
    antiBloatGuardrails: [
      "NEVER force user login/signup authentication walls, multi-tenant dashboards, or complex admin consoles onto a Landing Page unless the user explicitly asks for them.",
      "Focus 100% on conversion architecture, interactive sections, responsive polish, SEO metadata, and clean lead persistence.",
    ],
  },

  "E-commerce": {
    productType: "E-commerce",
    label: "Direct-to-Consumer (DTC) / Online E-commerce Store",
    architecturalSummary:
      "Transactional storefront and order fulfillment platform featuring product catalog browsing, variant/inventory selection, persistent shopping cart, checkout & payment verification, and order lifecycle tracking.",
    researchFocusAreas: [
      "Product catalog structure (physical vs. digital goods, variants like size/color, SKU pricing)",
      "Shopping cart & checkout flow (guest checkout vs. customer accounts, shipping calculation)",
      "Payment gateway expectations and order state machine (pending, paid, fulfilled, cancelled)",
      "Merchandising UX, product filtering, and mobile checkout conversion",
    ],
    essentialQuestionDimensions: [
      "Product & Variant Structure: What types of products are sold, and do they have variants (e.g., sizes, colors, digital tiers) or inventory stock limits?",
      "Checkout & Account Flow: Can shoppers buy via fast guest checkout, or must they create an account first?",
      "Payment & Fulfillment: How are payments collected (e.g., Stripe/Paystack online checkout vs. pay-on-delivery) and how is shipping/delivery handled?",
      "Store Management: What order status updates or catalog management controls does the store owner need?",
    ],
    typicalScreenPatterns: [
      "Storefront Home & Featured Collections (/)",
      "Product Catalog Grid with Category/Search Filters (/products)",
      "Product Detail Page with Variant Selector & Add-to-Cart (/products/[slug])",
      "Slide-over Cart Drawer & Checkout Flow (/checkout)",
      "Order Confirmation & Status Lookup (/orders/[id])",
      "Merchant Catalog & Order Fulfillment Console (/admin/orders)",
    ],
    typicalDataEntities: [
      "products & product_variants",
      "categories / collections",
      "carts & cart_items",
      "orders & order_items",
      "customer_profiles / shipping_addresses",
    ],
    uxAndConversionPriorities: [
      "Instant Add-to-Cart feedback and persistent cart state across refreshes",
      "High-resolution real Unsplash product imagery with responsive gallery layout",
      "Minimal-step mobile-friendly checkout with inline field validation",
    ],
    securityAndBackendPriorities: [
      "Server-side price and subtotal calculation (never trust client-submitted prices)",
      "Atomic inventory decrement and idempotent payment webhook verification",
      "Supabase RLS separating public catalog reads from private customer order records",
    ],
    antiBloatGuardrails: [
      "Do not use generic SaaS 'WorkspaceItem' schemas; model real products, variants, cart items, and orders.",
    ],
  },

  "Marketplace": {
    productType: "Marketplace",
    label: "Two-Sided Peer-to-Peer / B2B Marketplace",
    architecturalSummary:
      "Multi-actor platform connecting supply-side providers/sellers with demand-side buyers/customers through listings, discovery search, booking/purchasing transactions, and trust/review systems.",
    researchFocusAreas: [
      "Supply-side (vendor/provider) vs. demand-side (buyer/client) incentives and onboarding",
      "Listing structure, discovery search/filtering, and matching mechanics",
      "Transaction flow (instant book/buy vs. quote/request approval) and platform commission/payouts",
      "Trust, verification, ratings/reviews, and dispute prevention",
    ],
    essentialQuestionDimensions: [
      "Two-Sided Actors: Who are the providers/sellers and who are the buyers/customers on your marketplace?",
      "Listing & Discovery: What makes up a listing, and how do buyers search, filter, or compare listings?",
      "Booking / Transaction Flow: Do buyers purchase/book instantly, or do providers approve requests/send quotes first?",
      "Trust & Moderation: Do listings or providers require admin approval, ratings/reviews, or status tracking?",
    ],
    typicalScreenPatterns: [
      "Marketplace Discovery & Search/Filter Feed (/)",
      "Listing Detail & Booking/Purchase Drawer (/listings/[id])",
      "Seller/Provider Studio: Create & Manage Listings (/provider/dashboard)",
      "Buyer Activity: Bookings/Orders & Messages (/dashboard/orders)",
      "Marketplace Admin Moderation Console (/admin)",
    ],
    typicalDataEntities: [
      "profiles (with buyer / provider / admin role flags)",
      "provider_profiles / storefronts",
      "listings (with pricing, availability, attributes)",
      "bookings_or_orders (linking buyer_id, provider_id, listing_id)",
      "reviews_ratings",
    ],
    uxAndConversionPriorities: [
      "Fast multi-criteria search and filtering with zero page-reload lag",
      "Clear role switching or distinct dashboards for Buyers vs. Providers",
      "Transparent status badges across the transaction lifecycle",
    ],
    securityAndBackendPriorities: [
      "Strict RLS ensuring providers only edit their own listings and buyers only view their own transactions",
      "Server-side state transition validation on booking/order status changes",
    ],
    antiBloatGuardrails: [
      "Ensure both sides of the marketplace (supply and demand) are explicitly modeled rather than treating it as a single-user app.",
    ],
  },

  "Web App": {
    productType: "Web App",
    label: "Interactive Full-Stack Web Application",
    architecturalSummary:
      "Task-focused interactive web application centered around rich client-server state synchronization, user workflows, custom data persistence, and responsive cross-device usability.",
    researchFocusAreas: [
      "Core interactive utility and user workflow loop",
      "State persistence model (authenticated user storage, public shareable links, or real-time updates)",
      "UI layout paradigm (canvas, split-pane studio, feed, tracker, or calculator/tool)",
      "Data validation, export/sharing capabilities, and performance bottlenecks",
    ],
    essentialQuestionDimensions: [
      "Core Interactive Loop: Walk through what a user inputs, manipulates, and gets as output inside the web app.",
      "Accounts vs. Instant Access: Can users use the tool immediately without signing up, or is login required to save work?",
      "Data Persistence & Sharing: What records are saved to Supabase, and can users share, export, or collaborate on them?",
      "Key Views & Controls: What are the primary screens or interactive panels required for the MVP?",
    ],
    typicalScreenPatterns: [
      "Primary Interactive Workspace / App View",
      "Saved Items / History & Detail Inspector",
      "Shareable Public View or Export Modal (if applicable)",
      "Authentication & User Preferences (if account-backed)",
    ],
    typicalDataEntities: [
      "users / profiles (if authenticated)",
      "domain-specific primary records & child items",
      "shared_links / activity_logs (if applicable)",
    ],
    uxAndConversionPriorities: [
      "Zero-latency interactive controls with keyboard and touch accessibility",
      "Complete empty, loading, error, and success states on every async action",
      "Responsive layout adapting smoothly from 360px mobile to desktop",
    ],
    securityAndBackendPriorities: [
      "Server-side validation with Zod and Supabase RLS for all persisted records",
      "Clean separation between client UI components and server data mutations",
    ],
    antiBloatGuardrails: [
      "Tailor routes and tables strictly to the web app's actual utility; do not inject unrelated SaaS billing or admin panels unless requested.",
    ],
  },

  "Mobile App": {
    productType: "Mobile App",
    label: "Mobile-First Application / PWA Experience",
    architecturalSummary:
      "Touch-optimized, thumb-friendly mobile application architecture prioritizing bottom-tab navigation, fast gesture/sheet interactions, offline/poor-network resilience, and streamlined screen flows.",
    researchFocusAreas: [
      "On-the-go user context and thumb-zone interaction ergonomics",
      "Core mobile loop (capture, browse, notify, track, or message)",
      "Session persistence, push/in-app notification triggers, and media/camera/location needs",
      "Low-bandwidth resilience and optimistic UI updates",
    ],
    essentialQuestionDimensions: [
      "Primary On-the-Go Action: What is the main action a user performs on their phone in under 30 seconds?",
      "Navigation & Screen Flow: Which 3 to 4 main tabs or screens belong in the primary bottom navigation?",
      "Device & Media Capabilities: Does the app involve photo uploads, location/maps, or real-time status notifications?",
      "User Identity & Sync: How do users sign in, and what data syncs across their account in Supabase?",
    ],
    typicalScreenPatterns: [
      "Fast Onboarding & Authentication Screen",
      "Home Feed / Primary Action Tab",
      "Creation / Capture Bottom Sheet or Stepper",
      "Activity / Status Tracker Tab",
      "User Profile & Settings Tab",
    ],
    typicalDataEntities: [
      "profiles",
      "domain-specific mobile records & media attachments",
      "notifications / activity_events",
    ],
    uxAndConversionPriorities: [
      "Strict 44px+ touch targets, bottom-navigation ergonomics, and 360px+ mobile-first viewport perfection",
      "Optimistic mutations so the UI never freezes on slow mobile networks",
    ],
    securityAndBackendPriorities: [
      "Secure token/cookie session refresh and RLS-protected Supabase tables",
      "Validated media uploads via Supabase Storage buckets with size/MIME checks",
    ],
    antiBloatGuardrails: [
      "Avoid wide desktop-only multi-column tables that break on 360px mobile screens.",
    ],
  },

  "Internal Tool": {
    productType: "Internal Tool",
    label: "Internal Operations Dashboard & Back-Office Tool",
    architecturalSummary:
      "High-density operational system built for internal teams to inspect records, execute bulk workflows, enforce role-based approvals, and track audit logs with maximum efficiency.",
    researchFocusAreas: [
      "Internal operator roles (e.g., Support, Ops Manager, Finance, Admin) and permission boundaries",
      "High-frequency operational workflows, data tables, filtering, and approval state machines",
      "Audit trail accountability (who changed what and when)",
      "Data import/export (CSV/JSON) and external webhook/API triggers",
    ],
    essentialQuestionDimensions: [
      "Operator Roles & Permissions: Which internal team roles will use this tool, and what actions are restricted to managers/admins?",
      "Core Operational Workflow: What records are operators reviewing, creating, approving, or updating daily?",
      "Search, Filtering & Bulk Actions: How do operators need to filter, search, or batch-update records?",
      "Audit Trail & Integrations: Do status changes need an immutable audit log or trigger external notifications?",
    ],
    typicalScreenPatterns: [
      "Operations Command Center & Queue Metrics (/dashboard)",
      "High-Density Data Table with Filters, Search & Drawer Inspector",
      "Record Creation / Approval Workflow Modal",
      "Audit Log & Role Access Management (/admin/audit-log)",
    ],
    typicalDataEntities: [
      "operator_profiles (with department/role)",
      "operational_records (domain-specific)",
      "audit_logs (actor_id, action, entity_id, diff, timestamp)",
    ],
    uxAndConversionPriorities: [
      "Fast keyboard-friendly tables, clear status badges, and slide-over detail drawers",
      "Explicit confirmation modals for destructive or bulk operations",
    ],
    securityAndBackendPriorities: [
      "Strict role-based access control (RBAC) enforced in Supabase RLS and server actions",
      "Automatic server-side audit log insertion on every state-mutating action",
    ],
    antiBloatGuardrails: [
      "Do not add public marketing fluff; focus on operator speed, data accuracy, RBAC, and auditability.",
    ],
  },

  "AI Product": {
    productType: "AI Product",
    label: "AI-Native Application / Copilot / Generation Studio",
    architecturalSummary:
      "AI-powered application combining structured prompt/model orchestration, streaming or multi-step generation UX, context/history persistence in Supabase, and human-in-the-loop refinement.",
    researchFocusAreas: [
      "User input context -> AI transformation pipeline -> structured output artifact",
      "Latency UX (streaming progress, step indicators, editable output blocks)",
      "Hallucination guardrails, schema validation, and source grounding",
      "History persistence, versioning, and token/usage quotas",
    ],
    essentialQuestionDimensions: [
      "AI Input & Output Contract: What exact input does the user provide, and what structured output or artifact does the AI generate?",
      "Refinement & Human-in-the-Loop: How can the user edit, regenerate, version, or export the AI's output?",
      "Grounding & Context Memory: Does the AI need to reference saved project data, uploaded documents, or previous sessions in Supabase?",
      "Usage Guardrails: Are there rate limits, credit quotas, or API key configurations per user?",
    ],
    typicalScreenPatterns: [
      "AI Studio Workspace: Input Context & Prompt Controls",
      "Structured Output Inspector / Live Artifact Canvas",
      "Generation History & Version Comparison Drawer",
      "Account Quotas & Model Settings",
    ],
    typicalDataEntities: [
      "profiles & usage_quotas",
      "ai_sessions / workspaces",
      "generation_artifacts & artifact_versions",
      "context_documents (if grounded)",
    ],
    uxAndConversionPriorities: [
      "Transparent step-by-step generation feedback and resilient retry on AI timeouts",
      "One-click copy, download, and version comparison for generated outputs",
    ],
    securityAndBackendPriorities: [
      "Server-only AI API key execution (never expose LLM keys to client browser)",
      "Strict JSON schema validation on AI responses and per-user rate limiting",
    ],
    antiBloatGuardrails: [
      "Ensure AI calls are strictly server-side with structured output parsing and zero hardcoded fake responses.",
    ],
  },

  "API": {
    productType: "API",
    label: "Backend API Service & Developer Platform",
    architecturalSummary:
      "Headless backend service and developer portal exposing authenticated REST/webhook endpoints, strict Zod request/response contracts, rate limiting, and API key/usage telemetry.",
    researchFocusAreas: [
      "Core resource endpoints, HTTP methods, and payload schemas",
      "Authentication mechanism (Bearer API keys, JWT, HMAC webhook signatures)",
      "Idempotency, rate-limiting tiers, and structured error codes",
      "Developer portal needs (API key management, request logs, interactive docs)",
    ],
    essentialQuestionDimensions: [
      "Core Endpoints & Resources: What are the primary API endpoints and operations consumers will call?",
      "Authentication & Keys: Will consumers authenticate via generated API keys, user JWT tokens, or signed webhooks?",
      "Rate Limits & Reliability: What rate limits, idempotency rules, or async job queues are required?",
      "Developer Dashboard: Do users need a web dashboard to generate API keys, inspect request logs, and test endpoints?",
    ],
    typicalScreenPatterns: [
      "API Key Management & Secret Rotation Console (/dashboard/keys)",
      "Real-Time Request Logs & Error Telemetry Inspector (/dashboard/logs)",
      "Interactive Endpoint Documentation & Payload Playground (/docs)",
    ],
    typicalDataEntities: [
      "api_keys (hashed_key, prefix, scopes, user_id, last_used_at)",
      "api_request_logs (endpoint, method, status_code, latency_ms)",
      "domain_resources (persisted by the API)",
    ],
    uxAndConversionPriorities: [
      "Clear copyable curl/SDK snippets and structured JSON error responses",
      "Instant API key creation with one-time secret reveal and prefix masking",
    ],
    securityAndBackendPriorities: [
      "Store only SHA-256 hashes of API keys in Supabase; never store plaintext keys",
      "Strict Zod validation returning standard 400/401/403/429/500 JSON envelopes",
    ],
    antiBloatGuardrails: [
      "Focus on rock-solid route handlers, schema contracts, key security, and developer telemetry.",
    ],
  },

  "Other": {
    productType: "Other",
    label: "Custom Digital Product Architecture",
    architecturalSummary:
      "Custom-tailored software application synthesized directly from the user's domain concept, primary actors, core workflows, and persistence requirements.",
    researchFocusAreas: [
      "Primary user actors and their core problem statement",
      "End-to-end workflow from entry to value completion",
      "Required screens, interactive states, and Supabase data entities",
      "Security, validation, and responsive UX constraints",
    ],
    essentialQuestionDimensions: [
      "Primary Users & Access: Who will use this product, and do they need accounts/roles or public access?",
      "Core End-to-End Workflow: What is the step-by-step action a user takes from arriving on the app to achieving their goal?",
      "Data & Persistence: What information needs to be saved, updated, or displayed in real time?",
      "Key Screens & Deliverables: What are the most important pages or components for the first version?",
    ],
    typicalScreenPatterns: [
      "Primary Entry & Core Action View",
      "Domain Data / Activity Management Screen",
      "User / System Configuration View (if applicable)",
    ],
    typicalDataEntities: [
      "domain-specific entities derived strictly from the user's answers",
    ],
    uxAndConversionPriorities: [
      "Responsive layout across mobile (360px+), tablet, and desktop",
      "Explicit loading, empty, error, and success states",
    ],
    securityAndBackendPriorities: [
      "Supabase RLS policies and Zod server-side input validation",
    ],
    antiBloatGuardrails: [
      "Never invent generic placeholder entities; derive every screen and table from the user's actual domain.",
    ],
  },
};

export function getProductTypeProfile(
  productType?: string | null
): ProductTypeArchitectureProfile {
  if (!productType) {
    return PRODUCT_TYPE_PROFILES["SaaS"];
  }
  const normalized = Object.keys(PRODUCT_TYPE_PROFILES).find(
    (k) => k.toLowerCase() === productType.trim().toLowerCase()
  ) as ProductType | undefined;

  return normalized
    ? PRODUCT_TYPE_PROFILES[normalized]
    : PRODUCT_TYPE_PROFILES["Other"];
}
