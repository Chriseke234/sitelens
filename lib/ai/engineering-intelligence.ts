import { getGeminiApiKey } from "./client";
import {
  SoftwareBlueprint,
  EngineeringBlueprint,
  EngineeringDomain,
  EngineeringDomainItem,
  ApiContract,
  EntityRelationship,
  StateTransition,
  TechnicalRecommendation,
  TraceabilityItem,
} from "@/types";
import { evaluateEngineeringReadiness } from "./engineering-readiness";

/**
 * Synthesizes a comprehensive 15-domain Engineering Blueprint from the project's Software Blueprint.
 */
export async function generateEngineeringBlueprint(
  projectId: string,
  projectName: string,
  productType: string,
  blueprint: SoftwareBlueprint
): Promise<EngineeringBlueprint> {
  const apiKey = getGeminiApiKey();

  // Create deterministic fallback
  const fallback = createDeterministicEngineeringBlueprint(
    projectId,
    projectName,
    productType,
    blueprint
  );

  if (!apiKey) {
    const readiness = evaluateEngineeringReadiness(fallback, fallback.recommendations);
    fallback.readiness = readiness;
    return fallback;
  }

  const prompt = `
System Instruction:
You are the Principal Systems & Engineering Architect for Aigenstra.
Your task is to transform the provided Software Blueprint into an actionable, structured Engineering Blueprint across all 15 technical domains.

CRITICAL PRODUCT RULES:
1. AIGENSTRA IS A PROMPT BUILDER AND TOUR GUIDE, NOT AN APP BUILDER.
2. Progressive Disclosure: Provide a simple, beginner-friendly explanation ("simpleExplanation") AND a precise technical specification ("technicalSpecification") for every domain requirement.
3. Proportional Engineering: Recommend the simplest appropriate architecture for this product scale. Do NOT overengineer.
4. Technical Recommendations: Include tradeoffs, downsides, and alternatives for key stack decisions (Database, Auth, etc.).
5. Traceability: Map each core product feature to its screens, APIs, database entities, and test cases.

Project: ${projectName} (${productType})
Summary: ${blueprint.overview?.summary}
Target Outcome: ${blueprint.overview?.targetOutcome}
Core Roles: ${blueprint.usersRoles?.map((r) => r.roleName).join(", ")}
Core Features: ${blueprint.features?.map((f) => f.title).join(", ")}
Core Screens: ${blueprint.screens?.map((s) => `${s.screenName} (${s.routePath})`).join(", ")}
Data Entities: ${blueprint.dataEntities?.map((e) => e.entityName).join(", ")}

Return a valid JSON object matching the EngineeringBlueprint schema:
{
  "highLevelFlow": {
    "userInterface": "Web & Mobile responsive interface built with modern component architecture",
    "applicationLogic": "Server-side business rules, request validation, and access control",
    "databaseLayer": "Relational PostgreSQL database with strict Row Level Security (RLS)",
    "externalServices": "Third-party authentication, notifications, and analytics"
  },
  "domains": {
    "PRODUCT_ARCHITECTURE": [
      {
        "id": "prod_arch_1",
        "domain": "PRODUCT_ARCHITECTURE",
        "title": "Module Boundary & Subsystem Responsibilities",
        "simpleExplanation": "The application is split into user workspace, core creation tools, and admin management.",
        "whyItMatters": "Keeps code organized and prevents changes in one feature from breaking another.",
        "technicalSpecification": "Modular Next.js route groups: (dashboard), (auth), (public), and (api).",
        "affectedFeatures": ["Main Dashboard"],
        "affectedScreens": ["/dashboard"],
        "affectedEntities": ["UserProfile"],
        "source": "SYSTEM_RECOMMENDED",
        "status": "CONFIRMED",
        "priority": "CRITICAL"
      }
    ],
    "UX_ARCHITECTURE": [
      {
        "id": "ux_1",
        "domain": "UX_ARCHITECTURE",
        "title": "Flow State Transitions & Feedback Loops",
        "simpleExplanation": "Every user action shows immediate confirmation, clear error toasts, and preserved form drafts.",
        "whyItMatters": "Prevents user frustration and lost work if a network glitch occurs.",
        "technicalSpecification": "Optimistic UI mutations with React SWR / React Query cache rollback.",
        "affectedFeatures": ["Core Resource Creation"],
        "affectedScreens": ["/dashboard/items/new"],
        "affectedEntities": ["CoreResource"],
        "source": "SYSTEM_RECOMMENDED",
        "status": "CONFIRMED",
        "priority": "HIGH"
      }
    ],
    "UI_ARCHITECTURE": [
      {
        "id": "ui_1",
        "domain": "UI_ARCHITECTURE",
        "title": "Design System Tokens & Accessible Components",
        "simpleExplanation": "Consistent button styles, clean spacing, and readable high-contrast typography.",
        "whyItMatters": "Builds trust and ensures the product looks professional across all screens.",
        "technicalSpecification": "Tailwind CSS design tokens paired with Radix UI accessible primitives.",
        "affectedFeatures": ["All"],
        "affectedScreens": ["All"],
        "affectedEntities": [],
        "source": "SYSTEM_RECOMMENDED",
        "status": "CONFIRMED",
        "priority": "HIGH"
      }
    ],
    "FRONTEND": [
      {
        "id": "fe_1",
        "domain": "FRONTEND",
        "title": "Server-Rendered Shell with Reactive Client Interactions",
        "simpleExplanation": "Pages load fast using server rendering, while forms and buttons respond instantly.",
        "whyItMatters": "Ensures instant initial page load speeds without heavy loading spinners.",
        "technicalSpecification": "Next.js App Router React Server Components (RSC) with Client Component leaves.",
        "affectedFeatures": ["Dashboard Overview"],
        "affectedScreens": ["/dashboard"],
        "affectedEntities": ["UserProfile"],
        "source": "SYSTEM_RECOMMENDED",
        "status": "CONFIRMED",
        "priority": "CRITICAL"
      }
    ],
    "BACKEND": [
      {
        "id": "be_1",
        "domain": "BACKEND",
        "title": "Business Logic Encapsulation & Payload Validation",
        "simpleExplanation": "All actions are checked and verified on the server before anything is written to the database.",
        "whyItMatters": "Prevents bad data, protects against tampering, and ensures business rules are enforced.",
        "technicalSpecification": "Server Actions and API route handlers with Zod schema validation.",
        "affectedFeatures": ["Resource Management"],
        "affectedScreens": ["/dashboard"],
        "affectedEntities": ["CoreResource"],
        "source": "SYSTEM_RECOMMENDED",
        "status": "CONFIRMED",
        "priority": "CRITICAL"
      }
    ],
    "API_CONTRACTS": [
      {
        "id": "api_dom_1",
        "domain": "API_CONTRACTS",
        "title": "RESTful Endpoint Interface & Status Standards",
        "simpleExplanation": "Clear contracts for how the frontend talks to the backend using standard HTTP codes.",
        "whyItMatters": "Allows clean debugging and error handling across both client and server.",
        "technicalSpecification": "JSON payloads, standard status codes (200, 201, 400, 401, 403, 404, 500).",
        "affectedFeatures": ["Resource CRUD"],
        "affectedScreens": ["/dashboard"],
        "affectedEntities": ["CoreResource"],
        "source": "SYSTEM_RECOMMENDED",
        "status": "CONFIRMED",
        "priority": "CRITICAL"
      }
    ],
    "DATABASE": [
      {
        "id": "db_dom_1",
        "domain": "DATABASE",
        "title": "Normalized Relational Data Modeling",
        "simpleExplanation": "Stores accounts, resources, and settings in clean tables connected by relationships.",
        "whyItMatters": "Prevents data duplication and ensures records stay accurate over time.",
        "technicalSpecification": "PostgreSQL schema with foreign key constraints, NOT NULL checks, and indexes.",
        "affectedFeatures": ["All Data"],
        "affectedScreens": ["All"],
        "affectedEntities": ["UserProfile", "CoreResource"],
        "source": "SYSTEM_RECOMMENDED",
        "status": "CONFIRMED",
        "priority": "CRITICAL"
      }
    ],
    "AUTHENTICATION": [
      {
        "id": "auth_dom_1",
        "domain": "AUTHENTICATION",
        "title": "Secure Session Management & Credentials",
        "simpleExplanation": "Users securely sign in with email/password and stay logged in safely.",
        "whyItMatters": "Protects private account information from unauthorized access.",
        "technicalSpecification": "Supabase Auth with secure HTTP-only cookie session handling via @supabase/ssr.",
        "affectedFeatures": ["Authentication"],
        "affectedScreens": ["/login", "/signup"],
        "affectedEntities": ["UserProfile"],
        "source": "SYSTEM_RECOMMENDED",
        "status": "CONFIRMED",
        "priority": "CRITICAL"
      }
    ],
    "AUTHORIZATION": [
      {
        "id": "authz_dom_1",
        "domain": "AUTHORIZATION",
        "title": "Ownership Isolation & Row-Level Security (RLS)",
        "simpleExplanation": "Each user can only view, edit, or delete items that belong to them.",
        "whyItMatters": "Guarantees that User A can never see or modify User B's private data.",
        "technicalSpecification": "PostgreSQL Row Level Security (RLS) policies enforcing auth.uid() = user_id.",
        "affectedFeatures": ["Data Isolation"],
        "affectedScreens": ["All"],
        "affectedEntities": ["CoreResource"],
        "source": "SYSTEM_RECOMMENDED",
        "status": "CONFIRMED",
        "priority": "CRITICAL"
      }
    ],
    "SECURITY": [
      {
        "id": "sec_dom_1",
        "domain": "SECURITY",
        "title": "Input Sanitization & Injection Defense",
        "simpleExplanation": "Blocks malicious script injection and validates all user input before processing.",
        "whyItMatters": "Prevents security vulnerabilities like SQL injection and Cross-Site Scripting (XSS).",
        "technicalSpecification": "Zod payload parsing and parameterized PostgreSQL queries via Supabase SDK.",
        "affectedFeatures": ["All Forms"],
        "affectedScreens": ["All"],
        "affectedEntities": ["All"],
        "source": "SYSTEM_RECOMMENDED",
        "status": "CONFIRMED",
        "priority": "CRITICAL"
      }
    ],
    "PERFORMANCE": [
      {
        "id": "perf_dom_1",
        "domain": "PERFORMANCE",
        "title": "Database Query Indexing & Minimal Client Bundles",
        "simpleExplanation": "Fast page loading and instant data retrieval even as the database grows.",
        "whyItMatters": "Keeps the app responsive and avoids laggy user experiences.",
        "technicalSpecification": "B-tree indexes on foreign keys (user_id) and created_at timestamps.",
        "affectedFeatures": ["Item Listing"],
        "affectedScreens": ["/dashboard"],
        "affectedEntities": ["CoreResource"],
        "source": "SYSTEM_RECOMMENDED",
        "status": "CONFIRMED",
        "priority": "MEDIUM"
      }
    ],
    "ACCESSIBILITY": [
      {
        "id": "a11y_dom_1",
        "domain": "ACCESSIBILITY",
        "title": "Keyboard Navigation & Semantic ARIA Markup",
        "simpleExplanation": "The entire app is navigable using keyboard controls and readable by assistive devices.",
        "whyItMatters": "Ensures the application is usable by all individuals and meets legal standards.",
        "technicalSpecification": "WCAG 2.1 AA compliance with visible focus rings and aria-label attributes.",
        "affectedFeatures": ["All UI"],
        "affectedScreens": ["All"],
        "affectedEntities": [],
        "source": "SYSTEM_RECOMMENDED",
        "status": "CONFIRMED",
        "priority": "HIGH"
      }
    ],
    "TESTING": [
      {
        "id": "test_dom_1",
        "domain": "TESTING",
        "title": "Critical Path & Authorization Verification",
        "simpleExplanation": "Automated tests to verify that happy paths work and non-owners are blocked.",
        "whyItMatters": "Catches regressions before they reach production.",
        "technicalSpecification": "Integration tests verifying RLS policies and validation boundary cases.",
        "affectedFeatures": ["Core Workflow"],
        "affectedScreens": ["/dashboard"],
        "affectedEntities": ["CoreResource"],
        "source": "SYSTEM_RECOMMENDED",
        "status": "CONFIRMED",
        "priority": "HIGH"
      }
    ],
    "DEPLOYMENT": [
      {
        "id": "dep_dom_1",
        "domain": "DEPLOYMENT",
        "title": "Environment Variable Configuration & Zero-Downtime Builds",
        "simpleExplanation": "Secure configuration keys kept separate from code for safe production deployments.",
        "whyItMatters": "Prevents secret leaks and ensures reliable production deployments.",
        "technicalSpecification": "Vercel / Next.js environment configuration with public and private key isolation.",
        "affectedFeatures": ["Deployment"],
        "affectedScreens": ["All"],
        "affectedEntities": [],
        "source": "SYSTEM_RECOMMENDED",
        "status": "CONFIRMED",
        "priority": "CRITICAL"
      }
    ],
    "SEO": [
      {
        "id": "seo_dom_1",
        "domain": "SEO",
        "title": "Dynamic Metadata & OpenGraph Social Previews",
        "simpleExplanation": "Public landing pages include title tags and social preview images.",
        "whyItMatters": "Ensures links look great when shared on social media and rank in search engines.",
        "technicalSpecification": "Next.js generateMetadata export with OpenGraph and Twitter cards.",
        "affectedFeatures": ["Landing Page"],
        "affectedScreens": ["/"],
        "affectedEntities": [],
        "source": "SYSTEM_RECOMMENDED",
        "status": "CONFIRMED",
        "priority": "MEDIUM"
      }
    ]
  },
  "apiContracts": [
    {
      "id": "api_1",
      "endpoint": "/api/resources",
      "method": "GET",
      "purpose": "Retrieves the authenticated user's list of resources",
      "inputPayload": "None (uses cookie session token)",
      "outputPayload": "{ items: CoreResource[] }",
      "errorCodes": [
        { "code": 401, "scenario": "Unauthenticated user", "resolution": "Redirect to /login" },
        { "code": 500, "scenario": "Database error", "resolution": "Display retry banner" }
      ],
      "rateLimitPolicy": "100 requests per minute per IP",
      "authRequired": true,
      "rolesAllowed": ["Primary User", "Platform Administrator"]
    },
    {
      "id": "api_2",
      "endpoint": "/api/resources",
      "method": "POST",
      "purpose": "Creates a new resource for the authenticated user",
      "inputPayload": "{ title: string, metadata?: object }",
      "outputPayload": "{ item: CoreResource, message: string }",
      "errorCodes": [
        { "code": 400, "scenario": "Validation error (missing title)", "resolution": "Highlight field inline" },
        { "code": 401, "scenario": "Unauthenticated", "resolution": "Redirect to login" }
      ],
      "rateLimitPolicy": "20 creates per minute per user",
      "authRequired": true,
      "rolesAllowed": ["Primary User"]
    }
  ],
  "entityRelationships": [
    {
      "id": "rel_1",
      "fromEntity": "UserProfile",
      "toEntity": "CoreResource",
      "relationType": "ONE_TO_MANY",
      "foreignKey": "CoreResource.user_id -> UserProfile.id",
      "onDelete": "CASCADE",
      "simpleMeaning": "One user can create and own multiple resources. Deleting a user deletes their resources."
    }
  ],
  "stateTransitions": [
    {
      "id": "st_1",
      "entity": "CoreResource",
      "fromState": "draft",
      "toState": "active",
      "allowedRoles": ["Primary User"],
      "trigger": "User publishes item",
      "sideEffects": ["Item becomes visible on public/client view", "Notification sent if configured"],
      "preventedIf": "Required fields are incomplete"
    },
    {
      "id": "st_2",
      "entity": "CoreResource",
      "fromState": "active",
      "toState": "archived",
      "allowedRoles": ["Primary User", "Platform Administrator"],
      "trigger": "User archives item",
      "sideEffects": ["Item hidden from active queries but preserved in history"]
    }
  ],
  "recommendations": [
    {
      "id": "rec_db",
      "title": "Database Paradigm Recommendation",
      "area": "DATABASE",
      "requirement": "Reliable data storage with clear relationships between users, items, and settings.",
      "recommendedOption": "Relational PostgreSQL (via Supabase)",
      "whyRecommended": "Your product has structured entities (users, resources) with foreign key relationships and strict ownership rules.",
      "tradeoffs": "Requires defined schema migrations, but guarantees data integrity and enables Row-Level Security.",
      "alternatives": [
        {
          "name": "Document Database (MongoDB)",
          "description": "Flexible JSON document store",
          "pros": "Schemaless flexibility during rapid prototyping",
          "cons": "No built-in Row Level Security and weaker relational consistency"
        }
      ],
      "status": "RECOMMENDED"
    },
    {
      "id": "rec_auth",
      "title": "Authentication Strategy Recommendation",
      "area": "AUTH",
      "requirement": "Secure user registration, persistent login sessions, and identity protection.",
      "recommendedOption": "Email & Password with Secure Cookie Sessions",
      "whyRecommended": "Most familiar and frictionless flow for target users, with zero external third-party API dependencies.",
      "tradeoffs": "Requires password reset email delivery handling.",
      "alternatives": [
        {
          "name": "Social OAuth (Google / GitHub)",
          "description": "One-click login with third-party providers",
          "pros": "Users don't have to remember another password",
          "cons": "Requires developer console setup and provider API credentials"
        }
      ],
      "status": "RECOMMENDED"
    }
  ],
  "traceabilityMatrix": [
    {
      "featureId": "feat_core",
      "featureTitle": "Core Resource Management",
      "screens": ["/dashboard", "/dashboard/items/new"],
      "workflows": ["Standard Item Lifecycle"],
      "dataEntities": ["CoreResource", "UserProfile"],
      "apiEndpoints": ["/api/resources"],
      "backendServices": ["ResourceService.create", "ResourceService.list"],
      "authorizationRules": ["auth.uid() = user_id (RLS)"],
      "testCases": ["Owner can create & edit", "Non-owner read attempt blocked with 403"]
    }
  ]
}

DO NOT include markdown code blocks (such as \`\`\`json) in your response. Output raw JSON only.
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn("Gemini API error during engineering synthesis, using deterministic fallback");
      return fallback;
    }

    const data = await response.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) {
      return fallback;
    }

    const parsed = JSON.parse(rawContent);

    const generatedBlueprint: EngineeringBlueprint = {
      project_id: projectId,
      highLevelFlow: parsed.highLevelFlow || fallback.highLevelFlow,
      domains: parsed.domains || fallback.domains,
      apiContracts: parsed.apiContracts || fallback.apiContracts,
      entityRelationships: parsed.entityRelationships || fallback.entityRelationships,
      stateTransitions: parsed.stateTransitions || fallback.stateTransitions,
      recommendations: parsed.recommendations || fallback.recommendations,
      traceabilityMatrix: parsed.traceabilityMatrix || fallback.traceabilityMatrix,
      readiness: fallback.readiness,
      updated_at: new Date().toISOString(),
    };

    const readiness = evaluateEngineeringReadiness(
      generatedBlueprint,
      generatedBlueprint.recommendations
    );
    generatedBlueprint.readiness = readiness;

    return generatedBlueprint;
  } catch (err) {
    console.error("Failed to generate engineering blueprint via AI:", err);
    return fallback;
  }
}

/**
 * Deterministic engineering blueprint fallback.
 */
function createDeterministicEngineeringBlueprint(
  projectId: string,
  projectName: string,
  productType: string,
  blueprint: SoftwareBlueprint
): EngineeringBlueprint {
  const primaryRole = blueprint.usersRoles?.[0]?.roleName || "Primary User";
  const entityNames = blueprint.dataEntities?.map((e) => e.entityName) || ["UserProfile", "CoreResource"];
  const screenPaths = blueprint.screens?.map((s) => s.routePath) || ["/dashboard"];

  const domains: Record<EngineeringDomain, EngineeringDomainItem[]> = {
    PRODUCT_ARCHITECTURE: [
      {
        id: "prod_1",
        domain: "PRODUCT_ARCHITECTURE",
        title: "Subsystem Partitioning & Route Grouping",
        simpleExplanation: "The product separates public visitor pages, protected user workspaces, and administrative tools.",
        whyItMatters: "Prevents code clutter and ensures private data routes are strictly isolated.",
        technicalSpecification: "Next.js App Router route groups: /(auth), /(dashboard), and /api routes.",
        affectedFeatures: ["Dashboard"],
        affectedScreens: screenPaths,
        affectedEntities: entityNames,
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
        priority: "CRITICAL",
      },
    ],
    UX_ARCHITECTURE: [
      {
        id: "ux_1",
        domain: "UX_ARCHITECTURE",
        title: "Feedback States & Graceful Error Recovery",
        simpleExplanation: "Every user interaction gives clear feedback with toast notifications, draft preservation, and error guidance.",
        whyItMatters: "Prevents data loss and builds user confidence.",
        technicalSpecification: "React state management with optimistic UI updates and Sonner toast notifications.",
        affectedFeatures: ["Creation Studio"],
        affectedScreens: ["/dashboard/items/new"],
        affectedEntities: ["CoreResource"],
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
        priority: "HIGH",
      },
    ],
    UI_ARCHITECTURE: [
      {
        id: "ui_1",
        domain: "UI_ARCHITECTURE",
        title: "Consistent Design System & Component Hierarchy",
        simpleExplanation: "A cohesive visual system with standard buttons, input fields, cards, and navigation bars.",
        whyItMatters: "Gives the product a polished, professional look and speeds up future UI additions.",
        technicalSpecification: "Tailwind CSS utility classes and Radix UI accessible headless primitives.",
        affectedFeatures: ["All UI"],
        affectedScreens: screenPaths,
        affectedEntities: [],
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
        priority: "HIGH",
      },
    ],
    FRONTEND: [
      {
        id: "fe_1",
        domain: "FRONTEND",
        title: "Server Components & Dynamic Client Islands",
        simpleExplanation: "Pages load quickly using server rendering, while interactive buttons and forms respond instantly.",
        whyItMatters: "Delivers maximum speed without unnecessary loading spinners.",
        technicalSpecification: "React 19 Server Components for data fetching with client component forms.",
        affectedFeatures: ["Dashboard"],
        affectedScreens: ["/dashboard"],
        affectedEntities: ["UserProfile"],
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
        priority: "CRITICAL",
      },
    ],
    BACKEND: [
      {
        id: "be_1",
        domain: "BACKEND",
        title: "Business Logic Encapsulation & Input Sanitization",
        simpleExplanation: "All form inputs are validated and business rules are verified on the server before database persistence.",
        whyItMatters: "Guarantees system integrity and blocks malformed data.",
        technicalSpecification: "Next.js Server Actions and REST handlers using Zod validation schemas.",
        affectedFeatures: ["Resource CRUD"],
        affectedScreens: ["/dashboard"],
        affectedEntities: ["CoreResource"],
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
        priority: "CRITICAL",
      },
    ],
    API_CONTRACTS: [
      {
        id: "api_1",
        domain: "API_CONTRACTS",
        title: "Standardized REST API Interface",
        simpleExplanation: "Structured endpoints for creating, reading, updating, and deleting items.",
        whyItMatters: "Allows predictable communication between the interface and database.",
        technicalSpecification: "REST JSON API with standard status codes and structured error payloads.",
        affectedFeatures: ["Resource CRUD"],
        affectedScreens: ["/dashboard"],
        affectedEntities: ["CoreResource"],
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
        priority: "CRITICAL",
      },
    ],
    DATABASE: [
      {
        id: "db_1",
        domain: "DATABASE",
        title: "Relational Schema with Strict Foreign Keys",
        simpleExplanation: "Tables for users, items, and settings connected by clear relationships.",
        whyItMatters: "Prevents orphan records and guarantees data accuracy.",
        technicalSpecification: "PostgreSQL tables with UUID primary keys and ON DELETE CASCADE constraints.",
        affectedFeatures: ["All Data"],
        affectedScreens: screenPaths,
        affectedEntities: entityNames,
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
        priority: "CRITICAL",
      },
    ],
    AUTHENTICATION: [
      {
        id: "auth_1",
        domain: "AUTHENTICATION",
        title: "Secure Session Management & Credentials",
        simpleExplanation: "Users sign up and log in securely with email and password.",
        whyItMatters: "Protects user accounts and provides persistent login across visits.",
        technicalSpecification: "Supabase Auth with secure HTTP-only cookie session handling.",
        affectedFeatures: ["User Accounts"],
        affectedScreens: ["/login", "/signup"],
        affectedEntities: ["UserProfile"],
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
        priority: "CRITICAL",
      },
    ],
    AUTHORIZATION: [
      {
        id: "authz_1",
        domain: "AUTHORIZATION",
        title: "Row-Level Security (RLS) Isolation",
        simpleExplanation: "Every user can only view, edit, or delete their own data.",
        whyItMatters: "Ensures multi-tenant data privacy at the database engine level.",
        technicalSpecification: "PostgreSQL RLS policies: auth.uid() = user_id for all operations.",
        affectedFeatures: ["Data Privacy"],
        affectedScreens: screenPaths,
        affectedEntities: ["CoreResource"],
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
        priority: "CRITICAL",
      },
    ],
    SECURITY: [
      {
        id: "sec_1",
        domain: "SECURITY",
        title: "Input Validation & Defense in Depth",
        simpleExplanation: "Validates all payloads and keeps API keys securely hidden on the server.",
        whyItMatters: "Blocks injection attacks and prevents secret leaks.",
        technicalSpecification: "Zod runtime validation and server-only environment variable isolation.",
        affectedFeatures: ["All Forms"],
        affectedScreens: screenPaths,
        affectedEntities: entityNames,
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
        priority: "CRITICAL",
      },
    ],
    PERFORMANCE: [
      {
        id: "perf_1",
        domain: "PERFORMANCE",
        title: "Database Indexing & Optimized Queries",
        simpleExplanation: "Fast lookups and sub-second page transitions as data grows.",
        whyItMatters: "Maintains snappy performance under load.",
        technicalSpecification: "B-Tree indexes on user_id foreign keys and created_at timestamps.",
        affectedFeatures: ["Item Listings"],
        affectedScreens: ["/dashboard"],
        affectedEntities: ["CoreResource"],
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
        priority: "MEDIUM",
      },
    ],
    ACCESSIBILITY: [
      {
        id: "a11y_1",
        domain: "ACCESSIBILITY",
        title: "WCAG 2.1 AA Compliance & Keyboard Navigation",
        simpleExplanation: "High-contrast colors, full keyboard focus support, and screen reader labels.",
        whyItMatters: "Ensures the product is accessible to all users.",
        technicalSpecification: "Radix UI accessibility primitives and standard HTML landmark tags.",
        affectedFeatures: ["All UI"],
        affectedScreens: screenPaths,
        affectedEntities: [],
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
        priority: "HIGH",
      },
    ],
    TESTING: [
      {
        id: "test_1",
        domain: "TESTING",
        title: "Critical Path Integration & Security Tests",
        simpleExplanation: "Automated checks verifying that creation workflows work and unauthorized users are blocked.",
        whyItMatters: "Guarantees reliable code quality before deployments.",
        technicalSpecification: "Unit and integration tests for API endpoints and RLS security policies.",
        affectedFeatures: ["Core Flow"],
        affectedScreens: ["/dashboard"],
        affectedEntities: ["CoreResource"],
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
        priority: "HIGH",
      },
    ],
    DEPLOYMENT: [
      {
        id: "dep_1",
        domain: "DEPLOYMENT",
        title: "Environment Variable Management & Continuous Deployment",
        simpleExplanation: "Production deployment with secure configuration keys.",
        whyItMatters: "Ensures seamless updates without downtime or exposed secrets.",
        technicalSpecification: "Next.js production build configuration with environment isolation.",
        affectedFeatures: ["Deployment"],
        affectedScreens: screenPaths,
        affectedEntities: [],
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
        priority: "CRITICAL",
      },
    ],
    SEO: [
      {
        id: "seo_1",
        domain: "SEO",
        title: "Dynamic Metadata & OpenGraph Social Sharing",
        simpleExplanation: "Public pages display optimized titles and social preview cards.",
        whyItMatters: "Improves discoverability and social link appearance.",
        technicalSpecification: "Next.js generateMetadata with title, description, and OpenGraph tags.",
        affectedFeatures: ["Public Pages"],
        affectedScreens: ["/"],
        affectedEntities: [],
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
        priority: "MEDIUM",
      },
    ],
  };

  const apiContracts: ApiContract[] = [
    {
      id: "api_get_resources",
      endpoint: "/api/resources",
      method: "GET",
      purpose: "Fetches all active resources for the logged-in user",
      inputPayload: "None (authenticated cookie session)",
      outputPayload: "{ items: CoreResource[] }",
      errorCodes: [
        { code: 401, scenario: "Unauthenticated session", resolution: "Redirect user to login" },
        { code: 500, scenario: "Database fetch failure", resolution: "Show retry message" },
      ],
      rateLimitPolicy: "60 requests per minute per user",
      authRequired: true,
      rolesAllowed: [primaryRole, "Platform Administrator"],
    },
    {
      id: "api_post_resource",
      endpoint: "/api/resources",
      method: "POST",
      purpose: "Creates a new resource record",
      inputPayload: "{ title: string, metadata?: object }",
      outputPayload: "{ item: CoreResource, message: string }",
      errorCodes: [
        { code: 400, scenario: "Invalid input payload", resolution: "Highlight invalid field" },
        { code: 401, scenario: "Unauthenticated", resolution: "Redirect to login" },
      ],
      rateLimitPolicy: "20 creates per minute per user",
      authRequired: true,
      rolesAllowed: [primaryRole],
    },
  ];

  const entityRelationships: EntityRelationship[] = [
    {
      id: "rel_user_resource",
      fromEntity: "UserProfile",
      toEntity: "CoreResource",
      relationType: "ONE_TO_MANY",
      foreignKey: "CoreResource.user_id -> UserProfile.id",
      onDelete: "CASCADE",
      simpleMeaning: "Each user can create multiple resources. Deleting an account deletes its resources.",
    },
  ];

  const stateTransitions: StateTransition[] = [
    {
      id: "trans_draft_active",
      entity: "CoreResource",
      fromState: "draft",
      toState: "active",
      allowedRoles: [primaryRole],
      trigger: "User saves and activates resource",
      sideEffects: ["Item becomes accessible on dashboard", "Status badge changes to Active"],
      preventedIf: "Required resource name is blank",
    },
    {
      id: "trans_active_archived",
      entity: "CoreResource",
      fromState: "active",
      toState: "archived",
      allowedRoles: [primaryRole, "Platform Administrator"],
      trigger: "User clicks Archive item",
      sideEffects: ["Item removed from active listing but preserved in database history"],
    },
  ];

  const recommendations: TechnicalRecommendation[] = [
    {
      id: "rec_db",
      title: "Primary Database Recommendation",
      area: "DATABASE",
      requirement: "Structured storage with reliable user ownership and data integrity.",
      recommendedOption: "Relational PostgreSQL (via Supabase)",
      whyRecommended: `Your product (${projectName}) has structured relationships between ${entityNames.join(", ")} that require Row Level Security.`,
      tradeoffs: "Requires relational schema migrations, but guarantees data consistency and security.",
      alternatives: [
        {
          name: "Document Database (MongoDB)",
          description: "Flexible JSON document store",
          pros: "Fast initial schema flexibility",
          cons: "No native Row-Level Security policies; requires manual authorization logic",
        },
      ],
      status: "RECOMMENDED",
    },
    {
      id: "rec_auth",
      title: "Authentication Strategy Recommendation",
      area: "AUTH",
      requirement: "User registration, password recovery, and secure sessions.",
      recommendedOption: "Email & Password with Secure Cookie Sessions",
      whyRecommended: "Simple, universally accessible, and avoids third-party API dependencies during initial launch.",
      tradeoffs: "Requires password reset email flow.",
      alternatives: [
        {
          name: "Social Login (Google / GitHub)",
          description: "One-click OAuth authentication",
          pros: "Faster signup for users",
          cons: "Requires developer keys and OAuth credentials",
        },
      ],
      status: "RECOMMENDED",
    },
  ];

  const traceabilityMatrix: TraceabilityItem[] = [
    {
      featureId: "feat_mgmt",
      featureTitle: "Core Resource Management",
      screens: ["/dashboard", "/dashboard/items/new"],
      workflows: ["Standard Item Lifecycle"],
      dataEntities: ["CoreResource", "UserProfile"],
      apiEndpoints: ["/api/resources"],
      backendServices: ["ResourceService.create", "ResourceService.list"],
      authorizationRules: ["auth.uid() = user_id (RLS)"],
      testCases: ["Owner can create & edit", "Non-owner read attempt blocked with 403"],
    },
  ];

  const blueprintResult: EngineeringBlueprint = {
    project_id: projectId,
    highLevelFlow: {
      userInterface: "Web & Mobile responsive interface built with modern component architecture",
      applicationLogic: "Server-side business rules, request validation, and access control",
      databaseLayer: "Relational PostgreSQL database with strict Row Level Security (RLS)",
      externalServices: "Third-party authentication, email delivery, and storage integrations",
    },
    domains,
    apiContracts,
    entityRelationships,
    stateTransitions,
    recommendations,
    traceabilityMatrix,
    readiness: {
      status: "READY",
      domainReadiness: {
        PRODUCT_ARCHITECTURE: "READY",
        UX_ARCHITECTURE: "READY",
        UI_ARCHITECTURE: "READY",
        FRONTEND: "READY",
        BACKEND: "READY",
        API_CONTRACTS: "READY",
        DATABASE: "READY",
        AUTHENTICATION: "READY",
        AUTHORIZATION: "READY",
        SECURITY: "READY",
        PERFORMANCE: "READY",
        ACCESSIBILITY: "READY",
        TESTING: "READY",
        DEPLOYMENT: "READY",
        SEO: "READY",
      },
      blockers: [],
      unresolvedDecisionsCount: 2,
      changeImpacts: [],
    },
    updated_at: new Date().toISOString(),
  };

  blueprintResult.readiness = evaluateEngineeringReadiness(blueprintResult, recommendations);
  return blueprintResult;
}
