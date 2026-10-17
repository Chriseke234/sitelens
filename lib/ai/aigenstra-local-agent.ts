import { getProductTypeProfile } from "./product-type-profiles";
import {
  AdaptiveDiscoveryQuestion,
  AigenstraTask,
  BuildMap,
  BuildStage,
  DiscoveryQnA,
  IdeaUnderstandingRecord,
  ProductAssumption,
  ProductSummary,
  ProductType,
  SoftwareBlueprint,
  TaskRecommendation,
} from "@/types";

export interface ExtractedDomainIntelligence {
  projectName: string;
  productType: ProductType;
  cleanDescription: string;
  primaryRole: string;
  secondaryRole: string;
  primaryEntityName: string;
  primaryEntityPlural: string;
  secondaryEntityName: string;
  coreActionVerb: string;
  targetGoal: string;
  techStack: string;
  confirmedDecisions: Array<{
    category: string;
    question: string;
    answer: string;
  }>;
}

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "that",
  "with",
  "this",
  "from",
  "your",
  "have",
  "will",
  "want",
  "build",
  "building",
  "create",
  "creating",
  "make",
  "making",
  "platform",
  "system",
  "application",
  "website",
  "webapp",
  "landing",
  "page",
  "app",
  "saas",
  "tool",
  "product",
  "users",
  "user",
  "people",
  "where",
  "can",
  "able",
  "help",
  "helps",
  "allow",
  "allows",
  "online",
  "modern",
  "simple",
  "easy",
  "fast",
  "smart",
  "digital",
  "custom",
  "business",
  "store",
  "shop",
]);

function toPascalCase(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9\s_-]/g, " ")
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

function toSlug(input: string): string {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

/**
 * Dynamically analyzes the user's raw idea, project metadata, and confirmed discovery answers
 * to extract concrete domain entities, user roles, and workflows without guesswork.
 */
export function analyzeProjectContext(
  projectName: string,
  productDescription: string,
  productType?: string | null,
  qnas: Array<{ question: string; answer?: string | null; category?: string }> = [],
  projectDetails?: {
    targetAudience?: string | null;
    problemStatement?: string | null;
    goal?: string | null;
    techStack?: string | null;
  }
): ExtractedDomainIntelligence {
  const profile = getProductTypeProfile(productType);
  const pType = profile.productType;
  const cleanDescription =
    (productDescription || "").trim() ||
    projectDetails?.problemStatement ||
    `${projectName} (${profile.label})`;

  const combinedText = `${projectName} ${cleanDescription} ${
    projectDetails?.problemStatement || ""
  }`.toLowerCase();

  // Extract domain-specific entity names from the user's idea and product type
  let primaryEntityName = "";
  let secondaryEntityName = "";
  let primaryRole = projectDetails?.targetAudience?.trim() || "";
  let secondaryRole = "Workspace Admin";
  let coreActionVerb = "manage and track";

  // Domain keyword heuristics grounded in real product verticals
  const domainMatchers: Array<{
    keywords: string[];
    primaryEntity: string;
    secondaryEntity: string;
    role: string;
    verb: string;
  }> = [
    {
      keywords: ["appointment", "clinic", "patient", "doctor", "medical", "health", "therapy"],
      primaryEntity: "AppointmentBooking",
      secondaryEntity: "PatientRecord",
      role: "Patient & Practitioner",
      verb: "schedule and manage clinical appointments",
    },
    {
      keywords: ["invoice", "billing", "accounting", "expense", "finance", "budget", "payroll"],
      primaryEntity: "InvoiceRecord",
      secondaryEntity: "TransactionLedger",
      role: "Business Owner & Finance User",
      verb: "create, send, and reconcile financial records",
    },
    {
      keywords: ["course", "lesson", "student", "tutor", "learning", "quiz", "education", "academy"],
      primaryEntity: "LearningModule",
      secondaryEntity: "StudentProgress",
      role: "Student & Instructor",
      verb: "enroll in courses and track lesson mastery",
    },
    {
      keywords: ["fitness", "workout", "gym", "trainer", "nutrition", "meal", "habit", "coaching"],
      primaryEntity: "WorkoutPlan",
      secondaryEntity: "ProgressCheckIn",
      role: "Member & Coach",
      verb: "log workouts and track personal coaching goals",
    },
    {
      keywords: ["property", "real estate", "rental", "tenant", "landlord", "apartment", "hotel"],
      primaryEntity: "PropertyListing",
      secondaryEntity: "BookingInquiry",
      role: "Prospective Buyer / Renter",
      verb: "browse listings and schedule property viewings",
    },
    {
      keywords: ["restaurant", "food", "menu", "delivery", "kitchen", "catering", "recipe", "cafe"],
      primaryEntity: "MenuOrder",
      secondaryEntity: "MenuItem",
      role: "Diner & Kitchen Staff",
      verb: "browse the menu and place real-time food orders",
    },
    {
      keywords: ["job", "recruit", "candidate", "resume", "hiring", "talent", "career"],
      primaryEntity: "JobPosting",
      secondaryEntity: "CandidateApplication",
      role: "Candidate & Hiring Manager",
      verb: "publish roles and evaluate applicant pipelines",
    },
    {
      keywords: ["event", "ticket", "conference", "RSVP", "concert", "booking"],
      primaryEntity: "EventListing",
      secondaryEntity: "TicketReservation",
      role: "Attendee & Event Organizer",
      verb: "discover events and reserve verified tickets",
    },
    {
      keywords: ["task", "project", "kanban", "sprint", "workflow", "team", "productivity", "crm", "lead"],
      primaryEntity: "ProjectWorkflow",
      secondaryEntity: "ActionItem",
      role: "Team Member & Lead",
      verb: "organize workflows, assign tasks, and track delivery",
    },
  ];

  for (const matcher of domainMatchers) {
    if (matcher.keywords.some((kw) => combinedText.includes(kw))) {
      primaryEntityName = matcher.primaryEntity;
      secondaryEntityName = matcher.secondaryEntity;
      if (!primaryRole) primaryRole = matcher.role;
      coreActionVerb = matcher.verb;
      break;
    }
  }

  // Product-Type Specific Fallbacks if no vertical keyword matched
  if (!primaryEntityName) {
    const words = `${projectName} ${cleanDescription}`
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOP_WORDS.has(w.toLowerCase()));

    const extractedRoot = toPascalCase(words[0] || projectName || "Product");

    switch (pType) {
      case "Landing Page":
        primaryEntityName = `${extractedRoot}LeadCapture`;
        secondaryEntityName = "ConversionSection";
        if (!primaryRole) primaryRole = "Prospective Visitor & Early Adopter";
        secondaryRole = "Marketing Owner";
        coreActionVerb = "understand the value proposition and convert via the primary CTA";
        break;
      case "Business Website":
        primaryEntityName = "ClientServiceInquiry";
        secondaryEntityName = "ServicePackage";
        if (!primaryRole) primaryRole = "Prospective Client";
        secondaryRole = "Business Owner";
        coreActionVerb = "explore services, review case studies, and book a consultation or quote";
        break;
      case "E-commerce":
        primaryEntityName = `${extractedRoot}Product`;
        secondaryEntityName = "CustomerOrder";
        if (!primaryRole) primaryRole = "Online Shopper";
        secondaryRole = "Store Merchandiser";
        coreActionVerb = "browse products, select variants, and complete checkout";
        break;
      case "Marketplace":
        primaryEntityName = `${extractedRoot}Listing`;
        secondaryEntityName = "MarketplaceBooking";
        if (!primaryRole) primaryRole = "Buyer & Seller";
        secondaryRole = "Marketplace Operator";
        coreActionVerb = "publish listings, match supply with demand, and transact safely";
        break;
      case "AI Product":
        primaryEntityName = `${extractedRoot}GenerationRun`;
        secondaryEntityName = "PromptTemplate";
        if (!primaryRole) primaryRole = "Creator & Power User";
        secondaryRole = "Workspace Admin";
        coreActionVerb = "submit structured inputs, stream AI outputs, and refine results";
        break;
      case "Internal Tool":
        primaryEntityName = `${extractedRoot}OperationRecord`;
        secondaryEntityName = "AuditLogEntry";
        if (!primaryRole) primaryRole = "Operations Specialist";
        secondaryRole = "System Administrator";
        coreActionVerb = "filter operational records, execute batch actions, and audit changes";
        break;
      case "API":
        primaryEntityName = `${extractedRoot}ApiKey`;
        secondaryEntityName = "WebhookDeliveryLog";
        if (!primaryRole) primaryRole = "API Consumer / Developer";
        secondaryRole = "Platform Engineer";
        coreActionVerb = "authenticate via API keys and execute validated REST/webhook calls";
        break;
      case "Mobile App":
        primaryEntityName = `${extractedRoot}ActivityEntry`;
        secondaryEntityName = "UserNotification";
        if (!primaryRole) primaryRole = "Mobile User";
        secondaryRole = "App Administrator";
        coreActionVerb = "capture on-the-go actions with thumb-friendly mobile navigation";
        break;
      case "SaaS":
      case "Web App":
      default:
        primaryEntityName = `${extractedRoot}Workspace`;
        secondaryEntityName = `${extractedRoot}Record`;
        if (!primaryRole) primaryRole = `${projectName} User`;
        secondaryRole = "Workspace Owner";
        coreActionVerb = `create, manage, and automate ${projectName} workflows`;
        break;
    }
  }

  const primaryEntityPlural = `${toSlug(primaryEntityName)}s`;
  const confirmedDecisions = (qnas || [])
    .filter((q) => q.answer && q.answer.trim().length > 0)
    .map((q, idx) => ({
      category: q.category || `DECISION_${idx + 1}`,
      question: q.question,
      answer: q.answer!.trim(),
    }));

  return {
    projectName,
    productType: pType,
    cleanDescription,
    primaryRole,
    secondaryRole,
    primaryEntityName,
    primaryEntityPlural,
    secondaryEntityName,
    coreActionVerb,
    targetGoal:
      projectDetails?.goal ||
      `Build and ship a production-ready ${pType} for ${projectName} from scratch to final launch.`,
    techStack:
      projectDetails?.techStack ||
      "Next.js 15 (App Router), TypeScript, Tailwind CSS, Supabase (PostgreSQL + Auth + RLS)",
    confirmedDecisions,
  };
}

/**
 * Built-In Research Agent: Synthesizes deep, beginner-friendly domain and architectural
 * research tailored to the user's Product Type and idea whenever Gemini API is unavailable.
 */
export function runBuiltInResearchAgent(
  projectName: string,
  productDescription: string,
  qnaContext: Array<{ question: string; answer?: string | null }> = [],
  productType?: string | null,
  projectDetails?: {
    targetAudience?: string | null;
    problemStatement?: string | null;
    goal?: string | null;
    techStack?: string | null;
  }
) {
  const profile = getProductTypeProfile(productType);
  const ctx = analyzeProjectContext(
    projectName,
    productDescription,
    productType,
    qnaContext,
    projectDetails
  );

  const marketSummary = `${ctx.projectName} is a ${profile.label} designed to help ${ctx.primaryRole} ${ctx.coreActionVerb}. Based on ${ctx.productType} engineering best practices, the architecture should prioritize ${profile.uxAndConversionPriorities[0].toLowerCase()} while enforcing ${profile.securityAndBackendPriorities[0].toLowerCase()}.`;

  const recommendedFeatures = getRecommendedFeaturesForProductType(ctx);

  return {
    market_summary: marketSummary,
    market_context: marketSummary,
    user_context: `Target users (${ctx.primaryRole}) need a clear, zero-friction path to ${ctx.coreActionVerb} without confusing navigation or slow page transitions. Every screen must work seamlessly across mobile (360px+), tablet, and desktop viewports.`,
    recommended_features: recommendedFeatures,
    competitor_analysis: [
      {
        name: `Traditional ${ctx.productType} Templates & Generic Builders`,
        strengths: "Familiar layout patterns and basic static pages",
        weaknesses:
          "Bloated with unused features, poor mobile conversion flow, and fragile data validation",
        differentiation: `${ctx.projectName} focuses strictly on a streamlined ${ctx.primaryEntityName} workflow tailored for ${ctx.primaryRole} with real-time Supabase persistence.`,
      },
      {
        name: "Manual Spreadsheets / Disconnected Tools",
        strengths: "Low initial setup effort",
        weaknesses:
          "High human error, zero automated validation, and no unified self-serve experience for end users",
        differentiation: `${ctx.projectName} provides a dedicated, responsive interface with automated state tracking and strict access rules.`,
      },
    ],
    user_needs: [
      `Clear onboarding and immediate clarity on how to ${ctx.coreActionVerb}`,
      `Fast, mobile-responsive interface (360px+) with instant visual feedback on every action`,
      `Reliable persistence for ${ctx.primaryEntityName} and ${ctx.secondaryEntityName} in Supabase`,
      `Predictable error handling, empty states, and loading skeletons so users are never confused`,
    ],
    risks: [
      {
        risk: `Over-complicating the initial MVP of ${ctx.projectName} with unnecessary screens before the core ${ctx.primaryEntityName} flow works`,
        severity: "HIGH",
        mitigation:
          "Follow Aigenstra's 5-step From-Scratch-to-Production build sequence so each prompt builds cleanly on the last without wasting tokens.",
      },
      {
        risk: "Missing server-side input validation or Supabase Row-Level Security (RLS) policies",
        severity: "HIGH",
        mitigation:
          "Define explicit PostgreSQL RLS rules and Zod validation schemas in Step 1 before wiring frontend forms.",
      },
    ],
    opportunities: [
      `Deliver a focused, high-converting ${ctx.productType} experience that solves "${ctx.cleanDescription}" in under 60 seconds`,
      `Structure modular Next.js 15 Server & Client Components so future features can be added without refactoring`,
    ],
    assumptions: [
      {
        assumption: `${ctx.projectName} will use ${ctx.techStack} with responsive Tailwind CSS components`,
        status: "VERIFIED" as const,
      },
      {
        assumption: `Core domain data centers around ${ctx.primaryEntityName} and ${ctx.secondaryEntityName}`,
        status: "INFERRED" as const,
      },
    ],
    hypotheses: [
      `Guiding ${ctx.primaryRole} directly to the core ${ctx.primaryEntityName} action will maximize activation and completion rates.`,
    ],
    sources: [
      {
        title: `Aigenstra Built-In ${profile.label} Playbook`,
        notes: `Adaptive domain & architecture synthesis for ${ctx.projectName}`,
      },
    ],
  };
}

