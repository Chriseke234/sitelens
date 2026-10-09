import { getGeminiApiKey } from "./client";
import {
  AigenstraTask,
  ContextPack,
  SoftwareBlueprint,
  EngineeringBlueprint,
  CodingAgentProfile,
  CompiledPrompt,
  PromptSection,
  PromptQualityStatus,
} from "@/types";
import { optimizePromptSections } from "./prompt-optimizer";

/**
 * Returns specialized system directives tailored for the user's external coding agent.
 */
export function getAgentDirectives(agent: CodingAgentProfile): {
  prefix: string;
  roleDescription: string;
  executionRules: string[];
} {
  switch (agent) {
    case "Antigravity":
      return {
        prefix: `<!-- ANTIGRAVITY CODING AGENT DIRECTIVE -->
<!-- Inspect existing repository files before proposing or creating new files. -->
<!-- Maintain strict separation of concerns, zero emoji usage (SVG icons only), and full mobile responsiveness (360px+). -->`,
        roleDescription:
          "You are Google Antigravity, an advanced pair programming AI agent. Your mission is to implement production-ready code with extreme architectural discipline, following strict change boundaries and verifying with typechecks.",
        executionRules: [
          "Always inspect the existing codebase first to understand imports, types, and conventions.",
          "Strictly follow the MUST CHANGE, MAY CHANGE, and MUST NOT CHANGE boundaries.",
          "Always produce clean, well-commented, production-ready TypeScript code.",
          "Always ensure UI is 100% responsive across mobile (360px+), tablet, and desktop viewports.",
          "Use Lucide SVG icons exclusively; never output raw emojis.",
          "Avoid mixed frontend/backend logic; keep Server Actions separated from Client Components.",
          "Enforce Supabase Row-Level Security (RLS) on all database access.",
          "Verify implementation by running 'npm run typecheck' and confirming 0 errors.",
        ],
      };

    case "Claude Code":
      return {
        prefix: `CLAUDE CODE DIRECTIVE: High-autonomy codebase execution. Inspect workspace before editing.`,
        roleDescription:
          "You are Claude Code, an autonomous CLI coding agent. You implement features step-by-step with precision, test-driven validation, and minimal noise.",
        executionRules: [
          "Explore the relevant workspace files first.",
          "Keep edits tightly bounded to the specified files.",
          "Write modular TypeScript with comprehensive error handling.",
          "Execute local validation commands after completing changes.",
        ],
      };

    case "Cursor":
      return {
        prefix: `// @context: Execute in Cursor IDE with Next.js App Router and Supabase.
// Preserve all existing file structures, comments, and utility conventions.`,
        roleDescription:
          "You are a Senior Full-Stack Engineer working in Cursor IDE Composer. You deliver concise, type-safe, and modular code matching existing project patterns.",
        executionRules: [
          "Respect existing directory layouts and component exports.",
          "Use TypeScript strict mode with explicit return types.",
          "Implement defensive error states and loading skeletons for all async actions.",
        ],
      };

    case "Codex":
    case "Replit":
    case "Generic":
    default:
      return {
        prefix: `# IMPLEMENTATION SPECIFICATION FOR CODING AGENT`,
        roleDescription:
          "You are a Principal Software Engineer implementing a targeted production task within a modern Next.js and Supabase architecture.",
        executionRules: [
          "Follow the provided requirements, change boundaries, and acceptance criteria exactly.",
          "Implement zero-trust security and input validation on all routes.",
          "Deliver complete, working code without placeholder stubs.",
        ],
      };
  }
}

/**
 * Compiles a structured, 12-section production prompt for a task.
 */
export async function compileTaskPrompt(
  task: AigenstraTask,
  projectName: string,
  productDescription: string,
  targetAgent: CodingAgentProfile = "Antigravity",
  contextPack?: ContextPack | null,
  softwareBlueprint?: SoftwareBlueprint | null,
  engineeringBlueprint?: EngineeringBlueprint | null
): Promise<CompiledPrompt> {
  const apiKey = getGeminiApiKey();
  const agentMeta = getAgentDirectives(targetAgent);

  // Deterministic baseline compilation
  const baseSections = createDeterministicSections(
    task,
    projectName,
    productDescription,
    targetAgent,
    agentMeta,
    contextPack,
    softwareBlueprint,
    engineeringBlueprint
  );

  // Optimize and deduplicate sections
  const { optimizedSections, optimization } = optimizePromptSections(
    baseSections,
    task.change_boundaries
  );

  // Determine Prompt Quality & Readiness Status
  const qualityStatus = evaluatePromptQuality(task, contextPack, optimizedSections);
  const readinessScore = calculateReadinessScore(task, contextPack, qualityStatus);

  // Format full Markdown
  const markdownText = formatPromptMarkdown(agentMeta.prefix, optimizedSections);

  return {
    id: `prompt_${task.id}_${Date.now()}`,
    projectId: task.project_id,
    taskId: task.id,
    taskTitle: task.title,
    title: `${task.title} — ${targetAgent} Prompt`,
    targetAgent,
    sections: optimizedSections,
    markdownText,
    qualityStatus,
    readinessScore,
    optimization,
    version: 1,
    created_at: new Date().toISOString(),
  };
}

