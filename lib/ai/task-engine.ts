import { getGeminiApiKey } from "./client";
import { getProductTypeProfile } from "./product-type-profiles";
import { runBuiltInTaskAgent } from "./aigenstra-local-agent";
import {
  AigenstraTask,
  BuildMap,
  DiscoveryQnA,
  EngineeringBlueprint,
  SoftwareBlueprint,
  TaskRecommendation,
} from "@/types";

/**
 * Generates implementation-sized, bounded coding tasks in real time from the
 * synthesized Build Map, Software Blueprint, AI Research Document, and user Discovery Q&A.
 * Hybrid Architecture: Uses Gemini API when configured and reachable; automatically switches
 * to Aigenstra's Built-In Adaptive Task Agent when Gemini API is missing or offline.
 */
export async function generateProjectTasks(
  projectId: string,
  projectName: string,
  productType: string,
  buildMap: BuildMap,
  softwareBlueprint: SoftwareBlueprint,
  engineeringBlueprint?: EngineeringBlueprint | null,
  qnas: DiscoveryQnA[] = [],
  researchDoc?: any
): Promise<{ tasks: AigenstraTask[]; recommendation: TaskRecommendation }> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return runBuiltInTaskAgent(
      projectId,
      projectName,
      productType,
      buildMap,
      softwareBlueprint,
      qnas
    );
  }

  const profile = getProductTypeProfile(productType);

  const stagesSummary = buildMap.stages
    .map(
      (s) =>
        `Stage ${s.stageNumber}: ${s.userCentricName} (${s.title}) — ${s.whyThisExists}\n  Deliverables: ${s.deliverables.join(", ")}\n  Guidance: ${s.agentGuidance}`
    )
    .join("\n\n");

  const blueprintContext = JSON.stringify(
    {
      overview: softwareBlueprint.overview,
      usersRoles: softwareBlueprint.usersRoles,
      features: softwareBlueprint.features,
      workflows: softwareBlueprint.workflows,
      screens: softwareBlueprint.screens,
      dataEntities: softwareBlueprint.dataEntities,
      businessRules: softwareBlueprint.businessRules,
    },
    null,
    2
  );

  const answeredSpecs = qnas
    .filter((q) => q.answer && q.answer.trim().length > 0)
    .map(
      (q, idx) =>
        `${idx + 1}. [${q.category || "ARCHITECTURE"}] Q: ${q.question}\n   Confirmed Answer: ${q.answer}`
    )
    .join("\n");

  const researchContext = researchDoc
    ? `Market Summary: ${researchDoc.market_summary || ""}\nRecommended Features: ${
        Array.isArray(researchDoc.recommended_features)
          ? researchDoc.recommended_features
              .map((f: any) => `${f.title || f}: ${f.rationale || ""}`)
              .join("; ")
          : ""
      }`
    : "";

  const prompt = `
System Instruction:
You are the Principal Task & Build Planner for Aigenstra.
Your mission is to decompose the project's Build Map, Software Blueprint, and confirmed user discovery decisions into 5 to 7 well-scoped, implementation-sized coding tasks for external coding agents.

CRITICAL RULES:
1. ZERO FICTIONAL / BOILERPLATE TASKS: Every single task MUST directly implement the user's specific product ("${projectName}"), product type ("${profile.label}"), confirmed user discovery answers, and synthesized Software Blueprint.
2. NEVER reference Aigenstra's or Sitelens's internal files (such as "app/(dashboard)/projects/[id]/overview/page.tsx") or generic placeholders ("WorkspaceItem", "CoreResource"). Use clean, realistic file paths belonging strictly to the user's "${projectName}" codebase.
3. PRODUCT TYPE TAILORING (${profile.label}):
   - Core Paradigm: ${profile.architecturalSummary}
   - Typical Screen Patterns: ${profile.typicalScreenPatterns.join(" -> ")}
   - For SaaS: Explicitly plan tenant data isolation (PostgreSQL RLS), automated negative isolation test suites asserting 403 on cross-tenant requests, role-based access control (owner, admin, member, billing_admin), zero-trust server payment verification, and idempotent subscription dunning webhook reconciliation.
   - For E-commerce: Explicitly plan multi-attribute product variants (SKU, price_cents, attributes), atomic inventory decrement with check constraints (inventory_quantity >= 0) to prevent overselling under high concurrency, zero-trust server total recalculation, and idempotent webhook signature reconciliation.
   - For Landing Pages: Prioritize responsive conversion hero, interactive value showcase, lead capture form, and SEO metadata without unneeded auth/dashboard bloat unless explicitly requested.
4. SPECIALIST TASK ROUTING: Every task should explicitly declare its specialized domain:
   - "Data & Security Specialist" for database schemas, RLS policies, and migrations
   - "SaaS & Tenancy Specialist" for multi-tenancy, RBAC permissions, and billing lifecycle
   - "E-Commerce & Concurrency Specialist" for product variants, inventory locks, cart, and checkout reconciliation
   - "UI/UX & Mobile Responsiveness Specialist" for storefront shells, navigation drawers, and fluid 360px+ responsiveness
   - "API & Integration Specialist" for external webhooks, background jobs, and transactional notifications
5. Change Boundaries: Explicitly specify 'mustChange', 'mayChange', and 'mustNotChange' file paths for the user's target repository so coding agents stay strictly in bounds.
6. Acceptance Criteria: Must be observable, verifiable outcomes grounded in the user's confirmed answers and blueprint entities/screens.
7. Next-Task Recommendation: Recommend the single best foundational task to execute first with a clear "whyNext" rationale.
8. SHARED PRODUCT DEVELOPMENT STANDARD: Differentiate between intended deliverables (what this task defines), actual implementation files (what the coding agent creates/modifies), and verification criteria (the exact tests/typechecks required to prove the task works). Never mark acceptance criteria as satisfied without verifiable test evidence.

PROJECT DETAILS:
- Project Name: ${projectName}
- Product Type: ${profile.label}

CONFIRMED USER DISCOVERY ANSWERS:
${answeredSpecs || "Use blueprint specifications."}

AI RESEARCH CONTEXT:
${researchContext}

SYNTHESIZED SOFTWARE BLUEPRINT:
${blueprintContext}

BUILD MAP STAGES:
${stagesSummary}

Return a valid JSON object matching this exact schema:
{
  "tasks": [
    {
      "id": "task_1",
      "title": "Specific, tailored task title for ${projectName}",
      "short_description": "1-2 sentence concrete summary of what this task builds.",
      "purpose": "Why this task is required for ${projectName}.",
      "user_value": "Concrete value delivered to the target user role.",
      "task_type": "DATABASE | AUTH | BACKEND | FRONTEND | FEATURE | INTEGRATION | SECURITY",
      "category": "Category name (e.g., Foundation, Identity, Core Workflow, Storefront, Checkout, AI Pipeline)",
      "priority": "CRITICAL | HIGH | MEDIUM",
      "status": "READY",
      "readiness": "READY",
      "complexity": "SMALL | MEDIUM | LARGE",
      "source": "BUILD_MAP",
      "stageNumber": 1,
      "dependencies": [],
      "blocked_by": [],
      "related_blueprint_items": ["Specific Blueprint Entity or Workflow names"],
      "related_engineering_items": ["DATABASE", "FRONTEND"],
      "related_decisions": ["Specific user answer or decision reflected in this task"],
      "related_assumptions": [],
      "affected_screens": ["Exact route paths from blueprint.screens affected by this task"],
      "affected_entities": ["Exact entity names from blueprint.dataEntities affected by this task"],
      "affected_apis": ["Exact API routes or Server Actions for this task"],
      "acceptance_criteria": [
        "Verifiable criterion 1 grounded in user answers",
        "Verifiable criterion 2",
        "Verifiable criterion 3"
      ],
      "change_boundaries": {
        "mustChange": ["Target files/directories in user project"],
        "mayChange": ["Supporting shared types/utilities"],
        "mustNotChange": ["Protected or unrelated modules"]
      }
    }
  ],
  "recommendation": {
    "recommendedTaskId": "task_1",
    "recommendedTaskTitle": "Exact title of task_1",
    "whyNext": "Plain-English architectural explanation of why this task must be built first.",
    "prerequisitesMet": true,
    "alternativeReadyTasks": [
      {
        "taskId": "task_2",
        "title": "Exact title of task_2",
        "reason": "Why this task can follow immediately or be planned next."
      }
    ]
  }
}

DO NOT include markdown code blocks in your response. Output raw JSON only.
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
      return runBuiltInTaskAgent(
        projectId,
        projectName,
        productType,
        buildMap,
        softwareBlueprint,
        qnas
      );
    }

    const data = await response.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) {
      return runBuiltInTaskAgent(
        projectId,
        projectName,
        productType,
        buildMap,
        softwareBlueprint,
        qnas
      );
    }

    const parsed = JSON.parse(rawContent);
    if (!Array.isArray(parsed.tasks) || parsed.tasks.length === 0) {
      return runBuiltInTaskAgent(
        projectId,
        projectName,
        productType,
        buildMap,
        softwareBlueprint,
        qnas
      );
    }

    const now = new Date().toISOString();
    const tasks: AigenstraTask[] = parsed.tasks.map((t: any, idx: number) => ({
      ...t,
      id: t.id || `task_${idx + 1}`,
      project_id: projectId,
      status: idx === 0 ? "READY" : t.status || "READY",
      readiness: t.readiness || "READY",
      dependencies: Array.isArray(t.dependencies) ? t.dependencies : [],
      blocked_by: Array.isArray(t.blocked_by) ? t.blocked_by : [],
      related_blueprint_items: Array.isArray(t.related_blueprint_items)
        ? t.related_blueprint_items
        : [],
      related_engineering_items: Array.isArray(t.related_engineering_items)
        ? t.related_engineering_items
        : [],
      related_decisions: Array.isArray(t.related_decisions) ? t.related_decisions : [],
      related_assumptions: Array.isArray(t.related_assumptions)
        ? t.related_assumptions
        : [],
      affected_screens: Array.isArray(t.affected_screens) ? t.affected_screens : [],
      affected_entities: Array.isArray(t.affected_entities) ? t.affected_entities : [],
      affected_apis: Array.isArray(t.affected_apis) ? t.affected_apis : [],
      acceptance_criteria: Array.isArray(t.acceptance_criteria)
        ? t.acceptance_criteria
        : [],
      change_boundaries: {
        mustChange: Array.isArray(t.change_boundaries?.mustChange)
          ? t.change_boundaries.mustChange
          : [],
        mayChange: Array.isArray(t.change_boundaries?.mayChange)
          ? t.change_boundaries.mayChange
          : [],
        mustNotChange: Array.isArray(t.change_boundaries?.mustNotChange)
          ? t.change_boundaries.mustNotChange
          : [],
      },
      created_at: now,
      updated_at: now,
    }));

    const firstTask = tasks[0];
    const recommendation: TaskRecommendation = parsed.recommendation || {
      recommendedTaskId: firstTask.id,
      recommendedTaskTitle: firstTask.title,
      whyNext: `Starting with "${firstTask.title}" establishes the foundational architecture required by subsequent tasks.`,
      prerequisitesMet: true,
      alternativeReadyTasks: tasks.slice(1, 3).map((t) => ({
        taskId: t.id,
        title: t.title,
        reason: t.purpose,
      })),
    };

    return { tasks, recommendation };
  } catch {
    return runBuiltInTaskAgent(
      projectId,
      projectName,
      productType,
      buildMap,
      softwareBlueprint,
      qnas
    );
  }
}