function getRecommendedFeaturesForProductType(
  ctx: ExtractedDomainIntelligence
): Array<{ title: string; rationale: string }> {
  switch (ctx.productType) {
    case "Landing Page":
      return [
        {
          title: "Above-the-Fold Hero & Value Proposition",
          rationale: `Immediately communicates how ${ctx.projectName} helps ${ctx.primaryRole} with a high-contrast primary CTA.`,
        },
        {
          title: "Interactive Feature & Benefit Showcase",
          rationale: `Visually breaks down the core benefits of ${ctx.projectName} so visitors understand the product without reading walls of text.`,
        },
        {
          title: "Supabase Lead / Waitlist Capture Form",
          rationale: `Captures visitor emails and intent directly into a validated Supabase table with instant confirmation state.`,
        },
        {
          title: "Social Proof, FAQ Accordion & SEO Metadata",
          rationale: `Builds buyer trust, resolves objections, and configures OpenGraph + semantic HTML for search visibility.`,
        },
      ];

    case "Business Website":
      return [
        {
          title: "Brand Authority Hero & Services Breakdown",
          rationale: `Presents ${ctx.projectName}'s core services, packages, and value proposition clearly to ${ctx.primaryRole}.`,
        },
        {
          title: "Interactive Consultation / Quote Booking Form",
          rationale: `Allows prospective clients to request a quote or schedule a consultation saved directly to Supabase.`,
        },
        {
          title: "Case Studies, Portfolio & Client Testimonials",
          rationale: `Demonstrates proven results and credibility to convert hesitant prospects.`,
        },
        {
          title: "Protected Admin Inquiry Inbox",
          rationale: `Gives the business owner a clean dashboard to view and update incoming client inquiries.`,
        },
      ];

    case "E-commerce":
      return [
        {
          title: `Filterable ${ctx.primaryEntityName} Catalog & Search`,
          rationale: `Lets shoppers browse ${ctx.projectName} items by category, price, and availability on mobile and desktop.`,
        },
        {
          title: "Product Detail View & Persistent Slide-Over Cart",
          rationale: `Displays high-clarity product images, variant selectors, stock badges, and instant cart updates.`,
        },
        {
          title: "Streamlined Checkout & Payment Webhook Handler",
          rationale: `Supports frictionless checkout with server-side price verification and order creation in Supabase.`,
        },
        {
          title: "Customer Order Confirmation & Store Admin Manager",
          rationale: `Provides order status tracking for buyers and inventory/order management for the store owner.`,
        },
      ];

    case "SaaS":
      return [
        {
          title: "Frictionless Auth & Guided Workspace Onboarding",
          rationale: `Gets new ${ctx.primaryRole} accounts into their ${ctx.projectName} workspace in under 60 seconds.`,
        },
        {
          title: `Core ${ctx.primaryEntityName} Creation & Management Studio`,
          rationale: `The primary recurring value loop where users ${ctx.coreActionVerb} with real-time persistence.`,
        },
        {
          title: "KPI Telemetry Dashboard & Activity Feed",
          rationale:
            "Surfaces live metrics, status filters, and quick actions on /dashboard.",
        },
        {
          title: "Account Settings, Role Permissions & Tier Gating",
          rationale: `Secures multi-tenant data with Supabase RLS and manages user profile/subscription preferences.`,
        },
      ];

    default:
      return [
        {
          title: `Primary ${ctx.primaryEntityName} Interactive Workflow`,
          rationale: `Enables ${ctx.primaryRole} to ${ctx.coreActionVerb} with validated inputs and instant UI feedback.`,
        },
        {
          title: "Responsive Dashboard & Status Overview",
          rationale: `Organizes active ${ctx.primaryEntityName} records with search, filtering, and empty/loading states.`,
        },
        {
          title: "Supabase PostgreSQL Schema & Row-Level Security",
          rationale: `Protects user data at the database layer with strict ownership policies.`,
        },
        {
          title: "Account & Preferences Management",
          rationale: `Provides clean navigation, profile controls, and error recovery across mobile and desktop.`,
        },
      ];
  }
}

/**
 * Built-In Discovery Agent: Generates 4 tailored, beginner-friendly discovery questions
 * grounded in the user's Product Type and idea whenever Gemini API is unavailable.
 */
export function runBuiltInDiscoveryAgent(
  projectName: string,
  productDescription: string,
  previousQnA: Array<{ question: string; answer?: string | null }> = [],
  productType?: string | null
): AdaptiveDiscoveryQuestion[] {
  const ctx = analyzeProjectContext(
    projectName,
    productDescription,
    productType,
    previousQnA
  );

  switch (ctx.productType) {
    case "Landing Page":
      return [
        {
          question: `What is the single main action (Primary CTA) you want visitors to take on ${ctx.projectName}?`,
          priority: "MUST_KNOW",
          whyItMatters:
            "Knowing your exact conversion goal ensures your coding agent builds the right hero CTA, form fields, and Supabase table without wasting tokens on unneeded pages.",
          suggestedOptions: [
            `(Recommended) Join Early-Access Waitlist / Capture Email in Supabase`,
            `Book a Demo / Submit a Lead Qualification Form`,
            `Direct Sign-Up / Start Free Trial Flow`,
          ],
          defaultRecommendation:
            "Join Early-Access Waitlist / Capture Email in Supabase",
          defaultAssumption:
            "Visitors convert via a validated email & intent capture form stored in Supabase.",
        },
        {
          question: `Which interactive section will best convince ${ctx.primaryRole} of ${ctx.projectName}'s value?`,
          priority: "MUST_KNOW",
          whyItMatters:
            "An interactive showcase makes your landing page stand out and helps visitors immediately understand how your product works.",
          suggestedOptions: [
            `(Recommended) Interactive Feature Tabs + Step-by-Step "How It Works" Preview`,
            `Interactive ROI / Pricing Calculator + Comparison Table`,
            `Live Product Mockup Walkthrough + Before/After Comparison`,
          ],
          defaultRecommendation:
            'Interactive Feature Tabs + Step-by-Step "How It Works" Preview',
          defaultAssumption:
            "Include interactive feature tabs and a 3-step visual walkthrough section.",
        },
        {
          question: `What information should ${ctx.projectName} collect when a visitor submits the form?`,
          priority: "HELPFUL",
          whyItMatters:
            "Defines the exact columns in your Supabase leads table and the Zod validation rules for the form.",
          suggestedOptions: [
            `(Recommended) Full Name, Email Address, and Primary Use Case / Goal`,
            `Email Address Only (Ultra-low friction 1-click signup)`,
            `Name, Work Email, Company Size, and Message`,
          ],
          defaultRecommendation:
            "Full Name, Email Address, and Primary Use Case / Goal",
          defaultAssumption:
            "Collect full_name, email, and use_case in the Supabase leads table.",
        },
        {
          question: `Which trust and conversion sections should we include on the page?`,
          priority: "HELPFUL",
          whyItMatters:
            "Determines the complete page layout order so the coding agent builds a cohesive, responsive landing page in one pass.",
          suggestedOptions: [
            `(Recommended) Social Proof Metrics + Pricing Tiers + FAQ Accordion`,
            `Customer Testimonials + Feature Grid + FAQ Accordion`,
            `Minimalist Hero + Core Benefits + Final CTA Banner`,
          ],
          defaultRecommendation:
            "Social Proof Metrics + Pricing Tiers + FAQ Accordion",
          defaultAssumption:
            "Include social proof metrics, transparent pricing cards, and an interactive FAQ accordion.",
        },
      ];

    case "Business Website":
      return [
        {
          question: `How should prospective clients reach out or book services on ${ctx.projectName}?`,
          priority: "MUST_KNOW",
          whyItMatters:
            "Shapes your primary conversion page and the Supabase database table that stores incoming client leads.",
          suggestedOptions: [
            `(Recommended) Service Inquiry & Custom Quote Request Form (stored in Supabase)`,
            `Consultation Booking Request with Preferred Date, Time & Service Package`,
            `Direct Contact Form + Instant WhatsApp / Phone / Email Quick Actions`,
          ],
          defaultRecommendation:
            "Service Inquiry & Custom Quote Request Form (stored in Supabase)",
          defaultAssumption:
            "Prospective clients submit a validated service inquiry & quote form saved to Supabase.",
        },
        {
          question: `How should ${ctx.projectName}'s services or solutions be presented to visitors?`,
          priority: "MUST_KNOW",
          whyItMatters:
            "Helps the coding agent structure clear service cards, deliverables lists, and pricing/package expectations.",
          suggestedOptions: [
            `(Recommended) Tiered Service Packages with Deliverables & "Request Quote" CTA`,
            `Dedicated Category Grid with Detailed Service Breakdown Modals/Pages`,
            `Custom Solutions Showcase with Step-by-Step Process Timeline`,
          ],
          defaultRecommendation:
            'Tiered Service Packages with Deliverables & "Request Quote" CTA',
          defaultAssumption:
            "Display structured service packages with clear deliverables and direct inquiry triggers.",
        },
        {
          question: `Which credibility and trust sections are most important for ${ctx.projectName}?`,
          priority: "HELPFUL",
          whyItMatters:
            "Business websites convert on trust—this locks in the exact portfolio, testimonial, and FAQ components.",
          suggestedOptions: [
            `(Recommended) Featured Case Studies / Portfolio + Client Testimonials + FAQ`,
            `Key Results / Metrics Counter + Client Logos + Team Credentials`,
            `Before/After Project Gallery + Verified Client Reviews`,
          ],
          defaultRecommendation:
            "Featured Case Studies / Portfolio + Client Testimonials + FAQ",
          defaultAssumption:
            "Include a portfolio/case study showcase, client testimonials, and an FAQ section.",
        },
        {
          question: `Do you want a protected Admin Dashboard to manage incoming client inquiries?`,
          priority: "HELPFUL",
          whyItMatters:
            "Determines whether we include an authenticated `/admin` inbox route with Supabase RLS for the business owner.",
          suggestedOptions: [
            `(Recommended) Yes — Include a Protected Admin Inbox to view & update inquiry status`,
            `Yes — Admin Inbox plus ability to add/edit Services & Portfolio items`,
            `No — Keep the website public-facing only and store leads in Supabase`,
          ],
          defaultRecommendation:
            "Yes — Include a Protected Admin Inbox to view & update inquiry status",
          defaultAssumption:
            "Include a protected /admin/inquiries dashboard for the business owner.",
        },
      ];

    case "E-commerce":
      return [
        {
          question: `What type of products and variant options will ${ctx.projectName} sell?`,
          priority: "MUST_KNOW",
          whyItMatters:
            "Defines your Supabase product catalog schema (SKUs, sizes/colors, stock counts, or digital files) from day one.",
          suggestedOptions: [
            `(Recommended) Physical Products with Variants (Size/Color/Option) & Inventory Stock Tracking`,
            `Simple Single-SKU Products with Category Filtering & Search`,
            `Digital Products / Instant Downloads after Checkout`,
          ],
          defaultRecommendation:
            "Physical Products with Variants (Size/Color/Option) & Inventory Stock Tracking",
          defaultAssumption:
            "Support products with selectable variants, images, categories, and stock tracking.",
        },
        {
          question: `How should shoppers experience the Cart and Checkout flow on ${ctx.projectName}?`,
          priority: "MUST_KNOW",
          whyItMatters:
            "Prevents cart abandonment and tells the coding agent whether to force login or allow fast guest checkout.",
          suggestedOptions: [
            `(Recommended) Persistent Slide-Over Cart Drawer + Fast Guest Checkout (Optional Account)`,
            `Dedicated Cart Page + Registered Customer Account Checkout`,
            `Instant "Buy Now" Express Checkout Modal + Order Lookup`,
          ],
          defaultRecommendation:
            "Persistent Slide-Over Cart Drawer + Fast Guest Checkout (Optional Account)",
          defaultAssumption:
            "Use a slide-over cart drawer with guest-friendly checkout and optional customer login.",
        },
        {
          question: `What target country/currency, payment provider, and fulfillment model will ${ctx.projectName} support?`,
          priority: "MUST_KNOW",
          whyItMatters:
            "Materially impacts your database pricing columns (currency ISO code, integer cents), tax jurisdiction handling, and shipping carrier integrations.",
          suggestedOptions: [
            `(Recommended) Global / US (USD) via Stripe Checkout + Standard Carrier Shipping (Tracking URL)`,
            `Regional / Multi-Currency via Lemon Squeezy (Merchant of Record / Global Tax included) + Tiered Delivery`,
            `Local / Emerging Market (e.g. Paystack / Flutterwave) + Local Courier & Pay-on-Delivery / Bank Transfer option`,
            `UK & European Union (GBP / EUR) with Automated Destination VAT + Standard Courier Fulfillment`,
          ],
          defaultRecommendation:
            "Global / US (USD) via Stripe Checkout + Standard Carrier Shipping (Tracking URL)",
          defaultAssumption:
            "Store prices in integer cents in USD, process online checkout with server webhook verification, and support standard carrier tracking.",
        },
        {
          question: `What store management tools does the store owner need in the Admin view?`,
          priority: "HELPFUL",
          whyItMatters:
            "Scopes the merchant admin dashboard so you can add products, update stock, and fulfill customer orders.",
          suggestedOptions: [
            `(Recommended) Product CRUD Manager + Order Fulfillment Status Dashboard (/admin)`,
            `Full Store Admin: Products, Inventory Alerts, Orders & Revenue Summary`,
            `Lightweight Order Viewer (manage products directly in Supabase studio)`,
          ],
          defaultRecommendation:
            "Product CRUD Manager + Order Fulfillment Status Dashboard (/admin)",
          defaultAssumption:
            "Build a protected /admin dashboard for managing products and updating order statuses.",
        },
      ];

    case "SaaS":
    default:
      return [
        {
          question: `How should users access and organize their work inside ${ctx.projectName}?`,
          priority: "MUST_KNOW",
          whyItMatters:
            "Sets your Supabase authentication and Row-Level Security (RLS) model—whether data belongs to individual users (user_id) or shared team workspaces (organization_id).",
          suggestedOptions: [
            `(Recommended) Individual User Accounts with Private Personal Workspace (user_id RLS — fastest to build & launch)`,
            `Multi-Tenant Team Workspaces (organizations + organization_members tables with role-based RLS)`,
            `Public Preview Mode with Sign-In required to save and manage ${ctx.primaryEntityName} records`,
          ],
          defaultRecommendation:
            "Individual User Accounts with Private Personal Workspace (user_id RLS — fastest to build & launch)",
          defaultAssumption:
            "Each authenticated user gets a private workspace protected by user_id Row-Level Security.",
        },
        {
          question: `What is the core step-by-step action a user performs with ${ctx.primaryEntityName} in their first session?`,
          priority: "MUST_KNOW",
          whyItMatters:
            "This is the heart of your product. Locking this down ensures your coding agent builds a real, working workflow that delivers Time to First Value (TTFV) in under 60 seconds.",
          suggestedOptions: [
            `(Recommended) Create a new ${ctx.primaryEntityName} via a guided form, view live status, and edit/update it on the dashboard`,
            `Configure parameters, run an automated ${ctx.projectName} analysis/generation, and export or share the result`,
            `Import/log ${ctx.primaryEntityName} entries, filter by status, and track progress metrics in real time`,
          ],
          defaultRecommendation: `Create a new ${ctx.primaryEntityName} via a guided form, view live status, and edit/update it on the dashboard`,
          defaultAssumption: `Users can create, view, filter, update, and delete ${ctx.primaryEntityName} records with instant UI feedback.`,
        },
        {
          question: `What key metrics or views should appear on the main ${ctx.projectName} Dashboard?`,
          priority: "HELPFUL",
          whyItMatters:
            "Defines the exact layout and components of your main workspace screen so users immediately see value after signing in.",
          suggestedOptions: [
            `(Recommended) KPI Summary Cards + Filterable ${ctx.primaryEntityName} List + Quick-Create Action Modal`,
            `Interactive Kanban / Status Pipeline Board + Recent Activity Feed`,
            `Focused Studio Split-View (Input/Controls on Left, Live ${ctx.primaryEntityName} Output on Right)`,
          ],
          defaultRecommendation: `KPI Summary Cards + Filterable ${ctx.primaryEntityName} List + Quick-Create Action Modal`,
          defaultAssumption: `Main dashboard displays real-time KPI summary cards, a filterable ${ctx.primaryEntityName} list, and a quick-create trigger.`,
        },
        {
          question: `What is your launch budget and billing architecture strategy for ${ctx.projectName}?`,
          priority: "MUST_KNOW",
          whyItMatters:
            "Determines your database tier, payment gateway, and background task architecture so your coding agent generates the right stack without surprise costs.",
          suggestedOptions: [
            `(Recommended) $0/mo Free Bootstrap Method (Next.js 15 + Supabase Free + Lemon Squeezy / Stripe Pay-per-Sale + Resend Free)`,
            `Paid Scale Architecture ($150-$300+/mo: Supabase Pro + Stripe Billing + Upstash Redis Rate-Limiting + Inngest Background Queues)`,
            `100% Free / Unlocked MVP (No billing gates at launch, plan_tier column ready for monetization later)`,
          ],
          defaultRecommendation:
            "$0/mo Free Bootstrap Method (Next.js 15 + Supabase Free + Lemon Squeezy / Stripe Pay-per-Sale + Resend Free)",
          defaultAssumption:
            "Launch on the $0/mo Free Bootstrap Method with Supabase Free tier and pay-as-you-transact checkout.",
        },
      ];
  }
}

