import { getGeminiApiKey } from "./client";
import { executeResilientAICompletion } from "./resilient-client";
import {
  SoftwareBlueprint,
  DiscoveryQnA,
  ProductSummary,
  IdeaUnderstandingRecord,
} from "@/types";
import { evaluateBlueprintHealth } from "./blueprint-health";

/**
 * Generates or synthesizes a comprehensive 13-section Software Blueprint from project details,
 * discovery answers, and synthesized product understandings.
 */
export async function generateSoftwareBlueprint(
  projectId: string,
  projectName: string,
  productType: string,
  rawIdea: string,
  summary?: ProductSummary | null,
  qnas?: DiscoveryQnA[],
  understanding?: IdeaUnderstandingRecord | null
): Promise<SoftwareBlueprint> {
  const apiKey = getGeminiApiKey();

  // Create robust fallback blueprint
  const fallbackBlueprint: SoftwareBlueprint = createDeterministicBlueprint(
    projectId,
    projectName,
    productType,
    rawIdea,
    summary,
    understanding
  );

  if (!apiKey) {
    const health = evaluateBlueprintHealth(fallbackBlueprint);
    fallbackBlueprint.healthScore = health.score;
    fallbackBlueprint.healthWarnings = health.issues.map((i) => i.message);
    return fallbackBlueprint;
  }

  const qnaContext = (qnas || [])
    .filter((q) => q.answer && q.answer.trim().length > 0)
    .map((q) => `Q: ${q.question}\nA: ${q.answer}`)
    .join("\n\n");

  const prompt = `
System Instruction:
You are the Principal Software Product Architect for Aigenstra.
Your task is to transform the user's product concept and discovery answers into a comprehensive, highly structured 13-section Software Blueprint.

CRITICAL ARCHITECTURAL RULES:
1. AIGENSTRA IS A PROMPT BUILDER AND ARCHITECTURE GUIDE, NOT AN APP BUILDER.
2. Progressive disclosure: Every item MUST have plain-English simple descriptions (accessible to non-technical founders) AND technical implications for coding agents.
3. Item Provenance: Tag every item with 'source' ('USER_CONFIRMED' | 'USER_DESCRIBED' | 'SYSTEM_INFERRED' | 'SYSTEM_RECOMMENDED' | 'ASSUMED') and 'status' ('CONFIRMED' | 'PROPOSED' | 'ASSUMED' | 'NEEDS_DECISION').
4. The blueprint MUST cover all 13 distinct sections in full detail.

Project Details:
- Project Name: ${projectName}
- Product Type: ${productType}
- Raw User Concept: ${rawIdea}
- Known Target Users: ${summary?.whoFor?.join(", ") || understanding?.targetUsers?.join(", ") || "End Customers, Administrators"}
- Core Capabilities: ${summary?.coreCapabilities?.join(", ") || understanding?.detectedFeatures?.join(", ") || "User authentication, core workflows"}
${qnaContext ? `\nUser Discovery Answers:\n${qnaContext}` : ""}

Return a valid JSON object matching the SoftwareBlueprint schema:
{
  "overview": {
    "name": "${projectName.replace(/"/g, '\\"')}",
    "summary": "Plain English summary of what the product does",
    "problemStatement": "Specific pain point being solved",
    "valueProposition": "Core value delivered to users",
    "productType": "${productType}",
    "targetOutcome": "Measurable success outcome",
    "source": "USER_DESCRIBED",
    "status": "CONFIRMED"
  },
  "usersRoles": [
    {
      "id": "role_1",
      "roleName": "Primary User Role Name",
      "simpleDescription": "What this person does in simple words",
      "technicalPermissions": ["read:profile", "create:records"],
      "userGoals": ["Goal 1", "Goal 2"],
      "restrictions": ["Cannot access admin panel"],
      "relatedRoles": ["Administrator"],
      "source": "USER_DESCRIBED",
      "status": "CONFIRMED"
    },
    {
      "id": "role_2",
      "roleName": "Platform Administrator",
      "simpleDescription": "Manages system settings, users, and overall health",
      "technicalPermissions": ["admin:all", "manage:users"],
      "userGoals": ["Ensure smooth operations and moderate content"],
      "restrictions": [],
      "relatedRoles": ["Primary User"],
      "source": "SYSTEM_RECOMMENDED",
      "status": "PROPOSED"
    }
  ],
  "userJourneys": [
    {
      "id": "journey_1",
      "title": "First Time Onboarding & Core Action",
      "role": "Primary User Role",
      "happyPathSteps": [
        {
          "stepNumber": 1,
          "title": "Account Creation",
          "userAction": "Signs up with email and password",
          "systemResponse": "Creates auth record, initializes default workspace, redirects to onboarding",
          "technicalImplication": "Supabase Auth signup trigger creating public.profiles row"
        },
        {
          "stepNumber": 2,
          "title": "Core Action Execution",
          "userAction": "Fills in primary item details and clicks submit",
          "systemResponse": "Validates payload, creates database entry, shows real-time feedback",
          "technicalImplication": "POST API endpoint with Zod validation and optimistic UI update"
        }
      ],
      "frictionPoints": ["Potential confusion on optional fields", "Slow network on image upload"],
      "failureScenarios": [
        {
          "scenario": "Network drops during submission",
          "resolution": "Client-side retry queue and clear error toast without losing entered text"
        }
      ],
      "source": "SYSTEM_INFERRED",
      "status": "CONFIRMED"
    }
  ],
  "features": [
    {
      "id": "feat_1",
      "title": "Secure User Authentication",
      "simpleDescription": "Users can log in, register, and protect their data safely",
      "technicalDetails": "Supabase Auth with JWT session management and HTTP-only cookies",
      "category": "CORE_MVP",
      "priority": "CRITICAL",
      "source": "SYSTEM_RECOMMENDED",
      "status": "CONFIRMED"
    },
    {
      "id": "feat_2",
      "title": "Main Interactive Dashboard",
      "simpleDescription": "The primary screen where users manage their core items and view activity",
      "technicalDetails": "Responsive Next.js App Router layout with server component data fetching",
      "category": "CORE_MVP",
      "priority": "CRITICAL",
      "source": "USER_DESCRIBED",
      "status": "CONFIRMED"
    }
  ],
  "screens": [
    {
      "id": "screen_1",
      "screenName": "Dashboard Home",
      "routePath": "/dashboard",
      "simplePurpose": "Central hub showing recent activity, key metrics, and primary action buttons",
      "accessRoles": ["Primary User", "Administrator"],
      "keyComponents": ["OverviewMetricsCard", "RecentItemsList", "QuickActionDrawer"],
      "emptyState": "Welcome card with a prominent 'Create your first item' button and guide",
      "loadingState": "Skeleton cards matching the 3-column layout",
      "errorState": "Retry button with clear explanation if data fails to load",
      "technicalNotes": "Server component fetching with React Query or SWR on client mutations",
      "source": "SYSTEM_INFERRED",
      "status": "CONFIRMED"
    }
  ],
  "workflows": [
    {
      "id": "flow_1",
      "name": "Item Creation & Notification Lifecycle",
      "trigger": "User submits new item form",
      "simpleDescription": "Item is created, validated, persisted, and relevant parties are notified",
      "steps": [
        "1. Client validates inputs",
        "2. API creates database record with status 'active'",
        "3. Webhook/Edge function sends email notification",
        "4. Client updates UI with success confirmation"
      ],
      "technicalServices": ["Supabase Database", "Edge Functions", "Resend Email API"],
      "source": "SYSTEM_RECOMMENDED",
      "status": "PROPOSED"
    }
  ],
  "businessRules": [
    {
      "id": "rule_1",
      "code": "BR-001",
      "ruleStatement": "Users can only edit and delete records that they created.",
      "reason": "Prevents unauthorized data modification and protects user privacy.",
      "enforcementLevel": "STRICT",
      "technicalConstraint": "Supabase Row Level Security (RLS) policy on table where auth.uid() = user_id",
      "source": "SYSTEM_RECOMMENDED",
      "status": "CONFIRMED"
    }
  ],
  "dataEntities": [
    {
      "id": "entity_1",
      "entityName": "UserProfile",
      "simpleDescription": "Stores account information, preferences, and permissions for each user",
      "ownershipRole": "Primary User",
      "attributes": [
        { "name": "id", "type": "uuid", "required": true, "description": "Primary key referencing auth.users.id" },
        { "name": "email", "type": "text", "required": true, "description": "User email address" },
        { "name": "full_name", "type": "text", "required": false, "description": "Display name" },
        { "name": "role", "type": "text", "required": true, "description": "User role: user | admin" }
      ],
      "lifecycleStates": ["registered", "active", "suspended"],
      "source": "SYSTEM_INFERRED",
      "status": "CONFIRMED"
    }
  ],
  "integrations": [
    {
      "id": "integ_1",
      "serviceName": "Supabase Auth & Database",
      "category": "AUTH",
      "purpose": "Provides user authentication, Postgres relational storage, and Row-Level Security",
      "fallbackPlan": "Standard Postgres connection with Prisma or Drizzle ORM",
      "technicalApiNotes": "@supabase/ssr client with cookie handling",
      "source": "SYSTEM_RECOMMENDED",
      "status": "CONFIRMED"
    }
  ],
  "adminTools": [
    {
      "id": "admin_1",
      "toolName": "User & Content Moderation Console",
      "simpleDescription": "Allows administrators to review flagged items, inspect users, and manage system health",
      "operationalPurpose": "Maintain quality, resolve disputes, and support end-users",
      "restrictedToRoles": ["Platform Administrator"],
      "technicalCapabilities": ["View all records", "Override status", "Ban/unban accounts"],
      "source": "SYSTEM_RECOMMENDED",
      "status": "PROPOSED"
    }
  ],
  "security": [
    {
      "id": "sec_1",
      "title": "Row-Level Security (RLS) Isolation",
      "simpleDescription": "Ensures every user's private data is strictly isolated and inaccessible to other users",
      "category": "AUTHORIZATION",
      "technicalImplementation": "Enable RLS on all Postgres tables with strict auth.uid() checks for SELECT, INSERT, UPDATE, DELETE",
      "source": "SYSTEM_RECOMMENDED",
      "status": "CONFIRMED"
    }
  ],
  "quality": [
    {
      "id": "qual_1",
      "category": "RESPONSIVENESS",
      "requirement": "Fully responsive and usable across mobile (360px+), tablet, and desktop viewports",
      "targetMetric": "100% mobile test pass rate",
      "technicalApproach": "Mobile-first Tailwind CSS utility classes and flex/grid responsive wrappers",
      "source": "SYSTEM_RECOMMENDED",
      "status": "CONFIRMED"
    },
    {
      "id": "qual_2",
      "category": "PERFORMANCE",
      "requirement": "Fast initial page loads and sub-100ms UI interactions",
      "targetMetric": "Lighthouse Performance > 90",
      "technicalApproach": "Server Components for heavy rendering, minimal client bundle, optimized images",
      "source": "SYSTEM_RECOMMENDED",
      "status": "CONFIRMED"
    }
  ],
  "futureConsiderations": [
    {
      "id": "fut_1",
      "title": "Automated AI Recommendations",
      "simpleDescription": "Offer proactive suggestions and automation based on user behavioral patterns",
      "phase": "V2",
      "technicalArchitectureNote": "Background worker evaluating analytics events via vector embeddings",
      "source": "SYSTEM_RECOMMENDED",
      "status": "PROPOSED"
    }
  ]
}

DO NOT include markdown code blocks (such as \`\`\`json) in your response. Output raw JSON only.
`;

  try {
    const aiResult = await executeResilientAICompletion<any>({
      prompt,
      systemInstruction: "You are the Principal Software Product Architect for Aigenstra. Return strictly valid JSON.",
      temperature: 0.3,
      fallback: () => ({}),
    });

  const parsed = aiResult.data || {};

    const generatedBlueprint: SoftwareBlueprint = {
      project_id: projectId,
      overview: parsed.overview || fallbackBlueprint.overview,
      usersRoles: parsed.usersRoles || fallbackBlueprint.usersRoles,
      userJourneys: parsed.userJourneys || fallbackBlueprint.userJourneys,
      features: parsed.features || fallbackBlueprint.features,
      screens: parsed.screens || fallbackBlueprint.screens,
      workflows: parsed.workflows || fallbackBlueprint.workflows,
      businessRules: parsed.businessRules || fallbackBlueprint.businessRules,
      dataEntities: parsed.dataEntities || fallbackBlueprint.dataEntities,
      integrations: parsed.integrations || fallbackBlueprint.integrations,
      adminTools: parsed.adminTools || fallbackBlueprint.adminTools,
      security: parsed.security || fallbackBlueprint.security,
      quality: parsed.quality || fallbackBlueprint.quality,
      futureConsiderations: parsed.futureConsiderations || fallbackBlueprint.futureConsiderations,
      healthScore: 100,
      healthWarnings: [],
      updated_at: new Date().toISOString(),
    };

    const health = evaluateBlueprintHealth(generatedBlueprint);
    generatedBlueprint.healthScore = health.score;
    generatedBlueprint.healthWarnings = health.issues.map((i) => i.message);

    return generatedBlueprint;
  } catch (err) {
    console.error("Failed to generate software blueprint via AI:", err);
    return fallbackBlueprint;
  }
}

