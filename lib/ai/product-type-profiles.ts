import { ProductType } from "@/types";

export interface ArchitectureMethodGuide {
  stackOverview: string;
  monthlyCost: string;
  databaseAndAuth: string;
  paymentsAndBilling: string;
  backgroundTasks: string;
  emailAndCommunications: string;
  rateLimitingAndCaching: string;
  tradeoffsAndLimits: string[];
}

export interface SaaSArchitectureDeepening {
  tenancyModels: {
    personalWorkspace: string;
    teamOrganization: string;
  };
  roleBasedPermissions: Array<{
    role: string;
    permissions: string[];
    canManageBilling: boolean;
    canInviteMembers: boolean;
  }>;
  tenantDataIsolationRules: {
    databasePolicySql: string;
    apiEnforcementRule: string;
    isolationTestPlan: string[];
  };
  subscriptionLifecycle: {
    states: string[];
    dunningPolicy: string;
    quotaEnforcementRule: string;
  };
  paymentSecurityRules: string[];
  operationalRequirements: {
    auditLogging: string;
    backgroundQueues: string;
    backupAndRecovery: string;
  };
}

export interface ECommerceArchitectureDeepening {
  catalogAndVariants: {
    categoryHierarchy: string;
    variantAttributes: string[];
    skuAndPricingRules: string;
  };
  searchAndDiscovery: {
    filteringDimensions: string[];
    sortingOptions: string[];
    fullTextSearchEngine: string;
  };
  pricingAndPromotions: {
    currencyAndTax: string;
    discountAndCoupons: string;
    serverCalculationEnforcement: string;
  };
  inventoryAndConcurrency: {
    concurrencyProtectionSql: string;
    reservationTtlMinutes: number;
    lowStockThresholdHandling: string;
    oversellingPreventionRule: string;
  };
  cartAndCheckout: {
    guestVsAccountPolicy: string;
    shippingCalculation: string;
    sessionCartPersistence: string;
  };
  orderStateMachine: {
    states: string[];
    stateTransitions: Array<{
      from: string;
      to: string;
      trigger: string;
      stockAction: "RESERVE" | "CONFIRM_DECREMENT" | "RESTORE" | "NONE";
    }>;
  };
  paymentReconciliation: {
    zeroTrustValidationRule: string;
    webhookSignatureVerification: string;
    idempotencyTableSql: string;
    failureAndDisputePolicy: string;
  };
  fulfillmentAndOperations: {
    fulfillmentWorkflow: string;
    staffRolePermissions: Array<{ role: string; capabilities: string[] }>;
    transactionalNotifications: string[];
  };
}

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
  freeTierArchitecture?: ArchitectureMethodGuide;
  paidScaleArchitecture?: ArchitectureMethodGuide;
  saasDeepening?: SaaSArchitectureDeepening;
  ecommerceDeepening?: ECommerceArchitectureDeepening;
}