/**
 * Built-In Blueprint Agent: Synthesizes a complete, domain-grounded SoftwareBlueprint
 * directly from the user's idea, Product Type playbook, and confirmed Discovery Q&A answers.
 */
export function runBuiltInBlueprintAgent(
  projectId: string,
  projectName: string,
  productType: string,
  productDescription: string,
  researchDoc?: any,
  qnas: DiscoveryQnA[] = [],
  projectDetails?: {
    problemStatement?: string;
    targetAudience?: string;
    goal?: string;
    techStack?: string;
    codingEnvironment?: string;
  }
): SoftwareBlueprint {
  const ctx = analyzeProjectContext(
    projectName,
    productDescription,
    productType,
    qnas,
    projectDetails
  );
  const now = new Date().toISOString();

  const decisionsSummary = ctx.confirmedDecisions
    .map((d) => `${d.answer}`)
    .join(" · ");

  const screens = buildScreensForContext(ctx);
  const dataEntities = buildEntitiesForContext(ctx);

  return {
    project_id: projectId,
    overview: {
      name: ctx.projectName,
      summary: `${ctx.projectName} (${ctx.productType}): ${ctx.cleanDescription}`,
      problemStatement:
        projectDetails?.problemStatement ||
        `${ctx.primaryRole} needs a streamlined, reliable way to ${ctx.coreActionVerb}.`,
      valueProposition: `Empowers ${ctx.primaryRole} to ${ctx.coreActionVerb} with a fast, responsive ${ctx.productType} experience backed by Supabase.`,
      productType: ctx.productType,
      targetOutcome:
        ctx.targetGoal +
        (decisionsSummary ? ` | Confirmed Architecture: ${decisionsSummary}` : ""),
      source: "USER_CONFIRMED",
      status: "CONFIRMED",
    },
    usersRoles: [
      {
        id: "role_primary",
        roleName: ctx.primaryRole,
        simpleDescription: `Primary user of ${ctx.projectName} who interacts with the platform to ${ctx.coreActionVerb}.`,
        technicalPermissions: [
          `Create, read, and update authorized ${ctx.primaryEntityName} records`,
          `Access primary ${ctx.productType} screens and interactive workflows`,
        ],
        userGoals: [
          `Quickly ${ctx.coreActionVerb} on mobile or desktop`,
          `Receive immediate visual confirmation and accurate status updates`,
        ],
        restrictions: [
          "Cannot access or modify records belonging to other unauthorized users",
        ],
        relatedRoles: [ctx.secondaryRole],
        source: "USER_CONFIRMED",
        status: "CONFIRMED",
      },
      {
        id: "role_secondary",
        roleName: ctx.secondaryRole,
        simpleDescription: `Owner / administrator responsible for managing ${ctx.projectName} settings and overseeing ${ctx.primaryEntityName} activity.`,
        technicalPermissions: [
          `Full CRUD and status management across ${ctx.primaryEntityName} and ${ctx.secondaryEntityName}`,
          "Configure workspace/site settings",
        ],
        userGoals: [
          `Monitor ${ctx.projectName} activity, conversions, and system health`,
        ],
        restrictions: ["Requires verified authentication session"],
        relatedRoles: [ctx.primaryRole],
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
      },
    ],
    userJourneys: [
      {
        id: "journey_core",
        title: `End-to-End ${ctx.primaryEntityName} User Journey`,
        role: ctx.primaryRole,
        happyPathSteps: [
          {
            stepNumber: 1,
            title: "Entry & Value Discovery",
            userAction: `${ctx.primaryRole} lands on ${ctx.projectName} and views the primary interface.`,
            systemResponse:
              "Renders responsive layout with clear call-to-action and zero layout shift.",
            technicalImplication: "Next.js 15 Server Component initial render.",
          },
          {
            stepNumber: 2,
            title: `Execute Core ${ctx.primaryEntityName} Action`,
            userAction: `Completes the primary ${ctx.primaryEntityName} form or interactive workflow.`,
            systemResponse:
              "Validates payload with Zod, persists to Supabase, and updates UI state immediately.",
            technicalImplication:
              "Server Action / API Route with Supabase PostgreSQL insert/update.",
          },
          {
            stepNumber: 3,
            title: "Confirmation & Ongoing Management",
            userAction: `Reviews saved ${ctx.primaryEntityName} status and next steps.`,
            systemResponse:
              "Displays confirmation feedback and updated status view.",
            technicalImplication: "Revalidated route / optimistic state update.",
          },
        ],
        frictionPoints: [
          "Unclear form validation errors",
          "Slow uncached database queries without loading skeletons",
        ],
        failureScenarios: [
          {
            scenario: "Invalid or incomplete input submitted",
            resolution:
              "Highlight specific fields inline using Zod error messages without losing typed form data.",
          },
        ],
        source: "USER_CONFIRMED",
        status: "CONFIRMED",
      },
    ],
    features: [
      {
        id: "feat_1",
        title: `Core ${ctx.primaryEntityName} Workflow & Persistence`,
        simpleDescription: `Allows ${ctx.primaryRole} to ${ctx.coreActionVerb} with full Supabase persistence and validation.`,
        technicalDetails: `Next.js 15 App Router pages + Server Actions + Supabase table for ${ctx.primaryEntityName}.`,
        category: "CORE_MVP",
        priority: "CRITICAL",
        source: "USER_CONFIRMED",
        status: "CONFIRMED",
      },
      {
        id: "feat_2",
        title: `${ctx.secondaryEntityName} & Status Management`,
        simpleDescription: `Supports secondary workflows, filtering, and status updates for ${ctx.secondaryEntityName}.`,
        technicalDetails: `Relational foreign keys in PostgreSQL with indexed status queries.`,
        category: "CORE_MVP",
        priority: "HIGH",
        source: "USER_CONFIRMED",
        status: "CONFIRMED",
      },
      ...ctx.confirmedDecisions.slice(0, 2).map((d, i) => ({
        id: `feat_decision_${i + 1}`,
        title: `Confirmed Architecture: ${d.answer.replace(/^\(Recommended\)\s*/i, "").slice(0, 68)}`,
        simpleDescription: `Directly implements user decision for: "${d.question}"`,
        technicalDetails: `Configured according to user selection: ${d.answer}`,
        category: "CORE_MVP" as const,
        priority: "HIGH" as const,
        source: "USER_CONFIRMED" as const,
        status: "CONFIRMED" as const,
      })),
    ],
    screens,
    workflows: [
      {
        id: "wf_primary",
        name: `${ctx.primaryEntityName} Creation & Validation Workflow`,
        trigger: `${ctx.primaryRole} submits or updates ${ctx.primaryEntityName}`,
        simpleDescription: `Validates input, enforces security rules, saves to Supabase, and refreshes the UI.`,
        steps: [
          "Client form validates required fields and shows loading state",
          "Server handler validates schema with Zod and verifies permissions",
          `Record is persisted to ${toSlug(ctx.primaryEntityName)} table in Supabase`,
          "UI displays confirmation state and refreshes active list",
        ],
        technicalServices: ["Next.js Server Actions / API Routes", "Supabase PostgreSQL"],
        source: "USER_CONFIRMED",
        status: "CONFIRMED",
      },
    ],
    businessRules: [
      {
        id: "br_1",
        code: "BR_DATA_INTEGRITY",
        ruleStatement: `Every ${ctx.primaryEntityName} mutation must be validated server-side with Zod before touching Supabase.`,
        reason: "Prevents malformed data and protects database integrity.",
        enforcementLevel: "STRICT",
        technicalConstraint: "Zod schema parse in Route Handler / Server Action",
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
      },
      ...(ctx.productType === "SaaS"
        ? [
            {
              id: "br_saas_authz",
              code: "BR_SAAS_SERVER_AUTHZ",
              ruleStatement: "Never trust client-submitted roles, prices, payment status, or tenant identifiers. Resolve authorization server-side from session auth.uid().",
              reason: "Guarantees zero-trust authorization and prevents privilege escalation.",
              enforcementLevel: "STRICT" as const,
              technicalConstraint: "Session verification in Server Actions and Route Handlers",
              source: "SYSTEM_RECOMMENDED" as const,
              status: "CONFIRMED" as const,
            },
            {
              id: "br_saas_isolation",
              code: "BR_SAAS_TENANT_ISOLATION",
              ruleStatement: "Every database query and mutation must enforce tenant isolation via PostgreSQL Row-Level Security (RLS) with negative test suites asserting 403 on cross-tenant access.",
              reason: "Ensures tenant privacy and prevents cross-tenant data leakage.",
              enforcementLevel: "STRICT" as const,
              technicalConstraint: "PostgreSQL RLS: auth.uid() = user_id or organization_id membership subquery",
              source: "SYSTEM_RECOMMENDED" as const,
              status: "CONFIRMED" as const,
            },
            {
              id: "br_saas_dunning",
              code: "BR_SAAS_SUBSCRIPTION_DUNNING",
              ruleStatement: "On failed payment webhook events, transition subscription state to 'past_due' and enforce a 3-day grace period before restricting write operations.",
              reason: "Protects user retention while securing monetization integrity.",
              enforcementLevel: "STRICT" as const,
              technicalConstraint: "Idempotent webhook handler with signature verification",
              source: "SYSTEM_RECOMMENDED" as const,
              status: "CONFIRMED" as const,
            },
          ]
        : []),
      ...(ctx.productType === "E-commerce"
        ? [
            {
              id: "br_ecom_concurrency",
              code: "BR_ECOM_INVENTORY_CONCURRENCY",
              ruleStatement: "Atomic inventory decrements or row-level locking (SELECT ... FOR UPDATE) must be executed upon checkout to completely eliminate overselling under high concurrency.",
              reason: "Prevents race conditions where multiple customers buy the last remaining inventory item simultaneously.",
              enforcementLevel: "STRICT" as const,
              technicalConstraint: "UPDATE product_variants SET inventory_quantity = inventory_quantity - $1 WHERE id = $2 AND inventory_quantity >= $1",
              source: "SYSTEM_RECOMMENDED" as const,
              status: "CONFIRMED" as const,
            },
            {
              id: "br_ecom_server_totals",
              code: "BR_ECOM_ZERO_TRUST_PRICING",
              ruleStatement: "Server Action must recalculate all subtotals, coupon discounts, shipping fees, and taxes from the database. Client-submitted prices are completely ignored.",
              reason: "Eliminates client-side price tampering and guarantee financial accuracy.",
              enforcementLevel: "STRICT" as const,
              technicalConstraint: "Server-side price aggregation from product_variants table",
              source: "SYSTEM_RECOMMENDED" as const,
              status: "CONFIRMED" as const,
            },
            {
              id: "br_ecom_idempotent_webhooks",
              code: "BR_ECOM_IDEMPOTENT_WEBHOOKS",
              ruleStatement: "Payment webhooks must verify cryptographic signature headers and record event_id in processed_webhook_events table before mutating order state.",
              reason: "Prevents duplicate fulfillment or double-charging caused by repeated webhook retries.",
              enforcementLevel: "STRICT" as const,
              technicalConstraint: "HMAC signature verification and unique index on processed_webhook_events.event_id",
              source: "SYSTEM_RECOMMENDED" as const,
              status: "CONFIRMED" as const,
            },
            {
              id: "br_ecom_order_state_machine",
              code: "BR_ECOM_ORDER_STATE_MACHINE",
              ruleStatement: "Order status must transition strictly via state machine (pending_payment -> processing -> shipped -> delivered); canceled or refunded orders must automatically restore reserved inventory.",
              reason: "Maintains financial, inventory, and customer fulfillment synchronization.",
              enforcementLevel: "STRICT" as const,
              technicalConstraint: "Check constraint and trigger on orders.status",
              source: "SYSTEM_RECOMMENDED" as const,
              status: "CONFIRMED" as const,
            },
          ]
        : []),
      ...ctx.confirmedDecisions.map((d, idx) => ({
        id: `br_user_${idx + 1}`,
        code: `BR_DECISION_${idx + 1}`,
        ruleStatement: `${d.question} -> ${d.answer}`,
        reason: "Explicitly confirmed by the user during Idea & Architecture discovery.",
        enforcementLevel: "STRICT" as const,
        technicalConstraint: d.answer,
        source: "USER_CONFIRMED" as const,
        status: "CONFIRMED" as const,
      })),
    ],
    dataEntities,
    integrations: [
      {
        id: "int_supabase",
        serviceName: "Supabase (PostgreSQL, Auth & RLS)",
        category: "AUTH",
        purpose: `Primary database, authentication, and row-level security for ${ctx.projectName}.`,
        fallbackPlan: "Display actionable connection/error banner with retry.",
        source: "USER_CONFIRMED",
        status: "CONFIRMED",
      },
    ],
    adminTools: [],
    security: [
      {
        id: "sec_rls",
        title: "Supabase Row-Level Security (RLS) & Ownership Verification",
        simpleDescription: `Ensures ${ctx.primaryEntityName} and ${ctx.secondaryEntityName} tables enforce strict access control policies.`,
        category: "DATA_PROTECTION",
        technicalImplementation: "ALTER TABLE ... ENABLE ROW LEVEL SECURITY with explicit policies.",
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
      },
    ],
    quality: [
      {
        id: "qual_resp",
        category: "RESPONSIVENESS",
        requirement: "100% responsive across mobile (360px+), tablet (768px+), and desktop (1280px+).",
        targetMetric: "Zero horizontal overflow at 360px width",
        technicalApproach: "Mobile-first Tailwind CSS grid/flex layouts with SVG Lucide icons.",
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
      },
    ],
    futureConsiderations: [],
    healthScore: 96,
    healthWarnings: [],
    updated_at: now,
  };
}