/**
 * Builds the 12 deterministic prompt sections from available intelligence.
 */
function createDeterministicSections(
  task: AigenstraTask,
  projectName: string,
  productDescription: string,
  targetAgent: CodingAgentProfile,
  agentMeta: ReturnType<typeof getAgentDirectives>,
  contextPack?: ContextPack | null,
  softwareBlueprint?: SoftwareBlueprint | null,
  engineeringBlueprint?: EngineeringBlueprint | null
): PromptSection[] {
  const mustChange = task.change_boundaries?.mustChange || ["app/", "components/"];
  const mayChange = task.change_boundaries?.mayChange || ["lib/", "types/"];
  const mustNotChange = task.change_boundaries?.mustNotChange || [
    "supabase/migrations/ (unless specified)",
    "middleware.ts",
    "Unrelated workspace dashboards",
  ];

  const includedCtx = contextPack?.includedItems || [];
  const contextBullets = includedCtx.length > 0
    ? includedCtx.map((c) => `- [${c.source}] ${c.title}: ${c.reason}`).join("\n")
    : `- Task Plan: ${task.title} (${task.purpose})\n- Category: ${task.category}`;

  const criteriaBullets = (task.acceptance_criteria && task.acceptance_criteria.length > 0)
    ? task.acceptance_criteria.map((a, i) => `${i + 1}. ${a}`).join("\n")
    : `1. Feature executes successfully satisfying user value: "${task.user_value}"\n2. Clean TypeScript with 0 compilation errors.\n3. Responsive layout verified on mobile (360px+) and desktop.`;

  return [
    {
      key: "ROLE",
      title: "1. ROLE & OPERATING DIRECTIVE",
      purpose: "Defines the exact role, pair programming stance, and agent guidelines.",
      content: `${agentMeta.roleDescription}\n\nKey Directives:\n${agentMeta.executionRules.map((r, i) => `${i + 1}. ${r}`).join("\n")}`,
    },
    {
      key: "OBJECTIVE",
      title: "2. PRIMARY OBJECTIVE",
      purpose: "States the exact, bounded deliverable of this coding task.",
      content: `Target Task: "${task.title}"\nPurpose: ${task.purpose}\nUser Value: ${task.user_value}\nComplexity Level: ${task.complexity || "MEDIUM"} | Category: ${task.category}`,
    },
    {
      key: "PROJECT_CONTEXT",
      title: "3. PROJECT CONTEXT & ARCHITECTURE",
      purpose: "Provides project-level background, user problem, and tech stack.",
      content: [
        `Project Name: ${projectName}`,
        `Product Description: ${productDescription}`,
        softwareBlueprint?.overview?.problemStatement
          ? `Problem Solved: ${softwareBlueprint.overview.problemStatement}`
          : null,
        softwareBlueprint?.overview?.targetOutcome
          ? `Target Success Outcome: ${softwareBlueprint.overview.targetOutcome}`
          : null,
        softwareBlueprint?.usersRoles?.[0]?.roleName
          ? `Target Customer / Role: ${softwareBlueprint.usersRoles[0].roleName}`
          : null,
        `Tech Stack: ${contextPack?.repository?.detectedStack || "Next.js 15 (App Router, Server Components), TypeScript, Tailwind CSS, Supabase PostgreSQL with Row Level Security (RLS)"}`,
        `Design Constraints: SVG Lucide icons exclusively (zero emojis), fully responsive (360px+ mobile).`,
      ]
        .filter(Boolean)
        .join("\n"),
    },
    {
      key: "CURRENT_STATE",
      title: "4. CURRENT STATE & PRESERVATION RULES",
      purpose: "Ensures existing working systems are not broken or regressed.",
      content: contextPack?.repository?.existingCapabilitiesToPreserve && contextPack.repository.existingCapabilitiesToPreserve.length > 0
        ? `Existing Capabilities Detected in Codebase:\n${contextPack.repository.existingCapabilitiesToPreserve.map((c) => `- ${c}`).join("\n")}\n\nPreservation Directive: Extend or build upon these existing patterns. DO NOT recreate or introduce conflicting secondary implementations.`
        : `Active project baseline with authentication and navigation in place.\nPreservation Rule: Do not remove or alter existing working features, routes, or database configurations outside the scope of this task.`,
    },
    {
      key: "RELEVANT_CONTEXT",
      title: "5. RELEVANT CONTEXT & DEPENDENCIES",
      purpose: "Selected architectural context, schemas, and screens needed for this task.",
      content: `Selected Context Items:\n${contextBullets}\n\nAffected Screens: ${task.affected_screens && task.affected_screens.length > 0 ? task.affected_screens.join(", ") : (softwareBlueprint?.screens?.map((s) => s.routePath).join(", ") || "Standard App Router layout")}\nAffected Entities: ${task.affected_entities && task.affected_entities.length > 0 ? task.affected_entities.join(", ") : (softwareBlueprint?.dataEntities?.map((e) => e.entityName).join(", ") || "UserProfile")}\nAffected APIs: ${task.affected_apis && task.affected_apis.length > 0 ? task.affected_apis.join(", ") : "REST / Server Actions"}`,
    },
    {
      key: "REQUIREMENTS",
      title: "6. FUNCTIONAL & UX REQUIREMENTS",
      purpose: "Step-by-step functional scope, UI states, and responsive viewports.",
      content: `1. Implement the core workflow for "${task.title}".\n2. Provide complete UI states: Empty state with actionable callout, Loading skeleton, Error boundary with retry, and Success feedback.\n3. Ensure fluid responsiveness on mobile viewports (360px minimum width), tablet, and desktop.\n4. Strict separation of concerns: Client components handle UI interactivity, while Server Actions / Route Handlers execute database mutations with owner validation.`,
    },
    {
      key: "CHANGE_BOUNDARIES",
      title: "7. CHANGE BOUNDARIES & CONSTRAINTS",
      purpose: "Explicitly defines what the coding agent MUST, MAY, and MUST NOT modify.",
      content: `MUST CHANGE (Target modifications only):\n${mustChange.map((m) => `- ${m}`).join("\n")}\n\nMAY CHANGE (Supporting types/helpers if needed):\n${mayChange.map((m) => `- ${m}`).join("\n")}\n\nMUST NOT CHANGE (Protected systems):\n${mustNotChange.map((m) => `- ${m}`).join("\n")}`,
    },
    {
      key: "SECURITY",
      title: "8. SECURITY & DATA INTEGRITY",
      purpose: "Enforces data safety, authorization, and input validation.",
      content: `1. Enforce server-side user authentication on all Server Actions and Route Handlers.\n2. Verify project/entity ownership server-side to prevent Insecure Direct Object References (IDOR).\n3. Validate and sanitize all incoming payloads with Zod schemas.\n4. Never log or leak private API keys, secrets, or passwords.`,
    },
    {
      key: "EDGE_CASES",
      title: "9. EDGE CASES & ERROR HANDLING",
      purpose: "Anticipates network drops, expired sessions, and validation failures.",
      content: `1. Expired or invalid user session during form submission: Display clear authentication notification.\n2. Network timeout / offline state: Graceful error banner with retry trigger.\n3. Malformed payload or validation error: Inline field error indicators without full page refresh.`,
    },
    {
      key: "ACCEPTANCE_CRITERIA",
      title: "10. ACCEPTANCE CRITERIA",
      purpose: "Clear, verifiable checklist to determine task completion.",
      content: criteriaBullets,
    },
    {
      key: "TESTING_EXPECTATIONS",
      title: "11. TESTING & VERIFICATION EXPECTATIONS",
      purpose: "Instructions to verify code health before concluding work.",
      content: `1. Type Safety: Run 'npm run typecheck' or 'npx tsc --noEmit' to ensure 0 TypeScript compiler errors.\n2. Build Verification: Run 'npm run build' to confirm clean Next.js bundle compilation.\n3. Verify authorization logic blocks unauthorized access attempts with 401/403.`,
    },
    {
      key: "EXPECTED_OUTPUT",
      title: "12. EXPECTED OUTPUT REPORT",
      purpose: "Format instructions for the coding agent's final delivery summary.",
      content: `At the conclusion of your response, provide:\n1. A concise bulleted summary of all created and modified files.\n2. A brief description of security measures implemented (e.g. RLS, validation).\n3. Confirmation that 'npm run typecheck' and 'npm run build' succeeded.`,
    },
  ];
}

