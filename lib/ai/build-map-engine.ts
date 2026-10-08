import { getGeminiApiKey } from "./client";
import { BuildMap, BuildStage, SoftwareBlueprint } from "@/types";

/**
 * Generates an actionable, sequential Build Map based on a project's Software Blueprint.
 */
export async function generateBuildMap(
  projectId: string,
  blueprint: SoftwareBlueprint
): Promise<BuildMap> {
  const apiKey = getGeminiApiKey();

  const fallbackBuildMap = createDeterministicBuildMap(projectId, blueprint);

  if (!apiKey) {
    return fallbackBuildMap;
  }

  const prompt = `
System Instruction:
You are the Principal Build Architect for Aigenstra.
Your task is to transform the provided Software Blueprint into a chronologically sequenced, actionable Build Map.

CRITICAL RULES:
1. AIGENSTRA IS A PROMPT BUILDER, NOT AN APP BUILDER. The build map prepares structured development increments for external coding agents (Google Antigravity, Claude Code, Cursor, Codex).
2. Human-Centric Ordering: Order stages logically (Foundation/DB -> Auth/Profiles -> Primary Dashboard -> Core Creation Flow -> Administration/Integrations -> Quality/Security/Hardening).
3. "Why This Exists": Provide a clear, plain-English explanation for why this stage is sequenced where it is.
4. Deliverables: List concrete screens, database entities, and workflows delivered in each stage.

Blueprint Summary:
- Product: ${blueprint.overview.name} (${blueprint.overview.productType})
- Summary: ${blueprint.overview.summary}
- Roles: ${blueprint.usersRoles.map((r) => r.roleName).join(", ")}
- Screens: ${blueprint.screens.map((s) => `${s.screenName} (${s.routePath})`).join(", ")}
- Entities: ${blueprint.dataEntities.map((e) => e.entityName).join(", ")}
- Core Features: ${blueprint.features.filter((f) => f.category === "CORE_MVP").map((f) => f.title).join(", ")}

Return a valid JSON object matching this schema:
{
  "stages": [
    {
      "id": "stage_1",
      "stageNumber": 1,
      "title": "Foundation & Schema Architecture",
      "userCentricName": "Project Setup & Data Core",
      "whyThisExists": "Establishes database models, types, and base layout so all subsequent features have a solid foundation.",
      "deliverables": [
        "Database schema with Supabase tables and RLS",
        "TypeScript shared interfaces and Zod validation schemas",
        "Next.js App Router root layout and theme config"
      ],
      "associatedScreens": ["/"],
      "associatedEntities": ["UserProfile", "CoreResource"],
      "dependencies": [],
      "status": "READY",
      "agentGuidance": "Create PostgreSQL migration scripts first with RLS policies, then build TypeScript types matching the schema.",
      "estimatedComplexity": "MEDIUM"
    },
    {
      "id": "stage_2",
      "stageNumber": 2,
      "title": "Authentication & User Profiles",
      "userCentricName": "User Accounts & Security",
      "whyThisExists": "Allows users to securely register, log in, and manage their identity before accessing workspace features.",
      "deliverables": [
        "Sign in and sign up pages with validation",
        "Session middleware for protected routes",
        "User profile management view"
      ],
      "associatedScreens": ["/login", "/signup", "/dashboard/settings"],
      "associatedEntities": ["UserProfile"],
      "dependencies": ["stage_1"],
      "status": "NOT_STARTED",
      "agentGuidance": "Use @supabase/ssr helpers for server-side auth cookie handling and middleware protection.",
      "estimatedComplexity": "LOW"
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
            temperature: 0.3,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn("Gemini API error during build map generation, using deterministic fallback");
      return fallbackBuildMap;
    }

    const data = await response.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) {
      return fallbackBuildMap;
    }

    const parsed = JSON.parse(rawContent);
    const stages: BuildStage[] = Array.isArray(parsed.stages) && parsed.stages.length > 0
      ? parsed.stages
      : fallbackBuildMap.stages;

    return {
      project_id: projectId,
      stages,
      currentStageNumber: 1,
      totalStages: stages.length,
      completedStages: stages.filter((s) => s.status === "COMPLETED").length,
      updated_at: new Date().toISOString(),
    };
  } catch (err) {
    console.error("Failed to generate build map via AI:", err);
    return fallbackBuildMap;
  }
}

/**
 * Deterministic build map generator if AI is unavailable.
 */
function createDeterministicBuildMap(
  projectId: string,
  blueprint: SoftwareBlueprint
): BuildMap {
  const entityNames = blueprint.dataEntities.map((e) => e.entityName);
  const screenPaths = blueprint.screens.map((s) => s.routePath);

  const stages: BuildStage[] = [
    {
      id: "stage_01_foundation",
      stageNumber: 1,
      title: "Foundation & Data Architecture",
      userCentricName: "Foundation & Data Architecture",
      whyThisExists: "Creates the database schemas, security rules (RLS), and shared project types so all future pages have a reliable backend.",
      deliverables: [
        "PostgreSQL tables and Row-Level Security policies in Supabase",
        "TypeScript shared domain types and Zod validation schemas",
        "Base responsive layout and navigation system",
      ],
      associatedScreens: ["/dashboard"],
      associatedEntities: entityNames,
      dependencies: [],
      status: "READY",
      agentGuidance: "Execute database migrations first in Supabase, verify RLS policies, and generate TypeScript types.",
      estimatedComplexity: "MEDIUM",
    },
    {
      id: "stage_02_auth",
      stageNumber: 2,
      title: "Authentication & User Accounts",
      userCentricName: "Authentication & Account Management",
      whyThisExists: "Enables users to sign up, log in securely, and personalize their profiles before interacting with workspace items.",
      deliverables: [
        "Login, signup, and password recovery forms",
        "Auth middleware protecting /dashboard routes",
        "User profile and settings screen",
      ],
      associatedScreens: ["/login", "/signup", "/dashboard/settings"],
      associatedEntities: ["UserProfile"],
      dependencies: ["stage_01_foundation"],
      status: "NOT_STARTED",
      agentGuidance: "Implement Next.js App Router server actions with @supabase/ssr for cookie session tokens.",
      estimatedComplexity: "LOW",
    },
    {
      id: "stage_03_dashboard",
      stageNumber: 3,
      title: "Core Dashboard & Overview",
      userCentricName: "Main Dashboard Experience",
      whyThisExists: "Gives users an immediate visual landing hub to see their active data, status metrics, and next actions.",
      deliverables: [
        "Main dashboard page with responsive metric cards",
        "Recent items list with empty and loading states",
        "Quick action header to trigger item creation",
      ],
      associatedScreens: ["/dashboard"],
      associatedEntities: entityNames.filter((e) => e !== "UserProfile"),
      dependencies: ["stage_02_auth"],
      status: "NOT_STARTED",
      agentGuidance: "Build server-rendered dashboard components with clean loading skeletons and empty states.",
      estimatedComplexity: "MEDIUM",
    },
    {
      id: "stage_04_core_flow",
      stageNumber: 4,
      title: "Primary Creation & Management Flow",
      userCentricName: "Core Resource Creation & Management",
      whyThisExists: "Implements the main value proposition of the product where users create, edit, and interact with core resources.",
      deliverables: [
        "Interactive creation and edit forms with live validation",
        "Resource listing with filtering, search, and sorting",
        "Detailed resource view with status indicators",
      ],
      associatedScreens: screenPaths.filter((p) => p !== "/dashboard" && p !== "/dashboard/settings"),
      associatedEntities: entityNames.filter((e) => e !== "UserProfile"),
      dependencies: ["stage_03_dashboard"],
      status: "NOT_STARTED",
      agentGuidance: "Use react-hook-form with Zod resolvers. Handle error states gracefully with toasts.",
      estimatedComplexity: "HIGH",
    },
    {
      id: "stage_05_admin_ops",
      stageNumber: 5,
      title: "Administration & Operational Tools",
      userCentricName: "Admin Tools & Operational Controls",
      whyThisExists: "Provides administrators with moderation controls, health metrics, and user management capabilities.",
      deliverables: [
        "Admin console with role-scoped route protection",
        "User management and status moderation table",
        "Operational error logs and system health monitor",
      ],
      associatedScreens: ["/admin"],
      associatedEntities: ["UserProfile"],
      dependencies: ["stage_04_core_flow"],
      status: "NOT_STARTED",
      agentGuidance: "Protect admin routes with role-based checks in middleware and API handlers.",
      estimatedComplexity: "MEDIUM",
    },
    {
      id: "stage_06_hardening",
      stageNumber: 6,
      title: "Quality Hardening & Security Audit",
      userCentricName: "Quality, Performance & Launch Readiness",
      whyThisExists: "Ensures the application is responsive on mobile, meets accessibility standards, and protects user data before launch.",
      deliverables: [
        "Mobile responsive audit (360px to 1440px viewports)",
        "WCAG accessibility and keyboard navigation verification",
        "End-to-end user journey smoke tests",
      ],
      associatedScreens: screenPaths,
      associatedEntities: entityNames,
      dependencies: ["stage_05_admin_ops"],
      status: "NOT_STARTED",
      agentGuidance: "Run automated Lighthouse checks and test responsive layouts on mobile viewports.",
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