function buildScreensForContext(
  ctx: ExtractedDomainIntelligence
): SoftwareBlueprint["screens"] {
  if (ctx.productType === "Landing Page") {
    return [
      {
        id: "scr_landing_home",
        screenName: `${ctx.projectName} Conversion Landing Page`,
        routePath: "/",
        simplePurpose: `High-converting landing page with hero value proposition, interactive showcase, social proof, FAQ, and lead capture form.`,
        accessRoles: [ctx.primaryRole],
        keyComponents: [
          "Responsive Navbar & Sticky CTA",
          "Above-the-Fold Hero & Value Proposition",
          "Interactive Feature / Benefit Showcase",
          `Validated ${ctx.primaryEntityName} Lead Capture Form`,
          "Social Proof Metrics & FAQ Accordion",
        ],
        emptyState: "Default interactive showcase state pre-populated with real domain copy.",
        loadingState: "Button spinner and disabled inputs during lead form submission.",
        errorState: "Inline field validation error banner with retry.",
        source: "USER_CONFIRMED",
        status: "CONFIRMED",
      },
      {
        id: "scr_landing_thankyou",
        screenName: "Conversion Confirmation & Next Steps View",
        routePath: "/confirmed",
        simplePurpose: "Confirms form submission and provides immediate next steps or shareable link.",
        accessRoles: [ctx.primaryRole],
        keyComponents: [
          "Confirmation Status Card",
          "Next Steps Checklist",
          "Return / Share Action Buttons",
        ],
        emptyState: "Redirects to / if accessed without submission state.",
        loadingState: "Instant transition skeleton.",
        errorState: "Fallback link back to home form.",
        source: "USER_CONFIRMED",
        status: "CONFIRMED",
      },
    ];
  }

  if (ctx.productType === "Business Website") {
    return [
      {
        id: "scr_biz_home",
        screenName: `${ctx.projectName} Brand & Services Home`,
        routePath: "/",
        simplePurpose: `Showcases ${ctx.projectName}'s value proposition, core service packages, case studies, and client trust signals.`,
        accessRoles: [ctx.primaryRole],
        keyComponents: [
          "Brand Header & Service Navigation",
          "Authority Hero Banner & Quick Consultation CTA",
          `${ctx.secondaryEntityName} Cards & Deliverables Grid`,
          "Case Studies & Client Testimonials",
        ],
        emptyState: "Displays core service offerings and consultation callout.",
        loadingState: "Skeleton cards while loading dynamic services.",
        errorState: "Graceful fallback banner with direct contact details.",
        source: "USER_CONFIRMED",
        status: "CONFIRMED",
      },
      {
        id: "scr_biz_contact",
        screenName: "Interactive Quote & Consultation Booking Page",
        routePath: "/contact",
        simplePurpose: `Enables prospective clients to submit a ${ctx.primaryEntityName} with service selection and preferred schedule.`,
        accessRoles: [ctx.primaryRole],
        keyComponents: [
          "Service Package Selector",
          `Validated ${ctx.primaryEntityName} Form`,
          "Instant Booking Confirmation State",
          "FAQ & Direct Contact Sidebar",
        ],
        emptyState: "Ready-to-fill inquiry form with clear field labels.",
        loadingState: "Submitting state with progress indicator.",
        errorState: "Inline Zod validation feedback on invalid fields.",
        source: "USER_CONFIRMED",
        status: "CONFIRMED",
      },
      {
        id: "scr_biz_admin",
        screenName: "Admin Client Inquiry & Service Manager",
        routePath: "/admin/inquiries",
        simplePurpose: `Protected dashboard for ${ctx.secondaryRole} to review and update incoming client inquiries.`,
        accessRoles: [ctx.secondaryRole],
        keyComponents: [
          "Inquiry Status Filter Bar",
          `${ctx.primaryEntityName} Management Table`,
          "Status Update & Notes Drawer",
        ],
        emptyState: "No client inquiries received yet.",
        loadingState: "Table row skeletons.",
        errorState: "Retry fetch button.",
        source: "USER_CONFIRMED",
        status: "CONFIRMED",
      },
    ];
  }

  if (ctx.productType === "E-commerce") {
    return [
      {
        id: "scr_ecom_storefront",
        screenName: `${ctx.projectName} Storefront & Catalog`,
        routePath: "/shop",
        simplePurpose: `Allows ${ctx.primaryRole} to browse, search, and filter ${ctx.primaryEntityName} items and manage their cart.`,
        accessRoles: [ctx.primaryRole],
        keyComponents: [
          "Store Header, Search Bar & Cart Trigger Badge",
          "Category & Price Filter Bar",
          `Responsive ${ctx.primaryEntityName} Grid & Variant Quick-Add`,
          "Persistent Slide-Over Cart Drawer",
        ],
        emptyState: "No matching products found — clear active filters button.",
        loadingState: "Product card grid skeletons.",
        errorState: "Catalog reload banner.",
        source: "USER_CONFIRMED",
        status: "CONFIRMED",
      },
      {
        id: "scr_ecom_checkout",
        screenName: "Checkout & Order Confirmation",
        routePath: "/checkout",
        simplePurpose: `Collects shipping/contact details, verifies cart totals server-side, and creates a ${ctx.secondaryEntityName}.`,
        accessRoles: [ctx.primaryRole],
        keyComponents: [
          "Customer & Delivery Information Form",
          "Order Summary & Server-Verified Totals Card",
          "Payment Action & Order Confirmation Receipt",
        ],
        emptyState: "Empty cart prompt linking back to /shop.",
        loadingState: "Processing order lock state.",
        errorState: "Payment/validation error alert with retry.",
        source: "USER_CONFIRMED",
        status: "CONFIRMED",
      },
      {
        id: "scr_ecom_admin",
        screenName: "Merchant Product & Order Admin",
        routePath: "/admin/orders",
        simplePurpose: `Enables ${ctx.secondaryRole} to manage ${ctx.primaryEntityName} inventory and fulfill ${ctx.secondaryEntityName} records.`,
        accessRoles: [ctx.secondaryRole],
        keyComponents: [
          "Revenue & Order KPI Cards",
          `${ctx.primaryEntityName} Inventory Manager`,
          `${ctx.secondaryEntityName} Fulfillment Table`,
        ],
        emptyState: "No orders placed yet.",
        loadingState: "Dashboard skeleton.",
        errorState: "Admin error boundary.",
        source: "USER_CONFIRMED",
        status: "CONFIRMED",
      },
    ];
  }

  // Default: SaaS, Web App, Marketplace, AI Product, Internal Tool, Mobile App, API, Other
  return [
    {
      id: "scr_auth_entry",
      screenName: `${ctx.projectName} Entry & Authentication`,
      routePath: "/login",
      simplePurpose: `Secure sign-in, sign-up, and onboarding entry for ${ctx.primaryRole}.`,
      accessRoles: [ctx.primaryRole, ctx.secondaryRole],
      keyComponents: [
        "Brand Value Header",
        "Email & Password Auth Form with Zod Validation",
        "Session Redirect Handler",
      ],
      emptyState: "Clean sign-in / create account form.",
      loadingState: "Authenticating button state.",
      errorState: "Clear credential error message.",
      source: "USER_CONFIRMED",
      status: "CONFIRMED",
    },
    {
      id: "scr_main_dashboard",
      screenName: `${ctx.projectName} Main Workspace Dashboard`,
      routePath: "/dashboard",
      simplePurpose: `Central hub where ${ctx.primaryRole} monitors KPIs and manages ${ctx.primaryEntityName} records.`,
      accessRoles: [ctx.primaryRole, ctx.secondaryRole],
      keyComponents: [
        "Responsive Sidebar & Workspace Header",
        `${ctx.primaryEntityName} KPI Telemetry Cards`,
        `Filterable ${ctx.primaryEntityName} List / Studio View`,
        `Quick-Create ${ctx.primaryEntityName} Trigger`,
      ],
      emptyState: `Guided empty state with "Create Your First ${ctx.primaryEntityName}" CTA.`,
      loadingState: "KPI and table skeleton loaders.",
      errorState: "Actionable error banner with retry.",
      source: "USER_CONFIRMED",
      status: "CONFIRMED",
    },
    {
      id: "scr_core_workflow",
      screenName: `${ctx.primaryEntityName} Creation & Detail Studio`,
      routePath: `/dashboard/${ctx.primaryEntityPlural}`,
      simplePurpose: `Focused workflow screen to create, inspect, and update ${ctx.primaryEntityName} and ${ctx.secondaryEntityName}.`,
      accessRoles: [ctx.primaryRole, ctx.secondaryRole],
      keyComponents: [
        `Interactive ${ctx.primaryEntityName} Form & Validation`,
        `Live ${ctx.secondaryEntityName} Status Inspector`,
        "Save, Export & Status Transition Actions",
      ],
      emptyState: `Start a new ${ctx.primaryEntityName} workflow.`,
      loadingState: "Saving & syncing indicator.",
      errorState: "Inline validation feedback.",
      source: "USER_CONFIRMED",
      status: "CONFIRMED",
    },
    ...(ctx.productType === "SaaS"
      ? [
          {
            id: "scr_saas_settings",
            screenName: "Workspace Settings & Subscription Tier",
            routePath: "/dashboard/settings",
            simplePurpose: `Manage ${ctx.projectName} account preferences, team members, and billing subscription plan tier.`,
            accessRoles: [ctx.primaryRole, ctx.secondaryRole],
            keyComponents: [
              "Account & Workspace Profile Form",
              "Subscription Plan Tier Card & Upgrade CTA",
              "Team Member Invite Table (if collaborative)",
              "API Keys & Webhook Settings",
            ],
            emptyState: "Account profile and active plan details.",
            loadingState: "Settings loading skeleton.",
            errorState: "Unable to load billing settings alert.",
            source: "USER_CONFIRMED" as const,
            status: "CONFIRMED" as const,
          },
        ]
      : []),
  ];
}