/**
 * Deterministic offline fallback blueprint generator.
 */
function createDeterministicBlueprint(
  projectId: string,
  projectName: string,
  productType: string,
  rawIdea: string,
  summary?: ProductSummary | null,
  understanding?: IdeaUnderstandingRecord | null
): SoftwareBlueprint {
  const primaryRole = summary?.whoFor?.[0] || understanding?.targetUsers?.[0] || "Primary User";
  
  return {
    project_id: projectId,
    overview: {
      name: projectName,
      summary: summary?.whatBuilding || understanding?.normalizedDescription || `${projectName} is a modern ${productType} designed to solve user problems efficiently.`,
      problemStatement: `Users currently lack a unified, streamlined way to manage their workflows effectively.`,
      valueProposition: `Delivers an intuitive, frictionless experience with automated tracking and real-time insights.`,
      productType: productType || "Web Platform",
      targetOutcome: `Empower ${primaryRole}s to achieve their goals with maximum clarity and minimum overhead.`,
      source: "USER_DESCRIBED",
      status: "CONFIRMED",
    },
    usersRoles: [
      {
        id: "role_primary",
        roleName: primaryRole,
        simpleDescription: `The main individual using ${projectName} to accomplish daily tasks.`,
        technicalPermissions: ["read:own_data", "write:own_data", "update:profile"],
        userGoals: ["Create and manage core items", "Track activity and results"],
        restrictions: ["Cannot view or modify other users' records", "Cannot access system settings"],
        relatedRoles: ["Platform Administrator"],
        source: "USER_DESCRIBED",
        status: "CONFIRMED",
      },
      {
        id: "role_admin",
        roleName: "Platform Administrator",
        simpleDescription: "Oversees system health, user management, and operational settings.",
        technicalPermissions: ["admin:read_all", "admin:manage_users", "admin:system_config"],
        userGoals: ["Monitor application usage", "Manage user access and platform health"],
        restrictions: [],
        relatedRoles: [primaryRole],
        source: "SYSTEM_RECOMMENDED",
        status: "PROPOSED",
      },
    ],
    userJourneys: [
      {
        id: "journey_primary_flow",
        title: `${primaryRole} Core Workflow`,
        role: primaryRole,
        happyPathSteps: [
          {
            stepNumber: 1,
            title: "Access Platform & Authentication",
            userAction: "Logs into account using email credentials",
            systemResponse: "Authenticates credentials and loads personalized dashboard",
            technicalImplication: "Supabase Auth session token verification",
          },
          {
            stepNumber: 2,
            title: "Create / Manage Core Resource",
            userAction: "Navigates to creation view, enters details, and clicks Save",
            systemResponse: "Validates input data, writes record to database, shows success toast",
            technicalImplication: "POST /api/resources with RLS owner validation",
          },
          {
            stepNumber: 3,
            title: "Review Results & Track Status",
            userAction: "Inspects status metrics and generated output on dashboard",
            systemResponse: "Displays real-time state with action buttons",
            technicalImplication: "Optimistic UI update with reactive state revalidation",
          },
        ],
        frictionPoints: ["Input validation confusion", "Slow connection during save"],
        failureScenarios: [
          {
            scenario: "Network error during save",
            resolution: "Preserve form input state in local storage and display retry notification.",
          },
        ],
        source: "SYSTEM_INFERRED",
        status: "CONFIRMED",
      },
    ],
    features: [
      {
        id: "feat_auth",
        title: "User Authentication & Profiles",
        simpleDescription: "Secure login, signup, password management, and personal profiles.",
        technicalDetails: "Supabase Auth with Row Level Security (RLS) policy enforcement.",
        category: "CORE_MVP",
        priority: "CRITICAL",
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
      },
      {
        id: "feat_dashboard",
        title: "Core Activity Dashboard",
        simpleDescription: "Central screen displaying active items, statistics, and quick actions.",
        technicalDetails: "Next.js App Router Server Component with responsive card layout.",
        category: "CORE_MVP",
        priority: "CRITICAL",
        source: "USER_DESCRIBED",
        status: "CONFIRMED",
      },
      {
        id: "feat_management",
        title: "Resource Creation & Management",
        simpleDescription: "Forms and tools to add, edit, search, and delete core items.",
        technicalDetails: "Zod-validated API endpoints with server actions or REST handlers.",
        category: "CORE_MVP",
        priority: "CRITICAL",
        source: "USER_DESCRIBED",
        status: "CONFIRMED",
      },
      {
        id: "feat_admin",
        title: "Admin Management Console",
        simpleDescription: "Tools for platform operators to review system activity and users.",
        technicalDetails: "Role-scoped route group protected by middleware authorization.",
        category: "ADMIN",
        priority: "HIGH",
        source: "SYSTEM_RECOMMENDED",
        status: "PROPOSED",
      },
    ],
    screens: [
      {
        id: "screen_dashboard",
        screenName: "Main Dashboard",
        routePath: "/dashboard",
        simplePurpose: "Provides an immediate overview of active projects, quick stats, and primary actions.",
        accessRoles: [primaryRole, "Platform Administrator"],
        keyComponents: ["MetricsOverviewCard", "ActiveItemsList", "QuickActionHeader"],
        emptyState: "Welcome greeting with 'Get Started' action card explaining next steps.",
        loadingState: "Skeleton layout mirroring the 3-column dashboard grid.",
        errorState: "Friendly error card with 'Retry' button.",
        technicalNotes: "Cached server component with client-side mutation invalidation.",
        source: "SYSTEM_INFERRED",
        status: "CONFIRMED",
      },
      {
        id: "screen_item_editor",
        screenName: "Item Creation & Edit Studio",
        routePath: "/dashboard/items/new",
        simplePurpose: "Step-by-step form to configure and publish core resources.",
        accessRoles: [primaryRole],
        keyComponents: ["StepProgressHeader", "ConfigForm", "PreviewPane"],
        emptyState: "Pre-filled default suggestions and clear field hints.",
        loadingState: "Pulsing form skeleton with disabled submit button.",
        errorState: "Field-level inline validation warnings.",
        technicalNotes: "Controlled form state with react-hook-form and zodResolver.",
        source: "SYSTEM_INFERRED",
        status: "CONFIRMED",
      },
      {
        id: "screen_settings",
        screenName: "Account & System Settings",
        routePath: "/dashboard/settings",
        simplePurpose: "Manage profile info, notification preferences, and security settings.",
        accessRoles: [primaryRole, "Platform Administrator"],
        keyComponents: ["ProfileCard", "NotificationToggles", "SecurityPanel"],
        emptyState: "Default preferences pre-selected.",
        loadingState: "Settings group skeleton.",
        errorState: "Error toast with actionable resolution guidance.",
        technicalNotes: "Direct Supabase profile table update.",
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
      },
    ],
    workflows: [
      {
        id: "flow_lifecycle",
        name: "Standard Item Lifecycle",
        trigger: "User creates new resource",
        simpleDescription: "Resource moves through draft, active, and completed states.",
        steps: [
          "1. User submits creation form",
          "2. Database record initialized with status 'active'",
          "3. Real-time update reflected on Dashboard",
          "4. Background summary metric recomputed",
        ],
        technicalServices: ["Supabase Database", "Next.js API Handler"],
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
      },
    ],
    businessRules: [
      {
        id: "rule_owner_rls",
        code: "BR-001",
        ruleStatement: "Users may only read, update, or delete records belonging to their account.",
        reason: "Guarantees multi-tenant data privacy and security.",
        enforcementLevel: "STRICT",
        technicalConstraint: "CREATE POLICY on table FOR ALL USING (auth.uid() = user_id);",
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
      },
      {
        id: "rule_validation",
        code: "BR-002",
        ruleStatement: "All resource titles and inputs must be sanitized and validated before persistence.",
        reason: "Prevents malformed data and security vulnerabilities (XSS/injection).",
        enforcementLevel: "STRICT",
        technicalConstraint: "Zod schema parsing on API entry point.",
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
      },
    ],
    dataEntities: [
      {
        id: "entity_profile",
        entityName: "UserProfile",
        simpleDescription: "Holds user credentials, role, display name, and preferences.",
        ownershipRole: primaryRole,
        attributes: [
          { name: "id", type: "uuid", required: true, description: "References auth.users" },
          { name: "email", type: "text", required: true, description: "Account email" },
          { name: "full_name", type: "text", required: false, description: "Display name" },
          { name: "role", type: "text", required: true, description: "Role enum" },
          { name: "created_at", type: "timestamp", required: true, description: "Creation timestamp" },
        ],
        lifecycleStates: ["active", "suspended"],
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
      },
      {
        id: "entity_resource",
        entityName: "CoreResource",
        simpleDescription: "The primary business item managed by the user within the application.",
        ownershipRole: primaryRole,
        attributes: [
          { name: "id", type: "uuid", required: true, description: "Primary key" },
          { name: "user_id", type: "uuid", required: true, description: "Owner ID" },
          { name: "title", type: "text", required: true, description: "Resource name" },
          { name: "status", type: "text", required: true, description: "Lifecycle state" },
          { name: "metadata", type: "jsonb", required: false, description: "Flexible configuration" },
          { name: "created_at", type: "timestamp", required: true, description: "Creation date" },
        ],
        lifecycleStates: ["draft", "active", "archived"],
        source: "SYSTEM_INFERRED",
        status: "CONFIRMED",
      },
    ],
    integrations: [
      {
        id: "integ_supabase",
        serviceName: "Supabase (Auth & Database)",
        category: "AUTH",
        purpose: "Provides relational PostgreSQL data storage, authentication, and real-time syncing.",
        fallbackPlan: "Self-hosted PostgreSQL or Prisma ORM integration.",
        technicalApiNotes: "@supabase/ssr with secure cookie session handling.",
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
      },
    ],
    adminTools: [
      {
        id: "admin_overview",
        toolName: "System Health & Metrics Panel",
        simpleDescription: "Allows admins to view active user counts, error logs, and system metrics.",
        operationalPurpose: "Maintain uptime and diagnose platform errors quickly.",
        restrictedToRoles: ["Platform Administrator"],
        technicalCapabilities: ["Read global metrics", "Inspect error logs"],
        source: "SYSTEM_RECOMMENDED",
        status: "PROPOSED",
      },
    ],
    security: [
      {
        id: "sec_rls",
        title: "Row Level Security (RLS) Isolation",
        simpleDescription: "Guarantees strict data isolation between accounts at the database level.",
        category: "AUTHORIZATION",
        technicalImplementation: "PostgreSQL RLS policies enabled on all tables with auth.uid() matching.",
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
      },
      {
        id: "sec_validation",
        title: "Strict Payload & Input Sanitization",
        simpleDescription: "Validates all incoming data before execution to block malicious inputs.",
        category: "DATA_PROTECTION",
        technicalImplementation: "Zod schema parsing on all API routes.",
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
      },
    ],
    quality: [
      {
        id: "qual_responsive",
        category: "RESPONSIVENESS",
        requirement: "Flawless rendering and interaction across mobile (360px+), tablet, and desktop viewports.",
        targetMetric: "100% viewport test pass rate",
        technicalApproach: "Tailwind responsive prefixes (sm:, md:, lg:) with fluid containers.",
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
      },
      {
        id: "qual_accessibility",
        category: "ACCESSIBILITY",
        requirement: "High contrast, full keyboard navigability, and ARIA labels on all interactive controls.",
        targetMetric: "WCAG 2.1 AA Compliance",
        technicalApproach: "Radix UI accessible primitives and semantic HTML elements.",
        source: "SYSTEM_RECOMMENDED",
        status: "CONFIRMED",
      },
    ],
    futureConsiderations: [
      {
        id: "fut_ai",
        title: "AI-Powered Workflow Automation",
        simpleDescription: "Automate repetitive data entry and insights using smart AI agents.",
        phase: "V2",
        technicalArchitectureNote: "Background job queue connecting to Gemini / Claude APIs.",
        source: "SYSTEM_RECOMMENDED",
        status: "PROPOSED",
      },
    ],
    healthScore: 92,
    healthWarnings: [],
    updated_at: new Date().toISOString(),
  };
}