/**
 * Evaluates the quality status of the compiled prompt.
 */
function evaluatePromptQuality(
  task: AigenstraTask,
  contextPack?: ContextPack | null,
  sections?: PromptSection[]
): PromptQualityStatus {
  if (!task.title || !task.purpose) {
    return "NOT_READY";
  }

  if (task.readiness === "BLOCKED" || task.readiness === "NEEDS_DECISION") {
    return "NEEDS_REVIEW";
  }

  if (task.related_assumptions && task.related_assumptions.length > 0) {
    return "READY_WITH_ASSUMPTIONS";
  }

  return "READY";
}

/**
 * Computes an overall readiness score (0–100%).
 */
function calculateReadinessScore(
  task: AigenstraTask,
  contextPack?: ContextPack | null,
  status?: PromptQualityStatus
): number {
  let score = 50;

  if (task.acceptance_criteria && task.acceptance_criteria.length > 0) score += 20;
  if (task.change_boundaries?.mustChange?.length > 0) score += 15;
  if (contextPack && contextPack.includedItems?.length > 0) score += 15;

  if (status === "NEEDS_REVIEW") score = Math.min(score, 65);
  if (status === "NOT_READY") score = Math.min(score, 40);

  return Math.min(100, score);
}

/**
 * Renders the full structured markdown document for clipboard copy or export.
 */
export function formatPromptMarkdown(
  agentPrefix: string,
  sections: PromptSection[]
): string {
  const parts = [agentPrefix, "---"];

  for (const sec of sections) {
    parts.push(`\n## ${sec.title}\n\n${sec.content}\n`);
  }

  return parts.join("\n").trim();
}