function buildEntitiesForContext(
  ctx: ExtractedDomainIntelligence
): SoftwareBlueprint["dataEntities"] {
  const isSaaS = ctx.productType === "SaaS";
  const isTeamWorkspace = isSaaS && ctx.confirmedDecisions.some(
    (d) =>
      d.answer.toLowerCase().includes("team") ||
      d.answer.toLowerCase().includes("organization") ||
      d.answer.toLowerCase().includes("workspace")
  );

  const entities: SoftwareBlueprint["dataEntities"] = [];

  // For SaaS products, model real user profiles and workspace tenancy
  if (isSaaS) {
    entities.push({
      id: "ent_user_profile",
      entityName: "UserProfile",
      simpleDescription: `Authenticated user account profile with plan tier and account preferences.`,
      ownershipRole: ctx.primaryRole,
      attributes: [
        { name: "id", type: "uuid", required: true, description: "Primary key referencing auth.users.id" },
        { name: "email", type: "text", required: true, description: "User email address" },
        { name: "full_name", type: "text", required: false, description: "Display name" },
        { name: "plan_tier", type: "text", required: true, description: "Tier level: 'free' | 'pro' | 'enterprise'" },
        { name: "created_at", type: "timestamptz", required: true, description: "Registration timestamp" },
      ],
      lifecycleStates: ["ACTIVE", "SUSPENDED"],
      source: "USER_CONFIRMED",
      status: "CONFIRMED",
    });

    if (isTeamWorkspace) {
      entities.push({
        id: "ent_organization",
        entityName: "Organization",
        simpleDescription: `Multi-tenant team workspace where members collaborate with assigned roles.`,
        ownershipRole: ctx.secondaryRole,
        attributes: [
          { name: "id", type: "uuid", required: true, description: "Primary key" },
          { name: "name", type: "text", required: true, description: "Workspace name" },
          { name: "slug", type: "text", required: true, description: "Unique workspace slug for URL routing" },
          { name: "owner_id", type: "uuid", required: true, description: "References UserProfile.id" },
          { name: "created_at", type: "timestamptz", required: true, description: "Creation timestamp" },
        ],
        lifecycleStates: ["ACTIVE", "ARCHIVED"],
        source: "USER_CONFIRMED",
        status: "CONFIRMED",
      });

      entities.push({
        id: "ent_org_member",
        entityName: "OrganizationMember",
        simpleDescription: `Role-based access mapping connecting users to team organizations.`,
        ownershipRole: ctx.secondaryRole,
        attributes: [
          { name: "id", type: "uuid", required: true, description: "Primary key" },
          { name: "organization_id", type: "uuid", required: true, description: "References Organization.id" },
          { name: "user_id", type: "uuid", required: true, description: "References UserProfile.id" },
          { name: "role", type: "text", required: true, description: "Access level: 'owner' | 'admin' | 'member' | 'billing_admin'" },
          { name: "created_at", type: "timestamptz", required: true, description: "Join timestamp" },
        ],
        lifecycleStates: ["INVITED", "ACTIVE"],
        source: "USER_CONFIRMED",
        status: "CONFIRMED",
      });
    }

    entities.push({
      id: "ent_subscription",
      entityName: "Subscription",
      simpleDescription: `Recurring billing state, plan entitlements, and payment status.`,
      ownershipRole: ctx.primaryRole,
      attributes: [
        { name: "id", type: "uuid", required: true, description: "Primary key" },
        { name: isTeamWorkspace ? "organization_id" : "user_id", type: "uuid", required: true, description: "Tenant reference" },
        { name: "stripe_customer_id", type: "text", required: false, description: "Stripe or Lemon Squeezy customer ID" },
        { name: "stripe_subscription_id", type: "text", required: false, description: "Provider subscription ID" },
        { name: "plan_id", type: "text", required: true, description: "Active tier identifier ('free', 'pro', 'enterprise')" },
        { name: "status", type: "text", required: true, description: "Lifecycle state ('trialing', 'active', 'past_due', 'canceled', 'unpaid')" },
        { name: "current_period_end", type: "timestamptz", required: true, description: "End date of current billing period" },
        { name: "cancel_at_period_end", type: "boolean", required: true, description: "Whether cancellation is scheduled" },
        { name: "created_at", type: "timestamptz", required: true, description: "Creation timestamp" },
      ],
      lifecycleStates: ["TRIALING", "ACTIVE", "PAST_DUE", "CANCELED"],
      source: "USER_CONFIRMED",
      status: "CONFIRMED",
    });

    entities.push({
      id: "ent_audit_log",
      entityName: "AuditLog",
      simpleDescription: `Immutable audit trail for security events, member changes, and deletions.`,
      ownershipRole: ctx.secondaryRole,
      attributes: [
        { name: "id", type: "uuid", required: true, description: "Primary key" },
        { name: "actor_id", type: "uuid", required: true, description: "User ID performing the action" },
        { name: "action", type: "text", required: true, description: "Action type (e.g. member_invited, role_updated, record_deleted)" },
        { name: "target_entity", type: "text", required: true, description: "Affected entity or resource ID" },
        { name: "ip_address", type: "text", required: false, description: "Client IP for security traceability" },
        { name: "created_at", type: "timestamptz", required: true, description: "Timestamp" },
      ],
      lifecycleStates: ["RECORDED"],
      source: "SYSTEM_RECOMMENDED",
      status: "CONFIRMED",
    });
  }

  // For E-commerce products, model real product catalog, variants, inventory, and order state
  if (ctx.productType === "E-commerce") {
    entities.push(
      {
        id: "ent_product",
        entityName: "Product",
        simpleDescription: "Core product catalog item with descriptions, categories, and published state.",
        ownershipRole: ctx.secondaryRole,
        attributes: [
          { name: "id", type: "uuid", required: true, description: "Primary key" },
          { name: "name", type: "text", required: true, description: "Product display title" },
          { name: "slug", type: "text", required: true, description: "URL slug for SEO routing (/products/[slug])" },
          { name: "description", type: "text", required: false, description: "Rich product description" },
          { name: "category_id", type: "uuid", required: false, description: "References category taxonomy" },
          { name: "base_price_cents", type: "integer", required: true, description: "Base price in integer cents" },
          { name: "is_published", type: "boolean", required: true, description: "Storefront visibility toggle" },
          { name: "created_at", type: "timestamptz", required: true, description: "Creation timestamp" },
        ],
        lifecycleStates: ["DRAFT", "PUBLISHED", "ARCHIVED"],
        source: "USER_CONFIRMED",
        status: "CONFIRMED",
      },
      {
        id: "ent_product_variant",
        entityName: "ProductVariant",
        simpleDescription: "Specific SKU variation with unique pricing, options (size/color), and inventory tracking.",
        ownershipRole: ctx.secondaryRole,
        attributes: [
          { name: "id", type: "uuid", required: true, description: "Primary key" },
          { name: "product_id", type: "uuid", required: true, description: "References Product.id" },
          { name: "sku", type: "text", required: true, description: "Unique stock-keeping unit" },
          { name: "title", type: "text", required: true, description: "Variant title (e.g. 'Large / Midnight Black')" },
          { name: "price_cents", type: "integer", required: true, description: "Variant price in integer cents" },
          { name: "compare_at_price_cents", type: "integer", required: false, description: "Original strike-through price" },
          { name: "inventory_quantity", type: "integer", required: true, description: "Available stock (CHECK >= 0)" },
          { name: "low_stock_threshold", type: "integer", required: true, description: "Urgency warning trigger" },
          { name: "attributes", type: "jsonb", required: true, description: "Key-value options (size, color, material)" },
        ],
        lifecycleStates: ["ACTIVE", "DISCONTINUED"],
        source: "USER_CONFIRMED",
        status: "CONFIRMED",
      },
      {
        id: "ent_customer_order",
        entityName: "CustomerOrder",
        simpleDescription: "Customer purchase order with server-reconciled totals and fulfillment status.",
        ownershipRole: ctx.primaryRole,
        attributes: [
          { name: "id", type: "uuid", required: true, description: "Primary key" },
          { name: "order_number", type: "text", required: true, description: "Human-readable order identifier (e.g. ORD-1001)" },
          { name: "customer_email", type: "text", required: true, description: "Customer contact email for receipts" },
          { name: "user_id", type: "uuid", required: false, description: "Optional authenticated customer account ID" },
          { name: "status", type: "text", required: true, description: "pending_payment | processing | shipped | delivered | canceled | refunded" },
          { name: "subtotal_cents", type: "integer", required: true, description: "Server-recalculated item subtotal" },
          { name: "tax_cents", type: "integer", required: true, description: "Calculated tax" },
          { name: "shipping_cents", type: "integer", required: true, description: "Shipping fee" },
          { name: "total_cents", type: "integer", required: true, description: "Grand total charged" },
          { name: "currency", type: "text", required: true, description: "ISO 4217 currency code (e.g. 'USD')" },
          { name: "shipping_address", type: "jsonb", required: true, description: "Validated delivery destination" },
          { name: "tracking_number", type: "text", required: false, description: "Carrier dispatch tracking code" },
          { name: "created_at", type: "timestamptz", required: true, description: "Creation timestamp" },
        ],
        lifecycleStates: ["PENDING_PAYMENT", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED", "REFUNDED"],
        source: "USER_CONFIRMED",
        status: "CONFIRMED",
      },
      {
        id: "ent_order_item",
        entityName: "OrderItem",
        simpleDescription: "Snapshot of a purchased variant at the exact time of order completion.",
        ownershipRole: ctx.primaryRole,
        attributes: [
          { name: "id", type: "uuid", required: true, description: "Primary key" },
          { name: "order_id", type: "uuid", required: true, description: "References CustomerOrder.id" },
          { name: "variant_id", type: "uuid", required: true, description: "References ProductVariant.id" },
          { name: "title", type: "text", required: true, description: "Historical snapshot of variant title" },
          { name: "unit_price_cents", type: "integer", required: true, description: "Historical price per unit" },
          { name: "quantity", type: "integer", required: true, description: "Units purchased" },
          { name: "total_cents", type: "integer", required: true, description: "Line item total" },
        ],
        lifecycleStates: ["CONFIRMED"],
        source: "USER_CONFIRMED",
        status: "CONFIRMED",
      },
      {
        id: "ent_inventory_reservation",
        entityName: "InventoryReservation",
        simpleDescription: "Temporary stock hold during active checkout session to prevent overselling.",
        ownershipRole: ctx.secondaryRole,
        attributes: [
          { name: "id", type: "uuid", required: true, description: "Primary key" },
          { name: "variant_id", type: "uuid", required: true, description: "References ProductVariant.id" },
          { name: "order_id", type: "uuid", required: false, description: "References associated checkout order" },
          { name: "quantity", type: "integer", required: true, description: "Reserved units" },
          { name: "reserved_at", type: "timestamptz", required: true, description: "Hold start timestamp" },
          { name: "expires_at", type: "timestamptz", required: true, description: "TTL expiration timestamp" },
          { name: "status", type: "text", required: true, description: "HOLD | CONFIRMED | RELEASED" },
        ],
        lifecycleStates: ["HOLD", "CONFIRMED", "RELEASED"],
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
      },
      {
        id: "ent_webhook_event",
        entityName: "ProcessedWebhookEvent",
        simpleDescription: "Idempotency log tracking processed payment events to prevent duplicate executions.",
        ownershipRole: ctx.secondaryRole,
        attributes: [
          { name: "id", type: "uuid", required: true, description: "Primary key" },
          { name: "event_id", type: "text", required: true, description: "Provider event ID (unique index)" },
          { name: "provider", type: "text", required: true, description: "stripe | lemon_squeezy | paystack" },
          { name: "event_type", type: "text", required: true, description: "Event type identifier" },
          { name: "processed_at", type: "timestamptz", required: true, description: "Execution timestamp" },
        ],
        lifecycleStates: ["RECORDED"],
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
      }
    );

    return entities;
  }

  // Primary domain entity
  const primaryAttributes: Array<{ name: string; type: string; required: boolean; description: string }> = [
    { name: "id", type: "uuid", required: true, description: "Primary key" },
    {
      name: "title",
      type: "text",
      required: true,
      description: `Primary name or identifier for the ${ctx.primaryEntityName}`,
    },
    {
      name: "status",
      type: "text",
      required: true,
      description: "Lifecycle status (e.g. active, pending, completed)",
    },
    {
      name: "details",
      type: "jsonb",
      required: false,
      description: `Structured domain attributes for ${ctx.projectName}`,
    },
  ];

  if (isTeamWorkspace) {
    primaryAttributes.push({
      name: "organization_id",
      type: "uuid",
      required: true,
      description: "References Organization.id for collaborative team Row-Level Security (RLS)",
    });
  }

  primaryAttributes.push(
    {
      name: "user_id",
      type: "uuid",
      required: isSaaS,
      description: "Owner/creator reference for Supabase RLS isolation",
    },
    {
      name: "created_at",
      type: "timestamptz",
      required: true,
      description: "Creation timestamp",
    }
  );

  entities.push({
    id: "ent_primary",
    entityName: ctx.primaryEntityName,
    simpleDescription: `Core domain table for ${ctx.projectName} storing ${ctx.primaryEntityName} records.`,
    ownershipRole: ctx.primaryRole,
    attributes: primaryAttributes,
    lifecycleStates: ["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"],
    source: "USER_CONFIRMED",
    status: "CONFIRMED",
  });

  // Secondary domain entity
  entities.push({
    id: "ent_secondary",
    entityName: ctx.secondaryEntityName,
    simpleDescription: `Supporting domain record linked to ${ctx.primaryEntityName}.`,
    ownershipRole: ctx.primaryRole,
    attributes: [
      { name: "id", type: "uuid", required: true, description: "Primary key" },
      {
        name: `${toSlug(ctx.primaryEntityName).replace(/-/g, "_")}_id`,
        type: "uuid",
        required: true,
        description: `Foreign key referencing ${ctx.primaryEntityName}`,
      },
      {
        name: "summary",
        type: "text",
        required: true,
        description: "Summary or action payload",
      },
      {
        name: "created_at",
        type: "timestamptz",
        required: true,
        description: "Creation timestamp",
      },
    ],
    lifecycleStates: ["PENDING", "PROCESSED"],
    source: "USER_CONFIRMED",
    status: "CONFIRMED",
  });

  return entities;
}

/**
 * Built-In Build Map Agent: Generates a 5-stage From-Scratch-to-Production BuildMap
 * tailored to the user's Product Type and SoftwareBlueprint.
 */
export function runBuiltInBuildMapAgent(
  projectId: string,
  blueprint: SoftwareBlueprint
): BuildMap {
  const pType = blueprint.overview?.productType || "SaaS";
  const primaryEntity =
    blueprint.dataEntities?.[0]?.entityName || "CoreDomainRecord";
  const secondaryEntity =
    blueprint.dataEntities?.[1]?.entityName || "SupportingRecord";
  const allScreens = blueprint.screens?.map((s) => s.routePath) || ["/"];
  const primaryScreen = allScreens[0] || "/";
  const secondaryScreen = allScreens[1] || allScreens[0] || "/";

  const stages: BuildStage[] = [
    {
      id: "stage_1_foundation",
      stageNumber: 1,
      title: "Step 1: Project Foundation, TypeScript Types & Supabase Schema",
      userCentricName: `Foundation & ${primaryEntity} Database Schema`,
      whyThisExists: `Establishes the exact PostgreSQL tables, Row-Level Security (RLS) policies, and shared TypeScript interfaces for ${blueprint.overview.name} so every subsequent prompt compiles cleanly with zero guesswork.`,
      deliverables: [
        `Supabase SQL migration for ${primaryEntity} and ${secondaryEntity} with RLS policies`,
        `Shared TypeScript interfaces and Zod validation schemas in types/ and lib/`,
        `Supabase client & server utilities`,
      ],
      associatedScreens: [],
      associatedEntities: [primaryEntity, secondaryEntity],
      dependencies: [],
      status: "READY",
      agentGuidance:
        "Create the database schema, RLS rules, and strict TypeScript types first before building UI pages.",
      estimatedComplexity: "MEDIUM",
    },
    {
      id: "stage_2_shell_entry",
      stageNumber: 2,
      title:
        pType === "Landing Page" || pType === "Business Website"
          ? "Step 2: Responsive Layout Shell, Brand Navigation & Hero Section"
          : "Step 2: Responsive App Shell, Navigation & Authentication Flow",
      userCentricName:
        pType === "Landing Page" || pType === "Business Website"
          ? "Responsive Layout, Navigation & Hero Showcase"
          : "App Shell, Navigation & User Authentication",
      whyThisExists:
        pType === "Landing Page" || pType === "Business Website"
          ? `Builds the mobile-first (360px+) navigation header, above-the-fold hero value proposition, and core layout shell for ${blueprint.overview.name}.`
          : `Sets up protected route middleware, sign-in/sign-up screens, and the responsive workspace navigation shell for ${blueprint.overview.name}.`,
      deliverables: [
        `Responsive navigation header/sidebar (360px+ mobile, tablet, desktop) with Lucide SVG icons`,
        pType === "Landing Page" || pType === "Business Website"
          ? `High-converting Hero section and primary CTA on ${primaryScreen}`
          : `Authentication pages (/login, /signup) and session middleware`,
      ],
      associatedScreens: [primaryScreen],
      associatedEntities: [primaryEntity],
      dependencies: ["stage_1_foundation"],
      status: "NOT_STARTED",
      agentGuidance:
        "Ensure 100% responsive layout across mobile, tablet, and desktop using Lucide SVG icons only.",
      estimatedComplexity: "MEDIUM",
    },
    {
      id: "stage_3_core_workflow",
      stageNumber: 3,
      title: `Step 3: Core ${primaryEntity} Interactive Workflow & Server Actions`,
      userCentricName: `Core ${primaryEntity} Interactive Experience`,
      whyThisExists: `Implements the primary value-creation workflow of ${blueprint.overview.name}, connecting the frontend UI to validated Supabase Server Actions / API routes.`,
      deliverables: [
        `End-to-end ${primaryEntity} creation, validation, and display workflow`,
        `Server-side Zod validation and Supabase persistence`,
        `Complete loading skeletons, empty states, and inline error feedback`,
      ],
      associatedScreens: [primaryScreen, secondaryScreen],
      associatedEntities: [primaryEntity, secondaryEntity],
      dependencies: ["stage_2_shell_entry"],
      status: "NOT_STARTED",
      agentGuidance:
        "Wire real Supabase persistence and enforce all confirmed business rules from the blueprint.",
      estimatedComplexity: "HIGH",
    },
    {
      id: "stage_4_secondary_flow",
      stageNumber: 4,
      title: `Step 4: ${secondaryEntity} Management, Filtering & Secondary Flows`,
      userCentricName: `${secondaryEntity} & Conversion / Management Flow`,
      whyThisExists: `Completes the secondary user journey (${secondaryScreen}), enabling status updates, filtering, confirmation views, or admin management.`,
      deliverables: [
        `Interactive ${secondaryEntity} view and status transition controls`,
        `Search, status filtering, and summary metrics`,
      ],
      associatedScreens: allScreens,
      associatedEntities: [primaryEntity, secondaryEntity],
      dependencies: ["stage_3_core_workflow"],
      status: "NOT_STARTED",
      agentGuidance:
        "Keep frontend components cleanly separated from backend data mutations.",
      estimatedComplexity: "MEDIUM",
    },
    {
      id: "stage_5_polish_launch",
      stageNumber: 5,
      title: "Step 5: Responsive UX Polish, Edge-Case Hardening, SEO & Launch Verification",
      userCentricName: "Final Polish, SEO Metadata & Production Verification",
      whyThisExists: `Hardens edge cases, adds semantic SEO / OpenGraph metadata, verifies mobile responsiveness (360px+), and confirms zero TypeScript or build errors for final launch.`,
      deliverables: [
        "SEO metadata, OpenGraph tags, and accessible ARIA attributes",
        "Edge-case error boundaries and empty-state refinements",
        "Zero-error TypeScript and production build verification",
      ],
      associatedScreens: allScreens,
      associatedEntities: [primaryEntity, secondaryEntity],
      dependencies: ["stage_4_secondary_flow"],
      status: "NOT_STARTED",
      agentGuidance:
        "Run npm run typecheck and npm run build to verify the finished product is 100% production-ready.",
      estimatedComplexity: "LOW",
    },
  ];

  return {
    project_id: projectId,
    stages,
    currentStageNumber: 1,
    totalStages: stages.length,
    completedStages: 0,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Built-In Task Agent: Generates 5 ordered, From-Scratch-to-Production coding tasks
 * grounded strictly in the user's answers, SoftwareBlueprint, and BuildMap.
 */
export function runBuiltInTaskAgent(
  projectId: string,
  projectName: string,
  productType: string,
  buildMap: BuildMap,
  softwareBlueprint: SoftwareBlueprint,
  qnas: DiscoveryQnA[] = []
): { tasks: AigenstraTask[]; recommendation: TaskRecommendation } {
  const ctx = analyzeProjectContext(
    projectName,
    softwareBlueprint.overview?.summary || "",
    productType,
    qnas
  );
  const now = new Date().toISOString();

  const primaryScreen = softwareBlueprint.screens?.[0]?.routePath || "/";
  const secondaryScreen =
    softwareBlueprint.screens?.[1]?.routePath || primaryScreen;
  const allScreenRoutes = softwareBlueprint.screens?.map((s) => s.routePath) || [
    "/",
  ];
  const decisionList = ctx.confirmedDecisions.map(
    (d) => `${d.question}: ${d.answer}`
  );

  // Dedicated 5-stage task generation for E-commerce storefronts
  if (ctx.productType === "E-commerce") {
    const ecomTasks: AigenstraTask[] = [
      {
        id: "task_step_1_ecom_schema",
        project_id: projectId,
        title: `Step 1 of 5: Set Up ${ctx.projectName} Storefront Schema, Product Variants & Inventory Concurrency`,
        short_description: `Create Supabase PostgreSQL tables for Products, ProductVariants (with SKU, price_cents, inventory_quantity), Orders, OrderItems, and InventoryReservations with atomic stock decrement constraints.`,
        purpose: `Establishes the normalized relational schema, variant attribute JSONB indexing, check constraints (inventory_quantity >= 0), and Row-Level Security policies.`,
        user_value: `Protects customer order records and prevents overselling items under concurrent traffic.`,
        task_type: "DATABASE",
        category: "Step 1 · Storefront Schema & Inventory Concurrency",
        priority: "CRITICAL",
        status: "READY",
        readiness: "READY",
        complexity: "MEDIUM",
        source: "BUILD_MAP",
        stageNumber: 1,
        dependencies: [],
        blocked_by: [],
        related_blueprint_items: ["Product", "ProductVariant", "CustomerOrder", "OrderItem"],
        related_engineering_items: ["DATABASE", "SECURITY"],
        related_decisions: decisionList.slice(0, 2),
        related_assumptions: [],
        affected_screens: [],
        affected_entities: ["Product", "ProductVariant", "CustomerOrder", "OrderItem"],
        affected_apis: ["lib/supabase/", "types/"],
        acceptance_criteria: [
          "Supabase migration defines products, product_variants, customer_orders, order_items, and processed_webhook_events tables with RLS",
          "CHECK constraint ensures product_variants.inventory_quantity >= 0 and UNIQUE index exists on processed_webhook_events(event_id)",
          "TypeScript interfaces and Zod validation schemas match product attributes and order payloads with 0 compiler errors on npm run typecheck",
        ],
        change_boundaries: {
          mustChange: ["supabase/migrations/", "types/index.ts", "lib/validations/"],
          mayChange: ["lib/supabase/"],
          mustNotChange: ["public/"],
        },
        created_at: now,
        updated_at: now,
      },
      {
        id: "task_step_2_ecom_shell",
        project_id: projectId,
        title: `Step 2 of 5: Build ${ctx.projectName} Storefront Navigation, Collections & Slide-Over Cart Drawer`,
        short_description: `Implement the responsive storefront header with live cart count, category filter drawer, and persistent slide-over shopping cart.`,
        purpose: `Provides the visual shell and persistent shopping cart allowing shoppers to browse and hold items across sessions.`,
        user_value: `Allows shoppers to view collections and access their cart from any screen on mobile (360px+) and desktop.`,
        task_type: "FRONTEND",
        category: "Step 2 · Storefront Shell & Cart Drawer",
        priority: "CRITICAL",
        status: "READY",
        readiness: "READY",
        complexity: "MEDIUM",
        source: "BUILD_MAP",
        stageNumber: 2,
        dependencies: ["task_step_1_ecom_schema"],
        blocked_by: [],
        related_blueprint_items: ["Storefront & Catalog", "Slide-Over Cart Drawer"],
        related_engineering_items: ["FRONTEND", "UI_ARCHITECTURE"],
        related_decisions: decisionList,
        related_assumptions: [],
        affected_screens: ["/shop", "/"],
        affected_entities: ["Product"],
        affected_apis: ["/api/cart"],
        acceptance_criteria: [
          "Storefront header renders responsive navigation, search input, and cart badge showing live item count",
          "Slide-over cart drawer smoothly opens/closes and persists line items across page reloads via localStorage/Supabase",
          "All icons use Lucide SVG components (zero emojis) and layout is fully responsive down to 360px mobile viewports",
        ],
        change_boundaries: {
          mustChange: ["app/", "components/storefront/", "components/cart/"],
          mayChange: ["lib/cart/"],
          mustNotChange: ["supabase/migrations/"],
        },
        created_at: now,
        updated_at: now,
      },
      {
        id: "task_step_3_ecom_product_pdp",
        project_id: projectId,
        title: `Step 3 of 5: Build Product Detail View (/products/[slug]), Variant Selector & Add-to-Cart`,
        short_description: `Build the product detail screen with high-resolution image gallery, multi-attribute selector (size/color/SKU), stock urgency badge, and instant Add-to-Cart.`,
        purpose: `Delivers the core merchandising experience where shoppers inspect product attributes, verify stock availability, and select variants.`,
        user_value: `Gives shoppers clear visual feedback on prices, variant choices, and immediate cart drawer updates.`,
        task_type: "FEATURE",
        category: "Step 3 · Product Detail & Variant Selection",
        priority: "CRITICAL",
        status: "READY",
        readiness: "READY",
        complexity: "LARGE",
        source: "BUILD_MAP",
        stageNumber: 3,
        dependencies: ["task_step_2_ecom_shell"],
        blocked_by: [],
        related_blueprint_items: ["Product", "ProductVariant"],
        related_engineering_items: ["FRONTEND", "BACKEND"],
        related_decisions: decisionList,
        related_assumptions: [],
        affected_screens: ["/products/[slug]"],
        affected_entities: ["Product", "ProductVariant"],
        affected_apis: ["/api/products/[slug]"],
        acceptance_criteria: [
          "Selecting variant attributes (size, color) instantly updates price, SKU, and available stock count",
          "Low-stock urgency badge displays when inventory <= low_stock_threshold; out-of-stock variants disable Add-to-Cart",
          "Add-to-Cart action triggers slide-over drawer with optimistic update and Sonner toast confirmation",
        ],
        change_boundaries: {
          mustChange: ["app/products/[slug]/", "components/products/"],
          mayChange: ["lib/cart/", "types/"],
          mustNotChange: ["supabase/migrations/"],
        },
        created_at: now,
        updated_at: now,
      },
      {
        id: "task_step_4_ecom_checkout",
        project_id: projectId,
        title: `Step 4 of 5: Implement Secure Checkout, Atomic Inventory Locking & Idempotent Webhook Reconciliation`,
        short_description: `Build /checkout with guest/customer address validation, server-side price recalculation, atomic inventory decrement query, and cryptographic webhook listener.`,
        purpose: `Executes safe transactions with zero trust for client-submitted prices, atomic concurrency locking to eliminate overselling, and idempotent webhook reconciliation.`,
        user_value: `Ensures shoppers are charged the exact correct amount and receive verified order confirmation without oversold inventory errors.`,
        task_type: "FEATURE",
        category: "Step 4 · Checkout, Concurrency & Payment Reconciliation",
        priority: "CRITICAL",
        status: "READY",
        readiness: "READY",
        complexity: "LARGE",
        source: "BUILD_MAP",
        stageNumber: 4,
        dependencies: ["task_step_3_ecom_product_pdp"],
        blocked_by: [],
        related_blueprint_items: ["CustomerOrder", "InventoryReservation", "ProcessedWebhookEvent"],
        related_engineering_items: ["BACKEND", "SECURITY", "PAYMENTS"],
        related_decisions: decisionList,
        related_assumptions: [],
        affected_screens: ["/checkout"],
        affected_entities: ["CustomerOrder", "OrderItem", "ProductVariant", "ProcessedWebhookEvent"],
        affected_apis: ["/api/checkout", "/api/webhooks/stripe"],
        acceptance_criteria: [
          "Server Action recalculates subtotals, shipping, and taxes strictly from product_variants table, discarding any client prices",
          "Atomic inventory decrement query (or SELECT ... FOR UPDATE) rejects checkout if stock drops below requested quantity during checkout",
          "Webhook handler verifies HMAC signature and uses processed_webhook_events table to enforce idempotent execution on repeated provider retries",
          "Order state transitions to 'processing' strictly upon cryptographic webhook verification, never upon frontend redirect",
        ],
        change_boundaries: {
          mustChange: ["app/checkout/", "app/api/checkout/", "app/api/webhooks/"],
          mayChange: ["lib/payments/", "lib/validations/"],
          mustNotChange: ["public/"],
        },
        created_at: now,
        updated_at: now,
      },
      {
        id: "task_step_5_ecom_fulfillment",
        project_id: projectId,
        title: `Step 5 of 5: Build Order Confirmation, Real-Time Tracking Lookup, SEO & Final Build Verification`,
        short_description: `Build /orders/[id] confirmation view with itemized receipt, order status lookup, product Schema.org JSON-LD structured data, and production build checks.`,
        purpose: `Completes the post-purchase customer experience, merchant order tracking, and search engine discoverability.`,
        user_value: `Allows customers to check their order receipt and delivery status anytime while ensuring fast, SEO-optimized page loads.`,
        task_type: "UI",
        category: "Step 5 · Order Confirmation & Production Polish",
        priority: "HIGH",
        status: "READY",
        readiness: "READY",
        complexity: "MEDIUM",
        source: "BUILD_MAP",
        stageNumber: 5,
        dependencies: ["task_step_4_ecom_checkout"],
        blocked_by: [],
        related_blueprint_items: ["CustomerOrder", "Storefront & Catalog"],
        related_engineering_items: ["FRONTEND", "SEO", "TESTING"],
        related_decisions: decisionList,
        related_assumptions: [],
        affected_screens: ["/orders/[id]", "/shop", "/products/[slug]"],
        affected_entities: ["CustomerOrder", "Product"],
        affected_apis: ["/api/orders/[id]"],
        acceptance_criteria: [
          "Order confirmation screen (/orders/[id]) renders itemized receipt, carrier tracking number, and delivery address",
          "Product detail pages include dynamic Schema.org JSON-LD structured data and OpenGraph social metadata",
          "All storefront and checkout flows pass 360px mobile, tablet, and desktop responsiveness checks",
          "npm run typecheck and npm run build pass with 0 errors",
        ],
        change_boundaries: {
          mustChange: ["app/orders/[id]/", "app/layout.tsx", "components/orders/"],
          mayChange: ["public/"],
          mustNotChange: ["supabase/migrations/"],
        },
        created_at: now,
        updated_at: now,
      },
    ];

    const recommendation: TaskRecommendation = {
      recommendedTaskId: ecomTasks[0].id,
      recommendedTaskTitle: ecomTasks[0].title,
      whyNext: "Always start with Step 1 to set up your product catalog, variant attributes, and atomic inventory concurrency constraints before building the frontend storefront.",
      prerequisitesMet: true,
      alternativeReadyTasks: ecomTasks.slice(1, 3).map((t) => ({
        taskId: t.id,
        title: t.title,
        reason: t.purpose,
      })),
    };

    return { tasks: ecomTasks, recommendation };
  }

  const tasks: AigenstraTask[] = [
    {
      id: "task_step_1_foundation",
      project_id: projectId,
      title: `Step 1 of 5: Set Up ${ctx.projectName} Database Schema, Types & RLS`,
      short_description: `Create the Supabase PostgreSQL tables for ${ctx.primaryEntityName} and ${ctx.secondaryEntityName}, enable Row-Level Security (RLS), and define TypeScript interfaces + Zod schemas.`,
      purpose: `Gives ${ctx.projectName} a rock-solid data and type foundation from scratch so subsequent UI and workflow prompts never guess column names or types.`,
      user_value: `Ensures all ${ctx.primaryRole} data is validated and securely persisted in Supabase.`,
      task_type: "DATABASE",
      category: "Step 1 · Foundation & Schema",
      priority: "CRITICAL",
      status: "READY",
      readiness: "READY",
      complexity: "MEDIUM",
      source: "BUILD_MAP",
      stageNumber: 1,
      dependencies: [],
      blocked_by: [],
      related_blueprint_items: [ctx.primaryEntityName, ctx.secondaryEntityName],
      related_engineering_items: ["DATABASE", "SECURITY"],
      related_decisions: decisionList.slice(0, 2),
      related_assumptions: [],
      affected_screens: [],
      affected_entities: [ctx.primaryEntityName, ctx.secondaryEntityName],
      affected_apis: ["lib/supabase/", "types/"],
      acceptance_criteria: [
        `Supabase SQL migration defines tables for ${ctx.primaryEntityName} and ${ctx.secondaryEntityName} with RLS enabled`,
        `TypeScript interfaces and Zod validation schemas match all ${ctx.primaryEntityName} attributes`,
        ...(ctx.productType === "SaaS"
          ? [
              "Row-Level Security policy strictly enforces tenant isolation (auth.uid() = user_id or organization_id membership)",
              "Automated negative tenant isolation tests verify cross-tenant access returns 403 Forbidden or empty datasets",
            ]
          : []),
        "Zero TypeScript compiler errors on npm run typecheck",
      ],
      change_boundaries: {
        mustChange: [
          "supabase/migrations/",
          "types/index.ts",
          "lib/validations/",
        ],
        mayChange: ["lib/supabase/"],
        mustNotChange: ["public/"],
      },
      created_at: now,
      updated_at: now,
    },
    {
      id: "task_step_2_shell",
      project_id: projectId,
      title:
        ctx.productType === "Landing Page" ||
        ctx.productType === "Business Website"
          ? `Step 2 of 5: Build ${ctx.projectName} Responsive Header, Hero & Layout Shell`
          : `Step 2 of 5: Build ${ctx.projectName} Navigation Shell & Authentication Flow`,
      short_description:
        ctx.productType === "Landing Page" ||
        ctx.productType === "Business Website"
          ? `Implement the responsive navigation bar, above-the-fold Hero section, and primary CTA for ${ctx.projectName} on ${primaryScreen}.`
          : `Implement responsive workspace navigation, authentication screens (${primaryScreen}), and session protection for ${ctx.projectName}.`,
      purpose: `Establishes the visual layout shell, navigation hierarchy, and user entry flow for ${ctx.primaryRole}.`,
      user_value: `Allows ${ctx.primaryRole} to enter ${ctx.projectName} smoothly on mobile (360px+), tablet, and desktop.`,
      task_type:
        ctx.productType === "Landing Page" ||
        ctx.productType === "Business Website"
          ? "FRONTEND"
          : "AUTH",
      category: "Step 2 · Layout & Entry",
      priority: "CRITICAL",
      status: "READY",
      readiness: "READY",
      complexity: "MEDIUM",
      source: "BUILD_MAP",
      stageNumber: 2,
      dependencies: ["task_step_1_foundation"],
      blocked_by: [],
      related_blueprint_items: [
        softwareBlueprint.screens?.[0]?.screenName || "Primary Screen",
      ],
      related_engineering_items: ["FRONTEND", "AUTHENTICATION"],
      related_decisions: decisionList,
      related_assumptions: [],
      affected_screens: [primaryScreen],
      affected_entities: [ctx.primaryEntityName],
      affected_apis: ["/api/auth"],
      acceptance_criteria: [
        `Primary entry screen (${primaryScreen}) renders responsively from 360px mobile to desktop`,
        "All icons use Lucide SVG components with zero emojis",
        "Navigation and entry actions provide clear focus, hover, and loading states",
      ],
      change_boundaries: {
        mustChange: ["app/", "components/layout/"],
        mayChange: ["lib/supabase/"],
        mustNotChange: ["supabase/migrations/"],
      },
      created_at: now,
      updated_at: now,
    },
    {
      id: "task_step_3_core_workflow",
      project_id: projectId,
      title: `Step 3 of 5: Implement Core ${ctx.primaryEntityName} Workflow & Supabase Persistence`,
      short_description: `Build the interactive ${ctx.primaryEntityName} creation, validation, and display workflow connected to Supabase.`,
      purpose: `Delivers the core capability of ${ctx.projectName} so ${ctx.primaryRole} can ${ctx.coreActionVerb} in real time.`,
      user_value: `Enables ${ctx.primaryRole} to complete their primary goal with instant visual confirmation and saved data.`,
      task_type: "FEATURE",
      category: "Step 3 · Core Workflow",
      priority: "CRITICAL",
      status: "READY",
      readiness: "READY",
      complexity: "LARGE",
      source: "BUILD_MAP",
      stageNumber: 3,
      dependencies: ["task_step_2_shell"],
      blocked_by: [],
      related_blueprint_items: [
        ctx.primaryEntityName,
        softwareBlueprint.workflows?.[0]?.name || "Core Workflow",
      ],
      related_engineering_items: ["FRONTEND", "BACKEND", "DATABASE"],
      related_decisions: decisionList,
      related_assumptions: [],
      affected_screens: [primaryScreen, secondaryScreen],
      affected_entities: [ctx.primaryEntityName],
      affected_apis: [`/api/${ctx.primaryEntityPlural}`],
      acceptance_criteria: [
        `${ctx.primaryRole} can submit and persist ${ctx.primaryEntityName} records to Supabase`,
        "Invalid inputs are caught by Zod and displayed inline without losing form state",
        "Empty state, loading skeleton, and success feedback render cleanly",
      ],
      change_boundaries: {
        mustChange: [
          `app/`,
          `components/${ctx.primaryEntityPlural}/`,
          `app/api/${ctx.primaryEntityPlural}/route.ts`,
        ],
        mayChange: ["types/index.ts", "lib/"],
        mustNotChange: ["supabase/migrations/"],
      },
      created_at: now,
      updated_at: now,
    },
    {
      id: "task_step_4_secondary",
      project_id: projectId,
      title:
        ctx.productType === "SaaS"
          ? `Step 4 of 5: Build ${ctx.secondaryEntityName} Dashboard, Workspace Settings & Plan Gating`
          : `Step 4 of 5: Build ${ctx.secondaryEntityName} View, Filtering & Confirmed Decisions`,
      short_description:
        ctx.productType === "SaaS"
          ? `Implement ${secondaryScreen} with ${ctx.secondaryEntityName} status views, plus workspace settings (/dashboard/settings) and subscription tier gating.`
          : `Implement ${secondaryScreen} with ${ctx.secondaryEntityName} management, filtering, and user-confirmed workflow rules.`,
      purpose: `Completes the secondary screens, settings, and operational controls decided during Idea & Architecture discovery.`,
      user_value: `Gives ${ctx.primaryRole} and ${ctx.secondaryRole} full visibility, profile preferences, and control over ${ctx.secondaryEntityName} states.`,
      task_type: "FEATURE",
      category: "Step 4 · Secondary & Management",
      priority: "HIGH",
      status: "READY",
      readiness: "READY",
      complexity: "MEDIUM",
      source: "BUILD_MAP",
      stageNumber: 4,
      dependencies: ["task_step_3_core_workflow"],
      blocked_by: [],
      related_blueprint_items: [ctx.secondaryEntityName],
      related_engineering_items: ["FRONTEND", "BACKEND"],
      related_decisions: decisionList,
      related_assumptions: [],
      affected_screens:
        ctx.productType === "SaaS"
          ? [secondaryScreen, "/dashboard/settings"]
          : [secondaryScreen],
      affected_entities: [ctx.primaryEntityName, ctx.secondaryEntityName],
      affected_apis: [`/api/${ctx.primaryEntityPlural}`],
      acceptance_criteria: [
        `Screen ${secondaryScreen} renders live ${ctx.secondaryEntityName} data from Supabase`,
        "Status filtering and search update the view accurately",
        "All confirmed discovery decisions are reflected in the UI and backend rules",
        ...(ctx.productType === "SaaS"
          ? [
              "Workspace settings screen allows updating profile and shows active subscription plan tier",
              "Role-based permissions matrix prevents non-owners/non-admins from modifying billing or inviting members",
              "Stripe / Lemon Squeezy webhook listener verifies signatures and handles past_due, canceled, and active subscription state transitions idempotently",
              "Zero-trust server-side validation: plan tiers and quotas are resolved strictly on the server",
            ]
          : []),
      ],
      change_boundaries: {
        mustChange: ["app/", "components/"],
        mayChange: ["lib/"],
        mustNotChange: ["supabase/migrations/"],
      },
      created_at: now,
      updated_at: now,
    },
    {
      id: "task_step_5_launch",
      project_id: projectId,
      title: `Step 5 of 5: Final Responsive Polish, Edge Cases, SEO & Production Verification`,
      short_description: `Harden error boundaries, add SEO/OpenGraph metadata, verify 360px+ mobile responsiveness, and pass full TypeScript build checks.`,
      purpose: `Takes ${ctx.projectName} from working feature code to a polished, production-ready ${ctx.productType}.`,
      user_value: `Delivers a fast, trustworthy, accessible experience across every device with zero broken states.`,
      task_type: "UI",
      category: "Step 5 · Polish & Launch",
      priority: "MEDIUM",
      status: "READY",
      readiness: "READY",
      complexity: "SMALL",
      source: "BUILD_MAP",
      stageNumber: 5,
      dependencies: ["task_step_4_secondary"],
      blocked_by: [],
      related_blueprint_items: ["Quality", "Security"],
      related_engineering_items: ["PERFORMANCE", "SEO", "TESTING"],
      related_decisions: decisionList,
      related_assumptions: [],
      affected_screens: allScreenRoutes,
      affected_entities: [ctx.primaryEntityName, ctx.secondaryEntityName],
      affected_apis: [],
      acceptance_criteria: [
        "All pages include accurate title, description, and OpenGraph metadata",
        "All screens pass 360px mobile, 768px tablet, and 1280px desktop responsiveness checks",
        "npm run typecheck and npm run build complete with 0 errors",
      ],
      change_boundaries: {
        mustChange: ["app/layout.tsx", "app/", "components/"],
        mayChange: ["public/"],
        mustNotChange: ["supabase/migrations/"],
      },
      created_at: now,
      updated_at: now,
    },
  ];

  const recommendation: TaskRecommendation = {
    recommendedTaskId: tasks[0].id,
    recommendedTaskTitle: tasks[0].title,
    whyNext: `Always start with Step 1 (${tasks[0].title}) so your Supabase tables, Row-Level Security policies, and TypeScript interfaces are locked in before generating UI components.`,
    prerequisitesMet: true,
    alternativeReadyTasks: tasks.slice(1, 3).map((t) => ({
      taskId: t.id,
      title: t.title,
      reason: t.purpose,
    })),
  };

  return { tasks, recommendation };
}

/**
 * Built-In Idea Understanding Agent: Synthesizes an IdeaUnderstandingRecord
 * from the user's raw idea and Product Type when Gemini API is unavailable.
 */
export function runBuiltInIdeaUnderstandingAgent(
  projectName: string,
  rawIdea: string,
  productType?: string | null
): IdeaUnderstandingRecord {
  const ctx = analyzeProjectContext(projectName, rawIdea, productType);
  return {
    rawIdea,
    normalizedDescription: `${ctx.projectName} (${ctx.productType}): ${ctx.cleanDescription}`,
    likelyProductType: ctx.productType,
    targetUsers: [ctx.primaryRole, ctx.secondaryRole],
    primaryOutcome: `Enables ${ctx.primaryRole} to ${ctx.coreActionVerb} with validated Supabase persistence and responsive UX.`,
    detectedFeatures: [
      `Core ${ctx.primaryEntityName} Workflow & Persistence`,
      `${ctx.secondaryEntityName} Status & Management View`,
      `Responsive ${ctx.productType} Layout (Mobile, Tablet & Desktop)`,
    ],
    detectedActors: [ctx.primaryRole, ctx.secondaryRole],
    detectedWorkflows: [
      `${ctx.primaryRole} Entry & Onboarding -> ${ctx.primaryEntityName} Action -> Supabase Persistence -> ${ctx.secondaryEntityName} Confirmation`,
    ],
    uncertainties: [
      `Confirm primary ${ctx.primaryEntityName} workflow and user access model`,
    ],
    missingInformation: [],
    confidence: "CONFIRMED",
    initialAssumptions: [
      `Built with ${ctx.techStack} and Supabase Row-Level Security`,
    ],
  };
}

/**
 * Built-In Summary Agent: Synthesizes a plain-English ProductSummary from the user's
 * project details and confirmed discovery answers when Gemini API is unavailable.
 */
export function runBuiltInSummaryAgent(
  projectName: string,
  rawIdea: string,
  qnaList: Array<{ question: string; answer?: string | null; category?: string }>,
  assumptions: ProductAssumption[] = [],
  productType?: string | null,
  isSufficient: boolean = true
): ProductSummary {
  const ctx = analyzeProjectContext(projectName, rawIdea, productType, qnaList);
  const confirmedCapabilities = ctx.confirmedDecisions.map(
    (d) => `${d.answer.replace(/^\(Recommended\)\s*/i, "")}`
  );

  return {
    whatBuilding: `${ctx.projectName} — ${ctx.cleanDescription}`,
    whoFor: [ctx.primaryRole, ctx.secondaryRole],
    mainExperience: `${ctx.primaryRole} accesses ${ctx.projectName}, completes the ${ctx.primaryEntityName} workflow with real-time validation, and views live ${ctx.secondaryEntityName} updates.`,
    businessExperience: `${ctx.secondaryRole} manages ${ctx.primaryEntityName} and ${ctx.secondaryEntityName} records securely via Supabase RLS.`,
    coreCapabilities:
      confirmedCapabilities.length > 0
        ? confirmedCapabilities
        : [
            `Core ${ctx.primaryEntityName} Creation & Validation Workflow`,
            `${ctx.secondaryEntityName} Management & Status Tracking`,
            `Responsive ${ctx.productType} Interface (360px+ Mobile to Desktop)`,
          ],
    activeAssumptions: assumptions,
    decisionsLeft: qnaList
      .filter((q) => !q.answer || q.answer.trim().length === 0)
      .map((q) => q.question),
    isSufficient,
  };
}

