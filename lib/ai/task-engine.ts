import { getGeminiApiKey } from "./client";
import {
  AigenstraTask,
  BuildMap,
  EngineeringBlueprint,
  SoftwareBlueprint,
  TaskRecommendation,
} from "@/types";

/**
 * Generates implementation-sized, bounded coding tasks from the Build Map and Engineering Blueprint.
 */
export async function generateProjectTasks(
  projectId: string,
  projectName: string,
  productType: string,
  buildMap: BuildMap,
  softwareBlueprint: SoftwareBlueprint,
  engineeringBlueprint?: EngineeringBlueprint | null
): Promise<{ tasks: AigenstraTask[]; recommendation: TaskRecommendation }> {
  const apiKey = getGeminiApiKey();

  const fallback = createDeterministicTasks(
    projectId,
    projectName,
    productType,
    buildMap,
    softwareBlueprint,
    engineeringBlueprint
  );

  if (!apiKey) {
    return fallback;
  }

  const stagesSummary = buildMap.stages
    .map(
      (s) =>
        `Stage ${s.stageNumber}: ${s.userCentricName} - ${s.whyThisExists} (Deliverables: ${s.deliverables.join(", ")})`
    )
    .join("\n");

  const prompt = `
System Instruction:
You are the Principal Task & Build Planner for Aigenstra.
Your mission is to decompose the project's Build Map and Engineering Blueprint into well-scoped, implementation-sized tasks for external coding agents.

CRITICAL RULES:
1. AIGENSTRA IS A PROMPT BUILDER, NOT AN APP BUILDER.
2. Right-Sized Tasks: Each task should represent a coherent, bounded increment of work (e.g. "Implement Customer Registration and Session Middleware", NOT "Build entire app" and NOT "Fix button padding").
3. Change Boundaries: Explicitly specify 'mustChange' and 'mustNotChange' for each task to prevent coding agents from breaking unrelated code.
4. Acceptance Criteria: Must be observable, verifiable outcomes (e.g. "Customer can create account", "Invalid credentials return clear error").
5. Next-Task Recommendation: Recommend the single best task to build next with a clear, plain-English "whyNext" rationale based on architectural dependencies.

Project Name: ${projectName} (${productType})
Build Map Stages:
${stagesSummary}

Return a valid JSON object matching this schema:
{
  "tasks": [
    {
      "id": "task_1",
      "title": "Set Up Database Schemas & Row-Level Security",
      "short_description": "Create PostgreSQL tables for user profiles and resources with strict RLS policies.",
      "purpose": "Provides the foundational multi-tenant data storage and security rules for all subsequent features.",
      "user_value": "Ensures user data is securely isolated from day one.",
      "task_type": "DATABASE",
      "category": "Foundation",
      "priority": "CRITICAL",
      "status": "READY",
      "readiness": "READY",
      "complexity": "MEDIUM",
      "source": "BUILD_MAP",
      "stageNumber": 1,
      "dependencies": [],
      "blocked_by": [],
      "related_blueprint_items": ["Data Entities", "Business Rules"],
      "related_engineering_items": ["DATABASE", "AUTHORIZATION"],
      "related_decisions": ["PostgreSQL via Supabase"],
      "related_assumptions": [],
      "affected_screens": [],
      "affected_entities": ["UserProfile", "CoreResource"],
      "affected_apis": [],
      "acceptance_criteria": [
        "PostgreSQL tables are initialized in Supabase",
        "RLS policies ensure users only access their own rows",
        "TypeScript shared interfaces match the database schema"
      ],
      "change_boundaries": {
        "mustChange": ["supabase/schema.sql", "types/index.ts"],
        "mayChange": ["lib/supabase/"],
        "mustNotChange": ["app/(dashboard)/", "components/"]
      }
    },
    {
      "id": "task_2",
      "title": "Implement User Authentication & Protected Routes",
      "short_description": "Build login, registration, password handling, and route protection middleware.",
      "purpose": "Enables customers to securely log in and protects private dashboard pages.",
      "user_value": "Allows users to securely access their private workspace.",
      "task_type": "AUTH",
      "category": "Identity",
      "priority": "CRITICAL",
      "status": "READY",
      "readiness": "READY",
      "complexity": "MEDIUM",
      "source": "BUILD_MAP",
      "stageNumber": 2,
      "dependencies": ["task_1"],
      "blocked_by": [],
      "related_blueprint_items": ["Users & Roles", "Security"],
      "related_engineering_items": ["AUTHENTICATION", "FRONTEND"],
      "related_decisions": ["Email/Password Auth"],
      "related_assumptions": [],
      "affected_screens": ["/login", "/signup", "/dashboard/settings"],
      "affected_entities": ["UserProfile"],
      "affected_apis": ["/auth/callback"],
      "acceptance_criteria": [
        "User can register with email and password",
        "User can log in and receive valid session cookie",
        "Unauthenticated visitors attempting to access /dashboard are redirected to /login"
      ],
      "change_boundaries": {
        "mustChange": ["app/(auth)/", "middleware.ts", "components/auth/"],
        "mayChange": ["components/navigation/"],
        "mustNotChange": ["app/api/resources/"]
      }
    }
  ],
  "recommendation": {
    "recommendedTaskId": "task_1",
    "recommendedTaskTitle": "Set Up Database Schemas & Row-Level Security",
    "whyNext": "Database models and Row-Level Security are the prerequisite foundation required before user authentication and workspace features can be built.",
    "prerequisitesMet": true,
    "alternativeReadyTasks": [
      {
        "taskId": "task_2",
        "title": "Implement User Authentication & Protected Routes",
        "reason": "Can be planned in parallel once database schemas are locked."
      }
    ]
  }
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
      console.warn("Gemini API error during task planning, using deterministic fallback");
      return fallback;
    }

    const data = await response.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) {
      return fallback;
    }

    const parsed = JSON.parse(rawContent);
    const tasks: AigenstraTask[] = Array.isArray(parsed.tasks) && parsed.tasks.length > 0
      ? parsed.tasks.map((t: any) => ({
          ...t,
          project_id: projectId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))
      : fallback.tasks;

    const recommendation: TaskRecommendation = parsed.recommendation || fallback.recommendation;

    return { tasks, recommendation };
  } catch (err) {
    console.error("Failed to generate project tasks via AI:", err);
    return fallback;
  }
}

/**
 * Deterministic fallback task generator.
 */
function createDeterministicTasks(
  projectId: string,
  projectName: string,
  productType: string,
  buildMap: BuildMap,
  softwareBlueprint: SoftwareBlueprint,
  engineeringBlueprint?: EngineeringBlueprint | null
): { tasks: AigenstraTask[]; recommendation: TaskRecommendation } {
  const primaryRole = softwareBlueprint.usersRoles?.[0]?.roleName || `${projectName} User`;
  const domainEntity = softwareBlueprint.dataEntities?.find((e) => e.entityName !== "UserProfile")?.entityName || "WorkspaceItem";
  const domainPlural = domainEntity.toLowerCase() + "s";
  const entityNames = softwareBlueprint.dataEntities?.map((e) => e.entityName) || ["UserProfile", domainEntity];
  const screenPaths = softwareBlueprint.screens?.map((s) => s.routePath) || ["/dashboard", `/dashboard/${domainPlural}/new`];
  const coreFeature = softwareBlueprint.features?.[0]?.title || `${domainEntity} Creation & Flow`;
  const corePurpose = softwareBlueprint.features?.[0]?.simpleDescription || softwareBlueprint.overview?.problemStatement || `Enables ${primaryRole} to execute their core workflow.`;

  const tasks: AigenstraTask[] = [
    {
      id: "task_01_schema",
      project_id: projectId,
      title: `Set Up Database Schemas & RLS for ${domainEntity}`,
      short_description: `Initialize PostgreSQL tables with RLS policies for UserProfile and ${domainEntity} isolation.`,
      purpose: `Establishes secure, multi-tenant relational storage required for ${domainEntity} persistence.`,
      user_value: `Guarantees account data and private ${domainPlural} are strictly protected by Row-Level Security.`,
      task_type: "DATABASE",
      category: "Foundation",
      priority: "CRITICAL",
      status: "READY",
      readiness: "READY",
      complexity: "MEDIUM",
      source: "BUILD_MAP",
      stageNumber: 1,
      dependencies: [],
      blocked_by: [],
      related_blueprint_items: ["Data Entities", "Business Rules", "Security"],
      related_engineering_items: ["DATABASE", "AUTHORIZATION"],
      related_decisions: ["Relational PostgreSQL (via Supabase)"],
      related_assumptions: [],
      affected_screens: [],
      affected_entities: entityNames,
      affected_apis: [],
      acceptance_criteria: [
        `PostgreSQL tables created for UserProfile and ${domainEntity}`,
        "Row-Level Security (RLS) policies enabled with auth.uid() matching user_id",
        `TypeScript shared domain interfaces match the database schema for ${domainEntity}`,
      ],
      change_boundaries: {
        mustChange: ["supabase/schema.sql", "types/index.ts"],
        mayChange: ["lib/supabase/"],
        mustNotChange: ["components/", "app/(dashboard)/"],
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "task_02_auth",
      project_id: projectId,
      title: `Implement ${primaryRole} Authentication & Protected Routes`,
      short_description: "Build login, registration, session token management, and route protection middleware.",
      purpose: `Allows ${primaryRole} to register, sign in securely, and protects private workspace routes.`,
      user_value: "Enables users to sign in and save their personalized work safely.",
      task_type: "AUTH",
      category: "Identity",
      priority: "CRITICAL",
      status: "READY",
      readiness: "READY",
      complexity: "MEDIUM",
      source: "BUILD_MAP",
      stageNumber: 2,
      dependencies: ["task_01_schema"],
      blocked_by: [],
      related_blueprint_items: ["Users & Roles", "Security"],
      related_engineering_items: ["AUTHENTICATION", "FRONTEND"],
      related_decisions: ["Email & Password with Secure Cookie Sessions"],
      related_assumptions: [],
      affected_screens: ["/login", "/signup", "/dashboard/settings"],
      affected_entities: ["UserProfile"],
      affected_apis: ["/auth/callback"],
      acceptance_criteria: [
        "User can sign up with email and password",
        "Session cookie securely set via HTTP-only tokens",
        "Unauthenticated access to /dashboard is blocked with redirect to /login",
      ],
      change_boundaries: {
        mustChange: ["app/(auth)/", "middleware.ts", "components/auth/"],
        mayChange: ["components/dashboard/sidebar.tsx"],
        mustNotChange: [`app/api/${domainPlural}/`],
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "task_03_dashboard",
      project_id: projectId,
      title: `Build ${projectName} Activity Dashboard & Metrics`,
      short_description: `Create the main dashboard layout with responsive metric cards, active ${domainPlural}, and empty states.`,
      purpose: `Gives ${primaryRole} an immediate landing hub to monitor their activity and trigger key actions.`,
      user_value: `Provides a clean visual summary of active ${domainPlural} and quick actions.`,
      task_type: "FRONTEND",
      category: "Workspace",
      priority: "HIGH",
      status: "BACKLOG",
      readiness: "READY",
      complexity: "MEDIUM",
      source: "BUILD_MAP",
      stageNumber: 3,
      dependencies: ["task_02_auth"],
      blocked_by: [],
      related_blueprint_items: ["Pages & Screens", "Feature Matrix"],
      related_engineering_items: ["FRONTEND", "UI_ARCHITECTURE"],
      related_decisions: [],
      related_assumptions: [],
      affected_screens: ["/dashboard"],
      affected_entities: entityNames,
      affected_apis: [`/api/${domainPlural}`],
      acceptance_criteria: [
        "Dashboard renders server-side with zero layout shift",
        `Empty state renders when user has no active ${domainPlural}`,
        "Skeleton loader displays during async data loading",
      ],
      change_boundaries: {
        mustChange: ["app/(dashboard)/projects/[id]/overview/page.tsx", "components/dashboard/"],
        mayChange: ["components/navigation/"],
        mustNotChange: ["supabase/schema.sql"],
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "task_04_core_flow",
      project_id: projectId,
      title: `Implement ${coreFeature}`,
      short_description: `Build step-by-step ${domainEntity} workflow with Zod validation and optimistic updates.`,
      purpose: corePurpose,
      user_value: `Enables ${primaryRole} to execute their core workflow smoothly with instant feedback.`,
      task_type: "FEATURE",
      category: "Core Flow",
      priority: "CRITICAL",
      status: "BACKLOG",
      readiness: "READY",
      complexity: "LARGE",
      source: "BUILD_MAP",
      stageNumber: 4,
      dependencies: ["task_03_dashboard"],
      blocked_by: [],
      related_blueprint_items: ["Workflows", "Feature Matrix", "Pages & Screens"],
      related_engineering_items: ["BACKEND", "API_CONTRACTS", "UX_ARCHITECTURE"],
      related_decisions: [],
      related_assumptions: [],
      affected_screens: screenPaths.filter((p) => p !== "/dashboard"),
      affected_entities: [domainEntity],
      affected_apis: [`/api/${domainPlural}`],
      acceptance_criteria: [
        `User can create and publish new ${domainEntity}`,
        "Zod validation rejects invalid inputs and highlights field inline",
        `${domainEntity} appears immediately in list upon successful submission`,
      ],
      change_boundaries: {
        mustChange: [`app/(dashboard)/${domainPlural}/`, `app/api/${domainPlural}/route.ts`],
        mayChange: ["components/forms/"],
        mustNotChange: ["app/(auth)/"],
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const recommendation: TaskRecommendation = {
    recommendedTaskId: "task_01_schema",
    recommendedTaskTitle: `Set Up Database Schemas & RLS for ${domainEntity}`,
    whyNext: `Establishing the database models and Row-Level Security (RLS) is the essential architectural prerequisite before building authentication or ${domainPlural} workflows.`,
    prerequisitesMet: true,
    alternativeReadyTasks: [
      {
        taskId: "task_02_auth",
        title: `Implement ${primaryRole} Authentication & Route Guards`,
        reason: "Can be planned in parallel once database schemas are locked.",
      },
    ],
  };

  return { tasks, recommendation };
}