export const PRODUCT_TYPE_PROFILES: Record<ProductType, ProductTypeArchitectureProfile> = {
  "SaaS": {
    productType: "SaaS",
    label: "B2B / B2C Software-as-a-Service (SaaS)",
    architecturalSummary:
      "Multi-tenant recurring software platform centered around frictionless user/workspace onboarding, core value-creation workflows (TTFV < 60s), role-based access control, secure tenant data isolation, and subscription/usage lifecycle management. Supports both the $0/mo Free Bootstrap Method (Next.js + Supabase Free + Lemon Squeezy/Stripe + Resend) and the Paid Scale Method (Supabase Pro + Upstash Redis + Inngest/Temporal + Stripe Billing + Enterprise SSO).",
    researchFocusAreas: [
      "Target customer workflow bottleneck and time-to-first-value (activation under 60 seconds)",
      "Launch budget strategy: Free Bootstrap Method ($0/mo) vs. Paid Scale Method ($100-$300+/mo)",
      "Multi-tenancy isolation model: Personal user workspaces (user_id RLS) vs. Collaborative organization workspaces (organization_id RLS + membership roles)",
      "Role-based permissions & resource-level authorization matrix (owner, admin, member, billing_admin)",
      "Subscription and monetization mechanics: Free tier limits, usage counters, Stripe/Lemon Squeezy webhooks, and failed payment dunning",
      "Tenant data isolation test planning at the database, API middleware, and Server Action layers",
    ],
    essentialQuestionDimensions: [
      "Workspace & Tenancy Model: Will users work solo in personal accounts (user_id RLS), or invite team members into shared workspaces with roles (organization_id RLS)?",
      "Core Activation Workflow: What is the exact primary action a user must complete in their first session to get value?",
      "Monetization & Tier Gating: Will you use a $0/mo Free bootstrap method (Stripe/Lemon Squeezy pay-per-transaction) or a Paid scale billing stack with tiered limits?",
      "Data & External Integrations: What specific domain records are created, and do they connect to external webhooks, email triggers, or APIs?",
    ],
    typicalScreenPatterns: [
      "Authentication & Workspace Onboarding (/login, /signup, /onboarding)",
      "Primary Workspace Dashboard & KPI Telemetry (/dashboard)",
      "Core Domain Workflow Studio & Execution View (/dashboard/[entity])",
      "Workspace Settings, Team Members & Subscription Billing (/dashboard/settings)",
    ],
    typicalDataEntities: [
      "profiles (id, email, full_name, plan_tier, created_at)",
      "organizations / workspaces (if collaborative team tenancy is selected)",
      "organization_members (org_id, user_id, role [owner, admin, member, billing_admin])",
      "domain-specific core entity (derived strictly from user idea)",
      "subscriptions (id, org_id, stripe_sub_id, plan_id, status, current_period_end)",
      "usage_logs (id, org_id, metric_name, quantity, period_start, period_end)",
      "audit_logs (id, org_id, actor_id, action, target_entity, ip_address, created_at)",
    ],
    uxAndConversionPriorities: [
      "Frictionless onboarding reaching the core value action in under 60 seconds (Time to First Value / TTFV)",
      "Clear, actionable empty states with guided first-action triggers rather than blank canvases",
      "Optimistic UI updates with rollback and Sonner toast notifications on all mutations",
      "Responsive navigation (360px mobile drawer to widescreen sidebar) with Lucide SVG icons (zero emojis)",
    ],
    securityAndBackendPriorities: [
      "Supabase Row-Level Security (RLS) strictly enforced at the database engine level (auth.uid() = user_id or organization membership check)",
      "Zero trust for client-submitted roles, prices, payment status, or tenant identifiers",
      "Server Actions and REST route handlers with rigorous Zod schema validation",
      "Idempotent webhook handlers for payment and external lifecycle events with signature verification",
      "Automated negative tenant isolation tests asserting 403 on cross-tenant requests",
    ],
    antiBloatGuardrails: [
      "Never invent fictional placeholder tables (e.g., 'WorkspaceItem' or 'CoreResource'); name entities directly after the user's real business domain.",
      "Do not force multi-tenant team organizations or enterprise SSO if the user only requires a personal solo SaaS.",
      "Do not require heavy external queuing infrastructure when Supabase pg_cron or serverless background handlers suffice for the bootstrap stage.",
    ],
    freeTierArchitecture: {
      stackOverview:
        "The $0/mo Bootstrap SaaS Method: Complete production-ready stack designed to validate, launch, and monetize without any fixed monthly server costs.",
      monthlyCost: "$0.00 / month (100% pay-as-you-grow)",
      databaseAndAuth:
        "Supabase Free Tier (500 MB PostgreSQL, 50,000 monthly active users, Auth with email/password + social OAuth, built-in Row-Level Security)",
      paymentsAndBilling:
        "Lemon Squeezy or Stripe Checkout with Merchant-of-Record / standard checkout ($0 upfront, 2.9% + 30¢ or 5% + 50¢ per successful transaction only)",
      backgroundTasks:
        "Next.js App Router background routes + Supabase Database Webhooks / pg_cron for scheduled tasks ($0/mo)",
      emailAndCommunications:
        "Resend Free Tier (3,000 emails/month, 100 emails/day) for transactional onboarding & password recovery",
      rateLimitingAndCaching:
        "Cloudflare Free Tier (Global CDN, DDoS protection, edge caching) + in-memory Next.js cache",
      tradeoffsAndLimits: [
        "Supabase free projects pause after 7 days of inactivity (prevented by automated pings or active users)",
        "500 MB database storage limit (sufficient for 100,000+ relational text rows)",
        "3,000 monthly transactional emails before needing paid tier",
      ],
    },
    paidScaleArchitecture: {
      stackOverview:
        "The High-Throughput / Scale SaaS Method: Resilient, high-concurrency infrastructure built for teams, high data volume, and strict SLAs.",
      monthlyCost: "$150 - $450+ / month base",
      databaseAndAuth:
        "Supabase Pro ($25/mo) with Supavisor connection pooling, Point-in-Time Recovery (PITR), and dedicated compute add-on or AWS RDS PostgreSQL",
      paymentsAndBilling:
        "Stripe Billing + Customer Portal + idempotent webhook listeners with dead-letter queue and automated dunning/retry logic",
      backgroundTasks:
        "Inngest or Temporal ($20 - $100/mo) for durable step-function workflows, retries, and scheduled jobs with zero lost state",
      emailAndCommunications:
        "Resend Pro ($20/mo) or AWS SES with dedicated IP and automated deliverability monitoring",
      rateLimitingAndCaching:
        "Upstash Redis ($10 - $50/mo) with sliding-window distributed rate limiting and global session caching",
      tradeoffsAndLimits: [
        "Higher fixed operational cost prior to product-market fit",
        "Requires managing multiple vendor credentials and webhook endpoints",
      ],
    },
    saasDeepening: {
      tenancyModels: {
        personalWorkspace: "Single-user SaaS: auth.uid() = user_id. Every record references user_id. Fast to launch, zero team overhead.",
        teamOrganization: "Collaborative B2B SaaS: organizations + organization_members. Records reference organization_id. Roles: owner, admin, member, billing_admin.",
      },
      roleBasedPermissions: [
        {
          role: "owner",
          permissions: ["read", "write", "delete", "manage_members", "manage_billing", "delete_organization"],
          canManageBilling: true,
          canInviteMembers: true,
        },
        {
          role: "admin",
          permissions: ["read", "write", "delete", "manage_members"],
          canManageBilling: false,
          canInviteMembers: true,
        },
        {
          role: "member",
          permissions: ["read", "write"],
          canManageBilling: false,
          canInviteMembers: false,
        },
        {
          role: "billing_admin",
          permissions: ["read", "manage_billing"],
          canManageBilling: true,
          canInviteMembers: false,
        },
      ],
      tenantDataIsolationRules: {
        databasePolicySql:
          "CREATE POLICY tenant_isolation_policy ON target_table FOR ALL USING (organization_id IN (SELECT org_id FROM organization_members WHERE user_id = auth.uid()));",
        apiEnforcementRule:
          "Server Actions and Route Handlers must verify that the authenticated user belongs to the requested organization_id before executing any mutation.",
        isolationTestPlan: [
          "Unit Test: Verify RLS policy blocks SELECT queries when auth.uid() is not a member of the organization",
          "Integration Test: User A creates a record in Org A; User B (in Org B) attempts GET /api/records/[id] -> must return 403 or 404",
          "Mutation Test: User B attempts POST/PUT/DELETE on Org A record -> must return 403 Forbidden",
        ],
      },
      subscriptionLifecycle: {
        states: ["trialing", "active", "past_due", "canceled", "unpaid"],
        dunningPolicy:
          "On invoice.payment_failed: transition status to past_due, send automated dunning email, grant 3-day grace period before restricting write actions.",
        quotaEnforcementRule:
          "Before executing high-resource actions, check active subscription status and compare current usage_records count against plan entitlement limit.",
      },
      paymentSecurityRules: [
        "NEVER trust client-provided price, plan_tier, or payment status. Resolve price strictly on the server from database or billing catalog.",
        "Verify Stripe/Lemon Squeezy webhook signatures using the endpoint secret before processing events.",
        "Store event ID in a processed_webhook_events table to guarantee idempotency on retries.",
      ],
      operationalRequirements: {
        auditLogging:
          "Record every privilege escalation, member invite, role change, and deletion in an immutable audit_logs table.",
        backgroundQueues:
          "Use Supabase pg_cron for daily maintenance and Inngest/Temporal for durable asynchronous workflows.",
        backupAndRecovery:
          "Configure automated daily PostgreSQL backups with Point-in-Time Recovery (PITR) for mission-critical SaaS data.",
      },
    },
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
      "Transactional storefront and order fulfillment platform featuring product catalog hierarchies, variant/attribute matrix, real-time search & faceted filtering, inventory reservation concurrency control, persistent shopping cart, zero-trust checkout calculation, idempotent payment webhook reconciliation, and strict order state lifecycle tracking.",
    researchFocusAreas: [
      "Product catalog structure: categories, variant matrix (size/color/SKU), and attribute definitions",
      "Search, discovery & merchandising: full-text search, multi-faceted filtering (category, price, availability), and sorting",
      "Pricing, tax, discounts & promotions: country/currency rules, coupon validation, and server-side total recalculation",
      "Inventory reservation & concurrency control: atomic decrements and row-level locking (SELECT ... FOR UPDATE) to eliminate overselling",
      "Checkout & payment reconciliation: guest vs customer accounts, address validation, shipping methods, and cryptographic webhook verification",
      "Order state machine: pending_payment -> processing -> fulfilled -> delivered -> canceled/refunded/disputed",
      "Store administration & operations: fulfillment tracking, returns, inventory thresholds, and transactional email notifications",
    ],
    essentialQuestionDimensions: [
      "Target Market, Country & Currency: What primary countries are you selling to, what currency (e.g., USD, EUR, GBP, NGN), and are there specific regional tax/VAT rules?",
      "Catalog & Product Variants: What types of products are sold (physical vs digital) and do they have multi-attribute variants (e.g., sizes, colors, material, SKU) or stock tracking?",
      "Checkout Flow & Guest Buying: Can shoppers complete checkout as guests with just email/address, or is customer account creation mandatory?",
      "Payment Gateway & Delivery Model: Which payment provider will be integrated (e.g., Stripe Checkout, Lemon Squeezy, Paystack, PayPal) and what is the shipping/delivery fulfillment method?",
      "Inventory & Order Rules: How should low-stock or out-of-stock items behave, and what return/refund policy transitions should be supported?",
    ],
    typicalScreenPatterns: [
      "Storefront Home with Hero, Value Props, and Featured Collections (/)",
      "Product Catalog Grid with Category Filter Drawer & Faceted Search (/products)",
      "Product Detail Page with Multi-Attribute Variant Selector, Gallery & Add-to-Cart (/products/[slug])",
      "Persistent Slide-over Cart Drawer with Line-Item Quantity Controls",
      "Multi-Step or One-Page Responsive Checkout with Address & Payment (/checkout)",
      "Order Confirmation with Itemized Receipt & Real-Time Tracking Link (/orders/[id])",
      "Customer Account Order History & Address Book (/account/orders)",
      "Store Admin Order Management, Inventory Levels & Fulfillment Console (/admin/orders)",
    ],
    typicalDataEntities: [
      "categories (id, name, slug, parent_id, image_url, sort_order)",
      "products (id, name, slug, description, category_id, base_price_cents, is_published, created_at)",
      "product_variants (id, product_id, sku, title, price_cents, compare_at_price_cents, inventory_quantity, low_stock_threshold, attributes_json)",
      "carts & cart_items (id, session_id, user_id, variant_id, quantity, expires_at)",
      "inventory_reservations (id, variant_id, order_id, quantity, reserved_at, expires_at, status)",
      "orders (id, order_number, customer_id, customer_email, status, subtotal_cents, tax_cents, shipping_cents, total_cents, currency, shipping_address_json)",
      "order_items (id, order_id, variant_id, title, unit_price_cents, quantity, total_cents)",
      "processed_webhook_events (id, event_id, provider, event_type, processed_at)",
      "coupons (id, code, discount_type, value, min_order_cents, max_uses, uses_count, expires_at)",
    ],
    uxAndConversionPriorities: [
      "Frictionless Add-to-Cart with instant drawer feedback and zero full-page reloads",
      "Persistent cart state synced to session storage or Supabase table across browser sessions",
      "High-resolution real Unsplash imagery with responsive thumbnails and fluid gallery zoom",
      "Mobile-optimized checkout (360px+) with auto-complete addresses and inline card validation",
      "Clear stock availability badges ('In Stock', 'Only 3 left', 'Backorder') to drive urgency",
    ],
    securityAndBackendPriorities: [
      "Zero trust for client-submitted prices, discounts, or subtotals: recalculate all totals server-side from product_variants table",
      "Row-level locking (`SELECT ... FOR UPDATE`) or atomic SQL decrement (`UPDATE product_variants SET inventory_quantity = inventory_quantity - $1 WHERE id = $2 AND inventory_quantity >= $1`) to prevent overselling under high concurrency",
      "Idempotent payment webhook listener verifying provider signature header and recording event_id in processed_webhook_events before mutating order status",
      "Never treat frontend success page redirect as payment confirmation; order status changes to 'paid/processing' exclusively upon validated webhook execution",
      "Supabase Row-Level Security: public read on published products/variants, customer-isolated read/update on orders matching auth.uid() or secure order token",
    ],
    antiBloatGuardrails: [
      "Never invent fictional placeholder tables (e.g. 'WorkspaceItem'); use clean ecommerce schema: products, product_variants, orders, order_items.",
      "Do not force mandatory account creation if the user idea or discovery answers prefer fast guest checkout.",
      "Do not add complex multi-vendor commission splits unless the user explicitly requested a multi-vendor Marketplace.",
    ],
    ecommerceDeepening: {
      catalogAndVariants: {
        categoryHierarchy: "Hierarchical category tree with parent_id and slug for SEO-friendly breadcrumb navigation (/collections/apparel/outerwear).",
        variantAttributes: ["size", "color", "material", "format", "edition"],
        skuAndPricingRules: "Each variant has a unique SKU, price_cents integer (preventing IEEE 754 float rounding errors), and optional compare_at_price_cents for discount badges.",
      },
      searchAndDiscovery: {
        filteringDimensions: ["category_slug", "price_range_min_max", "variant_attributes", "in_stock_only", "rating"],
        sortingOptions: ["featured", "price_asc", "price_desc", "newest", "best_selling"],
        fullTextSearchEngine: "PostgreSQL pg_trgm and tsvector text search on product title and description.",
      },
      pricingAndPromotions: {
        currencyAndTax: "Prices stored in base integer cents with ISO 4217 currency code. Tax rates applied based on destination shipping address jurisdiction.",
        discountAndCoupons: "Coupon engine supporting percentage discounts, fixed-amount deductions, minimum cart value thresholds, and global max-use limits.",
        serverCalculationEnforcement: "The checkout Server Action recalculates: subtotal = sum(variant.price_cents * qty) - coupon_discount + shipping_fee + calculated_tax. Client payload total is completely discarded.",
      },
      inventoryAndConcurrency: {
        concurrencyProtectionSql: "UPDATE product_variants SET inventory_quantity = inventory_quantity - $1, updated_at = NOW() WHERE id = $2 AND inventory_quantity >= $1 RETURNING id, inventory_quantity;",
        reservationTtlMinutes: 15,
        lowStockThresholdHandling: "When inventory_quantity <= low_stock_threshold, display 'Only X items left' warning in UI and send merchant replenishment notification.",
        oversellingPreventionRule: "If atomic decrement returns 0 rows affected, reject the checkout transaction immediately with 'INSUFFICIENT_STOCK' error and prompt shopper to adjust cart.",
      },
      cartAndCheckout: {
        guestVsAccountPolicy: "Support guest checkout with customer_email + shipping_address. If customer creates an account post-purchase, attach previous guest orders via verified email.",
        shippingCalculation: "Tiered shipping calculation (e.g., standard flat rate vs express) or live carrier quote API based on destination postal code.",
        sessionCartPersistence: "Anonymous carts stored in localStorage with periodic sync to Supabase carts table; merged automatically upon customer login.",
      },
      orderStateMachine: {
        states: ["pending_payment", "processing", "shipped", "delivered", "canceled", "refunded", "disputed"],
        stateTransitions: [
          { from: "draft", to: "pending_payment", trigger: "CHECKOUT_INITIATED", stockAction: "RESERVE" },
          { from: "pending_payment", to: "processing", trigger: "PAYMENT_WEBHOOK_VERIFIED", stockAction: "CONFIRM_DECREMENT" },
          { from: "pending_payment", to: "canceled", trigger: "RESERVATION_EXPIRED_OR_FAILED", stockAction: "RESTORE" },
          { from: "processing", to: "shipped", trigger: "CARRIER_DISPATCHED", stockAction: "NONE" },
          { from: "shipped", to: "delivered", trigger: "CARRIER_DELIVERED", stockAction: "NONE" },
          { from: "processing", to: "refunded", trigger: "ADMIN_REFUND_ISSUED", stockAction: "RESTORE" },
          { from: "delivered", to: "refunded", trigger: "RETURN_RECEIVED_AND_RESTOCKED", stockAction: "RESTORE" },
          { from: "processing", to: "disputed", trigger: "PAYMENT_CHARGEBACK_OPENED", stockAction: "NONE" },
        ],
      },
      paymentReconciliation: {
        zeroTrustValidationRule: "Frontend redirect parameters (e.g. ?session_id=cs_test_xxx&success=true) are cosmetic only. Order state MUST remain pending_payment until provider webhook fires with cryptographic signature.",
        webhookSignatureVerification: "Stripe-Signature or Lemon Squeezy X-Signature header verified strictly using raw request body buffer and server-only endpoint secret.",
        idempotencyTableSql: "INSERT INTO processed_webhook_events (event_id, provider, event_type, processed_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (event_id) DO NOTHING RETURNING id;",
        failureAndDisputePolicy: "On charge.failed or payment_intent.payment_failed, update order status to payment_failed and send recovery email. On charge.dispute.created, freeze order fulfillment and notify merchant.",
      },
      fulfillmentAndOperations: {
        fulfillmentWorkflow: "Admin scans order items, marks fulfilled with carrier name + tracking number, triggering automated customer dispatch email.",
        staffRolePermissions: [
          { role: "store_admin", capabilities: ["manage_catalog", "manage_orders", "issue_refunds", "configure_shipping", "manage_staff"] },
          { role: "warehouse_fulfillment", capabilities: ["view_orders", "print_packing_slips", "update_tracking_numbers", "adjust_inventory"] },
          { role: "support_agent", capabilities: ["view_orders", "resend_receipts", "initiate_return_requests"] },
        ],
        transactionalNotifications: [
          "Order Confirmation & Receipt with itemized breakdown",
          "Order Shipped Notification with carrier tracking URL",
          "Out of Stock / Cancellation Alert with refund confirmation",
        ],
      },
    },
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

  "Business Website": {
    productType: "Business Website",
    label: "Business, Agency & Service Showcase Website",
    architecturalSummary:
      "Trust-first multi-page business presence featuring service/solution pages, portfolio/case studies, interactive quote/consultation booking stored in Supabase, client testimonials, and technical/local SEO.",
    researchFocusAreas: [
      "Core services offered, target client profile, and trust/authority signals",
      "Primary conversion mechanism (consultation booking, custom quote request, or contact inquiry)",
      "Portfolio, case studies, pricing packages, and FAQ structure",
      "Admin/CMS needs for updating services, testimonials, and managing incoming client leads",
    ],
    essentialQuestionDimensions: [
      "Services & Value Proposition: What are the main services, packages, or solutions your business offers to clients?",
      "Client Lead & Booking Flow: How should prospective clients take action (e.g., book a consultation slot, request a custom quote, or submit a contact inquiry)?",
      "Trust & Social Proof Sections: Which credibility elements should be featured (case studies/portfolio, client testimonials, team credentials, pricing tiers, or FAQs)?",
      "Lead Management & Updates: Do you want a protected admin dashboard to view incoming client inquiries and update site content?",
    ],
    typicalScreenPatterns: [
      "Home & Brand Authority Showcase (/)",
      "Services, Packages & Solutions Breakdown (/services)",
      "Case Studies / Portfolio & Client Testimonials (/work)",
      "Interactive Consultation Booking & Quote Request (/contact)",
      "Admin Lead Inbox & Content Manager (/admin/inquiries)",
    ],
    typicalDataEntities: [
      "service_inquiries / bookings (client_name, email, service_needed, budget, preferred_date, status)",
      "services / packages (title, summary, deliverables, price_range)",
      "case_studies / testimonials (client_name, outcome_metric, quote, featured)",
    ],
    uxAndConversionPriorities: [
      "Clear service positioning and visible CTA on every page (360px+ mobile to desktop)",
      "Validated inquiry/booking forms with instant confirmation feedback",
      "Fast page loads, structured JSON-LD schema, and OpenGraph metadata for SEO",
    ],
    securityAndBackendPriorities: [
      "Supabase RLS allowing public INSERT on service_inquiries while restricting SELECT/UPDATE to authenticated business admins",
      "Server-side Zod validation and spam/rate-limit protection on contact and booking forms",
    ],
    antiBloatGuardrails: [
      "Do not force customer login just to view services or submit a business inquiry.",
      "Keep architecture focused on credibility, service clarity, lead capture, and simple admin management.",
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
  const clean = productType.trim().toLowerCase();
  if (clean.includes("business") || clean.includes("agency") || clean.includes("corporate")) {
    return PRODUCT_TYPE_PROFILES["Business Website"];
  }
  const normalized = Object.keys(PRODUCT_TYPE_PROFILES).find(
    (k) => k.toLowerCase() === clean
  ) as ProductType | undefined;

  return normalized
    ? PRODUCT_TYPE_PROFILES[normalized]
    : PRODUCT_TYPE_PROFILES["Other"];
}
