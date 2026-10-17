import { getGeminiApiKey } from "./client";
import { getProductTypeProfile } from "./product-type-profiles";
import {
  AigenstraTask,
  ContextPack,
  SoftwareBlueprint,
  EngineeringBlueprint,
  CodingAgentProfile,
  CompiledPrompt,
  DiscoveryQnA,
  PromptSection,
  PromptQualityStatus,
} from "@/types";
import {
  optimizePromptSections,
  validateTaskQualityControls,
} from "./prompt-optimizer";

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
          "Follow the Shared Product Development Standard: Distinguish between intended, implemented, and verified states. Never report a feature as complete until verified with tests or typechecks.",
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
          "Follow the Shared Product Development Standard: Differentiate between intended, implemented, and verified states.",
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
          "Follow the Shared Product Development Standard: Never treat planned features as implemented without code evidence.",
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
          "Follow the Shared Product Development Standard: Distinguish intended requirements from verified functionality.",
          "Implement zero-trust security and input validation on all routes.",
          "Deliver complete, working code without placeholder stubs.",
        ],
      };
  }
}

/**
 * Compiles a structured, 12-section production prompt in real time via Gemini,
 * grounded strictly in the user's Discovery Q&A answers, AI Research, Software Blueprint, and Task spec.
 */
export async function compileTaskPrompt(
  task: AigenstraTask,
  projectName: string,
  productDescription: string,
  targetAgent: CodingAgentProfile = "Antigravity",
  contextPack?: ContextPack | null,
  softwareBlueprint?: SoftwareBlueprint | null,
  engineeringBlueprint?: EngineeringBlueprint | null,
  qnas: DiscoveryQnA[] = [],
  researchDoc?: any,
  productType?: string
): Promise<CompiledPrompt> {
  const apiKey = getGeminiApiKey();
  const agentMeta = getAgentDirectives(targetAgent);
  const resolvedProductType =
    productType || softwareBlueprint?.overview?.productType || "Web App";
  const profile = getProductTypeProfile(resolvedProductType);
  const profileGuidance = `${profile.architecturalSummary} | UX Priorities: ${profile.uxAndConversionPriorities.join("; ")} | Security Priorities: ${profile.securityAndBackendPriorities.join("; ")}`;

  let synthesizedSections: PromptSection[] | null = null;

  if (apiKey) {
    synthesizedSections = await synthesizeRealtimeSectionsWithAI(
      apiKey,
      task,
      projectName,
      productDescription,
      profile.label,
      profileGuidance,
      targetAgent,
      agentMeta,
      contextPack,
      softwareBlueprint,
      engineeringBlueprint,
      qnas,
      researchDoc
    );
  }

  const baseSections =
    synthesizedSections ||
    buildGroundedSectionsFromSpec(
      task,
      projectName,
      productDescription,
      profile.label,
      profileGuidance,
      targetAgent,
      agentMeta,
      contextPack,
      softwareBlueprint,
      engineeringBlueprint,
      qnas,
      researchDoc
    );

  // Optimize and deduplicate sections
  const { optimizedSections, optimization } = optimizePromptSections(
    baseSections,
    task.change_boundaries
  );

  // Determine Prompt Quality & Readiness Status
  const qualityStatus = evaluatePromptQuality(
    task,
    contextPack,
    optimizedSections,
    resolvedProductType,
    qnas
  );
  const readinessScore = calculateReadinessScore(
    task,
    contextPack,
    qualityStatus,
    qnas,
    resolvedProductType
  );

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
 * Synthesizes the 12 prompt sections in real time using Gemini 2.5 Flash so every
 * instruction, database column, route path, and UX requirement is tailored to the user's exact product.
 */
async function synthesizeRealtimeSectionsWithAI(
  apiKey: string,
  task: AigenstraTask,
  projectName: string,
  productDescription: string,
  productTypeName: string,
  promptGuidance: string,
  targetAgent: CodingAgentProfile,
  agentMeta: ReturnType<typeof getAgentDirectives>,
  contextPack?: ContextPack | null,
  softwareBlueprint?: SoftwareBlueprint | null,
  engineeringBlueprint?: EngineeringBlueprint | null,
  qnas: DiscoveryQnA[] = [],
  researchDoc?: any
): Promise<PromptSection[] | null> {
  const answeredSpecs = qnas
    .filter((q) => q.answer && q.answer.trim().length > 0)
    .map(
      (q, i) =>
        `${i + 1}. [${q.category || "SPEC"}] Q: ${q.question}\n   Confirmed Answer: ${q.answer}`
    )
    .join("\n");

  const relevantScreens =
    softwareBlueprint?.screens?.filter(
      (s) =>
        !task.affected_screens?.length ||
        task.affected_screens.includes(s.routePath) ||
        task.affected_screens.includes(s.screenName)
    ) ||
    softwareBlueprint?.screens ||
    [];

  const relevantEntities =
    softwareBlueprint?.dataEntities?.filter(
      (e) =>
        !task.affected_entities?.length ||
        task.affected_entities.includes(e.entityName)
    ) ||
    softwareBlueprint?.dataEntities ||
    [];

  const prompt = `
System Instruction:
You are the Principal Prompt Compiler for Aigenstra.
Compile a deeply detailed, real-time 12-section implementation prompt for the target coding agent (${targetAgent}) to execute the specified task for "${projectName}" (${productTypeName}).

CRITICAL RULES:
1. ZERO PLACEHOLDERS OR GENERIC BOILERPLATE: Every section must explicitly incorporate the user's confirmed discovery answers, specific entity fields, exact screen route paths, and business rules from the blueprint.
2. PRODUCT-TYPE GUIDANCE (${productTypeName}): ${promptGuidance}
3. AGENT DIRECTIVES (${targetAgent}):
   - Role: ${agentMeta.roleDescription}
   - Rules: ${agentMeta.executionRules.join(" | ")}
4. Produce all 12 sections in order with the exact keys listed below:
   - ROLE ("1. ROLE & OPERATING DIRECTIVE")
   - OBJECTIVE ("2. PRIMARY OBJECTIVE")
   - PROJECT_CONTEXT ("3. PROJECT CONTEXT & ARCHITECTURE")
   - CURRENT_STATE ("4. CURRENT STATE & PRESERVATION RULES")
   - RELEVANT_CONTEXT ("5. RELEVANT CONTEXT & DEPENDENCIES")
   - REQUIREMENTS ("6. FUNCTIONAL & UX REQUIREMENTS")
   - CHANGE_BOUNDARIES ("7. CHANGE BOUNDARIES & CONSTRAINTS")
   - SECURITY ("8. SECURITY & DATA INTEGRITY")
   - EDGE_CASES ("9. EDGE CASES & ERROR HANDLING")
   - ACCEPTANCE_CRITERIA ("10. ACCEPTANCE CRITERIA")
   - TESTING_EXPECTATIONS ("11. TESTING & VERIFICATION EXPECTATIONS")
   - EXPECTED_OUTPUT ("12. EXPECTED OUTPUT REPORT")

PROJECT & TASK SPECIFICATION:
- Project Name: ${projectName}
- Product Type: ${productTypeName}
- Product Description: ${productDescription}
- Task Title: ${task.title}
- Task Purpose: ${task.purpose}
- User Value: ${task.user_value}
- Task Category / Type: ${task.category} (${task.task_type})
- Affected Screens: ${(task.affected_screens || []).join(", ") || "See blueprint screens"}
- Affected Entities: ${(task.affected_entities || []).join(", ") || "See blueprint entities"}
- Affected APIs: ${(task.affected_apis || []).join(", ") || "Server Actions / Route Handlers"}
- Must Change: ${(task.change_boundaries?.mustChange || []).join(", ")}
- May Change: ${(task.change_boundaries?.mayChange || []).join(", ")}
- Must Not Change: ${(task.change_boundaries?.mustNotChange || []).join(", ")}
- Acceptance Criteria: ${(task.acceptance_criteria || []).join(" | ")}

CONFIRMED USER DISCOVERY DECISIONS:
${answeredSpecs || "Follow blueprint specifications."}

RELEVANT BLUEPRINT SCREENS:
${JSON.stringify(relevantScreens, null, 2)}

RELEVANT BLUEPRINT DATA ENTITIES:
${JSON.stringify(relevantEntities, null, 2)}

BUSINESS RULES & WORKFLOWS:
${JSON.stringify(
  {
    workflows: softwareBlueprint?.workflows || [],
    businessRules: softwareBlueprint?.businessRules || [],
  },
  null,
  2
)}

Return a valid JSON object matching this exact schema:
{
  "sections": [
    {
      "key": "ROLE",
      "title": "1. ROLE & OPERATING DIRECTIVE",
      "purpose": "Defines the exact role, pair programming stance, and agent guidelines.",
      "content": "Multi-line detailed markdown content..."
    }
  ]
}

DO NOT include markdown code blocks around the JSON response. Output raw JSON only.
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
      return null;
    }

    const data = await response.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) return null;

    const parsed = JSON.parse(rawContent);
    if (!Array.isArray(parsed.sections) || parsed.sections.length < 8) {
      return null;
    }

    return parsed.sections;
  } catch (err) {
    console.warn("Real-time AI prompt section synthesis error:", err);
    return null;
  }
}

/**
 * Builds the 12 prompt sections directly from the synthesized blueprint, user answers, and task spec.
 */
function buildGroundedSectionsFromSpec(
  task: AigenstraTask,
  projectName: string,
  productDescription: string,
  productTypeName: string,
  promptGuidance: string,
  targetAgent: CodingAgentProfile,
  agentMeta: ReturnType<typeof getAgentDirectives>,
  contextPack?: ContextPack | null,
  softwareBlueprint?: SoftwareBlueprint | null,
  engineeringBlueprint?: EngineeringBlueprint | null,
  qnas: DiscoveryQnA[] = [],
  researchDoc?: any
): PromptSection[] {
  const mustChange = task.change_boundaries?.mustChange || [];
  const mayChange = task.change_boundaries?.mayChange || [];
  const mustNotChange = task.change_boundaries?.mustNotChange || [];

  const confirmedDecisions = qnas
    .filter((q) => q.answer && q.answer.trim().length > 0)
    .map((q) => `- **${q.category || "Decision"}** (${q.question}): ${q.answer}`)
    .join("\n");

  const includedCtx = contextPack?.includedItems || [];
  const contextBullets =
    includedCtx.length > 0
      ? includedCtx.map((c) => `- [${c.source}] ${c.title}: ${c.reason}`).join("\n")
      : `- Task Objective: ${task.title} (${task.purpose})\n- Category: ${task.category}`;

  const entitySpecs = (softwareBlueprint?.dataEntities || [])
    .filter(
      (e) =>
        !task.affected_entities?.length ||
        task.affected_entities.includes(e.entityName)
    )
    .map(
      (e) =>
        `- **${e.entityName}** (${e.simpleDescription}): Fields: ${(e.attributes || []).map((a) => `${a.name}:${a.type}`).join(", ")}`
    )
    .join("\n");

  const screenSpecs = (softwareBlueprint?.screens || [])
    .filter(
      (s) =>
        !task.affected_screens?.length ||
        task.affected_screens.includes(s.routePath) ||
        task.affected_screens.includes(s.screenName)
    )
    .map(
      (s) =>
        `- **${s.screenName}** (\`${s.routePath}\`): ${s.simplePurpose} — Components: ${s.keyComponents.join(", ")}`
    )
    .join("\n");

  const criteriaBullets =
    task.acceptance_criteria && task.acceptance_criteria.length > 0
      ? task.acceptance_criteria.map((a, i) => `${i + 1}. ${a}`).join("\n")
      : `1. Feature executes "${task.title}" satisfying user value: "${task.user_value}"\n2. Clean TypeScript with 0 compilation errors.\n3. Responsive layout verified across mobile (360px+), tablet, and desktop.`;

  const hasRepoContext = Boolean(
    contextPack?.repository?.detectedStack ||
    contextPack?.repository?.existingCapabilitiesToPreserve?.length
  );

  const repoInspectionDirective = !hasRepoContext
    ? `\n\n[MANDATORY REPOSITORY INSPECTION PROTOCOL]:\nTarget repository access has not been pre-indexed. You MUST inspect the workspace files, directory layout, package.json dependencies, and Supabase client setup first, and report what exists before creating or editing files. Do not invent arbitrary file paths.`
    : "";

  const isHighRisk =
    task.complexity === "LARGE" ||
    task.task_type === "DATABASE" ||
    task.task_type === "AUTH" ||
    task.task_type === "SECURITY";

  const stagedProtocol = isHighRisk
    ? `\n\n### STAGED EXECUTION PROTOCOL (High-Risk Architectural Change):\nStage 1: Investigate & Inspect -> Examine existing workspace files, types, and dependencies before modifying code.\nStage 2: Architectural Plan -> Declare the exact file diffs and schema modifications matching MUST/MAY CHANGE boundaries.\nStage 3: Implement & Guard -> Write clean, production-ready TypeScript following zero-trust security and responsive guidelines.\nStage 4: Test & Verify -> Execute 'npx tsc --noEmit' and run verification test cases against acceptance criteria.`
    : "";

  const securityGuidelines = [
    "1. Enforce server-side authentication and authorization on all protected routes and mutations.",
    productTypeName === "SaaS"
      ? "2. Enforce Supabase Row-Level Security (RLS) with strict tenant isolation (auth.uid() = user_id or organization_id membership subquery). Never trust client-submitted roles or prices. Automated negative test must assert 403 on cross-tenant access."
      : productTypeName === "E-commerce"
      ? "2. Enforce atomic inventory decrements (or row locking) to prevent overselling under high concurrency. Recalculate all subtotals and discounts server-side. Payment webhooks must verify HMAC signatures and enforce idempotency via processed_webhook_events."
      : "2. Verify resource ownership server-side via Supabase Row-Level Security (RLS) to prevent IDOR.",
    "3. Validate and sanitize all incoming inputs with strict Zod schema validation.",
    "4. Never expose service-role keys or private credentials to the client bundle.",
  ].join("\n");

  return [
    {
      key: "ROLE",
      title: "1. ROLE & OPERATING DIRECTIVE",
      purpose: "Defines the exact role, pair programming stance, and agent guidelines.",
      content: `${agentMeta.roleDescription}\n\nProduct Type Focus (${productTypeName}):\n${promptGuidance}\n\nKey Directives:\n${agentMeta.executionRules.map((r, i) => `${i + 1}. ${r}`).join("\n")}`,
    },
    {
      key: "OBJECTIVE",
      title: "2. PRIMARY OBJECTIVE",
      purpose: "States the exact, bounded deliverable of this coding task.",
      content: `Target Task: "${task.title}"\nSummary: ${task.short_description}\nPurpose: ${task.purpose}\nUser Value: ${task.user_value}\nComplexity Level: ${task.complexity || "MEDIUM"} | Category: ${task.category} (${task.task_type})`,
    },
    {
      key: "PROJECT_CONTEXT",
      title: "3. PROJECT CONTEXT & ARCHITECTURE",
      purpose: "Provides project-level background, confirmed discovery answers, and tech stack.",
      content: [
        `Project Name: ${projectName} (${productTypeName})`,
        `Product Description: ${productDescription}`,
        softwareBlueprint?.overview?.problemStatement
          ? `Problem Solved: ${softwareBlueprint.overview.problemStatement}`
          : null,
        softwareBlueprint?.overview?.targetOutcome
          ? `Target Outcome: ${softwareBlueprint.overview.targetOutcome}`
          : null,
        softwareBlueprint?.usersRoles?.length
          ? `User Roles: ${softwareBlueprint.usersRoles.map((r) => `${r.roleName} (${r.simpleDescription})`).join("; ")}`
          : null,
        confirmedDecisions
          ? `\nConfirmed User Architecture & Product Decisions:\n${confirmedDecisions}`
          : null,
        `\nTech Stack: ${contextPack?.repository?.detectedStack || "Next.js 15 (App Router, Server Components), TypeScript, Tailwind CSS, Supabase (PostgreSQL + RLS)"}`,
        `Design Constraints: SVG Lucide icons exclusively (zero emojis), fully responsive (360px+ mobile, tablet, desktop).`,
      ]
        .filter(Boolean)
        .join("\n"),
    },
    {
      key: "CURRENT_STATE",
      title: "4. CURRENT STATE & PRESERVATION RULES",
      purpose: "Ensures existing working systems are not broken or regressed.",
      content:
        (contextPack?.repository?.existingCapabilitiesToPreserve &&
        contextPack.repository.existingCapabilitiesToPreserve.length > 0
          ? `Existing Capabilities Detected in Codebase:\n${contextPack.repository.existingCapabilitiesToPreserve.map((c) => `- ${c}`).join("\n")}\n\nPreservation Directive: Extend or build upon these existing patterns. DO NOT recreate or introduce conflicting secondary implementations.`
          : `Active ${projectName} baseline (${productTypeName}).\nPreservation Rule: Do not remove or alter existing working features, routes, or database configurations outside the scope of "${task.title}".`) +
        repoInspectionDirective,
    },
    {
      key: "RELEVANT_CONTEXT",
      title: "5. RELEVANT CONTEXT & DEPENDENCIES",
      purpose: "Selected architectural context, schemas, and screens needed for this task.",
      content: [
        `Selected Context Items:\n${contextBullets}`,
        screenSpecs ? `\nTarget Screens & Components:\n${screenSpecs}` : null,
        entitySpecs ? `\nTarget Data Entities & Fields:\n${entitySpecs}` : null,
        `Affected APIs / Actions: ${task.affected_apis && task.affected_apis.length > 0 ? task.affected_apis.join(", ") : "Server Actions / Route Handlers"}`,
      ]
        .filter(Boolean)
        .join("\n"),
    },
    {
      key: "REQUIREMENTS",
      title: "6. FUNCTIONAL & UX REQUIREMENTS",
      purpose: "Step-by-step functional scope, UI states, and responsive viewports.",
      content: [
        `1. Implement "${task.title}": ${task.short_description}`,
        softwareBlueprint?.businessRules?.length
          ? `2. Enforce Product Business Rules:\n${softwareBlueprint.businessRules.map((b) => `   - ${b.ruleStatement}: ${b.reason}`).join("\n")}`
          : null,
        `3. Provide complete UI states: Empty state with clear action, Loading skeleton, Error boundary with retry, and real-time feedback.`,
        `4. Ensure fluid responsiveness across mobile viewports (360px+), tablet (768px+), and desktop (1280px+).`,
        `5. Maintain strict separation between frontend UI components and backend Supabase data access.`,
        stagedProtocol,
      ]
        .filter(Boolean)
        .join("\n"),
    },
    {
      key: "CHANGE_BOUNDARIES",
      title: "7. CHANGE BOUNDARIES & CONSTRAINTS",
      purpose: "Explicitly defines what the coding agent MUST, MAY, and MUST NOT modify.",
      content: `MUST CHANGE (Target modifications only):\n${mustChange.length > 0 ? mustChange.map((m) => `- ${m}`).join("\n") : "- Target files required for this task"}\n\nMAY CHANGE (Supporting types/helpers if needed):\n${mayChange.length > 0 ? mayChange.map((m) => `- ${m}`).join("\n") : "- Shared TypeScript interfaces and helpers"}\n\nMUST NOT CHANGE (Protected systems):\n${mustNotChange.length > 0 ? mustNotChange.map((m) => `- ${m}`).join("\n") : "- Unrelated routes, schemas, and layout shells"}`,
    },
    {
      key: "SECURITY",
      title: "8. SECURITY & DATA INTEGRITY",
      purpose: "Enforces data safety, authorization, and input validation.",
      content: securityGuidelines,
    },
    {
      key: "EDGE_CASES",
      title: "9. EDGE CASES & ERROR HANDLING",
      purpose: "Anticipates network drops, expired sessions, and validation failures.",
      content: `1. Unauthorized or expired session: Return clear status and redirect/prompt appropriately.\n2. Network failure or upstream error: Render actionable error state with retry capability.\n3. Validation failure or duplicate submission: Prevent double-submit and highlight specific invalid fields inline.`,
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
      content: `1. Type Safety: Run 'npm run typecheck' or 'npx tsc --noEmit' to ensure 0 TypeScript compiler errors.\n2. Lint & Build Verification: Run 'npm run lint' and 'npm run build' to confirm clean compilation.\n3. Responsive & Security Check: Verify mobile viewport rendering and access control boundaries.`,
    },
    {
      key: "EXPECTED_OUTPUT",
      title: "12. EXPECTED OUTPUT REPORT",
      purpose: "Format instructions for the coding agent's final delivery summary.",
      content: `At the conclusion of your response, provide:\n1. A concise bulleted summary of all created and modified files.\n2. How each confirmed user decision and acceptance criterion for "${task.title}" was satisfied.\n3. Confirmation that typecheck and lint passed with 0 errors.`,
    },
  ];
}

/**
 * Evaluates the quality status of the compiled prompt.
 */
function evaluatePromptQuality(
  task: AigenstraTask,
  contextPack?: ContextPack | null,
  sections?: PromptSection[],
  productType: string = "SaaS",
  qnas: DiscoveryQnA[] = []
): PromptQualityStatus {
  if (!task.title || !task.purpose) {
    return "NOT_READY";
  }

  const qc = validateTaskQualityControls(
    task,
    productType,
    qnas.map((q) => ({ question: q.question, answer: q.answer || "" }))
  );

  if (!qc.isReadyForPromptCompilation) {
    return "NEEDS_REVIEW";
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
 * Computes an overall readiness score (0–100%) grounded in deterministic quality controls.
 */
function calculateReadinessScore(
  task: AigenstraTask,
  contextPack?: ContextPack | null,
  status?: PromptQualityStatus,
  qnas: DiscoveryQnA[] = [],
  productType: string = "SaaS"
): number {
  const qc = validateTaskQualityControls(
    task,
    productType,
    qnas.map((q) => ({ question: q.question, answer: q.answer || "" }))
  );

  let score = qc.score;
  if (status === "NEEDS_REVIEW") score = Math.min(score, 65);
  if (status === "NOT_READY") score = Math.min(score, 40);

  return Math.min(100, Math.max(20, score));
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
