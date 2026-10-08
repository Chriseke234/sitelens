import { getGeminiApiKey } from "./client";
import {
  AigenstraTask,
  ContextPack,
  ContextPackItem,
  ContextPackExclusion,
  EngineeringBlueprint,
  SoftwareBlueprint,
  TaskRepositoryContext,
} from "@/types";

/**
 * Curates a structured, bounded Context Pack for a specific coding task,
 * explaining why specific context is included and explicitly documenting excluded items.
 */
export async function generateTaskContextPack(
  task: AigenstraTask,
  softwareBlueprint: SoftwareBlueprint,
  engineeringBlueprint?: EngineeringBlueprint | null,
  repositoryContext?: TaskRepositoryContext | null
): Promise<ContextPack> {
  const apiKey = getGeminiApiKey();

  const fallback = createDeterministicContextPack(
    task,
    softwareBlueprint,
    engineeringBlueprint,
    repositoryContext
  );

  if (!apiKey) {
    return fallback;
  }

  const prompt = `
System Instruction:
You are the Principal Context Selection Architect for Aigenstra.
Your mission is to curate the minimal, sufficient Context Pack for an external AI coding agent to execute a specific task.

CRITICAL RULES:
1. The coding agent must receive the SMALLEST SUFFICIENT set of relevant context. Do NOT dump the entire project.
2. For every included item, explain the specific 'reason' it is needed.
3. For every excluded item, explain why it was intentionally left out ('reason').
4. Enforce change boundaries: specify 'mustChange' and 'mustNotChange'.

Task Details:
- Title: ${task.title}
- Purpose: ${task.purpose}
- Category: ${task.category} (${task.task_type})
- Affected Screens: ${task.affected_screens?.join(", ") || "None"}
- Affected Entities: ${task.affected_entities?.join(", ") || "None"}
- Acceptance Criteria: ${task.acceptance_criteria?.join("; ") || "Standard execution"}

Return a valid JSON object matching this schema:
{
  "summary": "Brief 1-sentence rationale of what information was selected for this task.",
  "includedItems": [
    {
      "id": "ctx_1",
      "source": "Task Definition",
      "title": "Task Scope & Acceptance Criteria",
      "content": "Specific deliverables and verification requirements for this task.",
      "reason": "Direct specification of what the coding agent must build.",
      "relevance": "DIRECT",
      "priority": 1
    },
    {
      "id": "ctx_2",
      "source": "Software Blueprint",
      "title": "Data Entity & Ownership Schema",
      "content": "PostgreSQL schema attributes and foreign key definitions.",
      "reason": "Needed to construct accurate database models without guessing field names.",
      "relevance": "DEPENDENCY",
      "priority": 2
    }
  ],
  "excludedItems": [
    {
      "id": "ex_1",
      "source": "Admin Tools",
      "title": "Admin Moderation Console",
      "reason": "Unrelated to the customer authentication and workspace flow."
    },
    {
      "id": "ex_2",
      "source": "Integrations",
      "title": "Payment Provider Setup",
      "reason": "Payment processing is not modified in this task."
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
      console.warn("Gemini API error during context curation, using deterministic fallback");
      return fallback;
    }

    const data = await response.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) {
      return fallback;
    }

    const parsed = JSON.parse(rawContent);
    const includedItems: ContextPackItem[] = Array.isArray(parsed.includedItems) && parsed.includedItems.length > 0
      ? parsed.includedItems
      : fallback.includedItems;

    const excludedItems: ContextPackExclusion[] = Array.isArray(parsed.excludedItems) && parsed.excludedItems.length > 0
      ? parsed.excludedItems
      : fallback.excludedItems;

    const totalChars = includedItems.reduce((acc, it) => acc + (it.content?.length || 0), 0);

    return {
      id: `ctx_pack_${task.id}`,
      taskId: task.id,
      taskTitle: task.title,
      summary: parsed.summary || fallback.summary,
      includedItems,
      excludedItems,
      constraints: task.change_boundaries || fallback.constraints,
      acceptanceCriteria: task.acceptance_criteria || fallback.acceptanceCriteria,
      securityConsiderations: [
        "Enforce Row-Level Security (RLS) on all database queries",
        "Validate inputs server-side with Zod schemas",
        "Never log or expose sensitive authentication tokens",
      ],
      testingRequirements: [
        "Verify happy path execution satisfies acceptance criteria",
        "Verify unauthorized access is blocked with 401/403",
      ],
      estimatedSize: {
        itemCount: includedItems.length,
        characterCount: totalChars,
        label: totalChars < 4000 ? "Compact Context (~1-2k tokens)" : "Standard Context (~3-4k tokens)",
      },
      isStale: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  } catch (err) {
    console.error("Failed to generate task context pack via AI:", err);
    return fallback;
  }
}

/**
 * Deterministic context pack generator.
 */
function createDeterministicContextPack(
  task: AigenstraTask,
  softwareBlueprint: SoftwareBlueprint,
  engineeringBlueprint?: EngineeringBlueprint | null,
  repositoryContext?: TaskRepositoryContext | null
): ContextPack {
  const affectedEntities = task.affected_entities || [];
  const affectedScreens = task.affected_screens || [];

  const includedItems: ContextPackItem[] = [
    {
      id: "ctx_task_brief",
      source: "Task Plan",
      title: "Task Brief & Requirements",
      content: `${task.title}: ${task.purpose} User Value: ${task.user_value}`,
      reason: "Provides the core implementation objective for the coding agent.",
      relevance: "DIRECT",
      priority: 1,
    },
    {
      id: "ctx_acceptance",
      source: "Acceptance Criteria",
      title: "Observable Acceptance Criteria",
      content: task.acceptance_criteria.join("\n- "),
      reason: "Defines the exact verification requirements to declare this task complete.",
      relevance: "DIRECT",
      priority: 1,
    },
  ];

  // Include relevant repository files if available
  if (repositoryContext && repositoryContext.relevantFiles.length > 0) {
    for (const rf of repositoryContext.relevantFiles) {
      includedItems.push({
        id: `ctx_repo_${rf.filePath.replace(/[^a-zA-Z0-9]/g, "_")}`,
        source: "Repository Intelligence",
        title: `Existing File: ${rf.filePath}`,
        content: `Classification: ${rf.fileType}. Context: ${rf.reason}`,
        reason: rf.reason,
        relevance: rf.relevance === "DIRECT" ? "DIRECT" : "SUPPORTING",
        priority: rf.relevance === "DIRECT" ? 1 : 2,
      });
    }
  }

  // Include affected entities
  if (affectedEntities.length > 0) {
    const matchedEntities = (softwareBlueprint.dataEntities || []).filter((e) =>
      affectedEntities.includes(e.entityName)
    );
    if (matchedEntities.length > 0) {
      includedItems.push({
        id: "ctx_data_entities",
        source: "Software Blueprint",
        title: `Target Entities: ${affectedEntities.join(", ")}`,
        content: JSON.stringify(matchedEntities, null, 2),
        reason: "Required to construct accurate database tables and TypeScript interfaces.",
        relevance: "DEPENDENCY",
        priority: 2,
      });
    }
  }

  // Include affected screens
  if (affectedScreens.length > 0) {
    const matchedScreens = (softwareBlueprint.screens || []).filter((s) =>
      affectedScreens.includes(s.routePath)
    );
    if (matchedScreens.length > 0) {
      includedItems.push({
        id: "ctx_screens",
        source: "Software Blueprint",
        title: `Target Screens: ${affectedScreens.join(", ")}`,
        content: JSON.stringify(matchedScreens, null, 2),
        reason: "Defines the UI states, loading skeletons, and empty states needed.",
        relevance: "SUPPORTING",
        priority: 3,
      });
    }
  }

  // Include applicable security / RLS rules
  includedItems.push({
    id: "ctx_security",
    source: "Engineering Blueprint",
    title: "Security & Authorization Guardrails",
    content: "PostgreSQL Row-Level Security (auth.uid() = user_id) with Zod payload validation.",
    reason: "Ensures newly created code adheres to project multi-tenant data isolation standards.",
    relevance: "SECURITY",
    priority: 2,
  });

  const excludedItems: ContextPackExclusion[] = [
    {
      id: "ex_admin",
      source: "Admin Tools",
      title: "System Administration & Ops Panel",
      reason: "Internal admin tools are completely independent of this task scope.",
    },
    {
      id: "ex_integrations",
      source: "Integrations",
      title: "Third-Party External Services",
      reason: "No external payment or webhook services are modified in this task.",
    },
    {
      id: "ex_seo",
      source: "SEO Architecture",
      title: "Public Search Engine Indexing",
      reason: "Unrelated to internal application logic and private workspace routes.",
    },
  ];

  const totalChars = includedItems.reduce((acc, it) => acc + it.content.length, 0);

  return {
    id: `ctx_pack_${task.id}`,
    taskId: task.id,
    taskTitle: task.title,
    summary: `Curated ${includedItems.length} essential context items for '${task.title}' while excluding 3 unrelated subsystems.`,
    includedItems,
    excludedItems,
    constraints: task.change_boundaries || {
      mustChange: ["app/", "components/"],
      mayChange: ["lib/"],
      mustNotChange: ["supabase/migrations/"],
    },
    acceptanceCriteria: task.acceptance_criteria || [
      "Feature satisfies functional requirements without regressions",
    ],
    securityConsiderations: [
      "Strict Row-Level Security (RLS) enforcement",
      "Server-side Zod validation on all API inputs",
    ],
    testingRequirements: [
      "Verify success state with valid inputs",
      "Verify rejection on invalid or unauthorized requests",
    ],
    estimatedSize: {
      itemCount: includedItems.length,
      characterCount: totalChars,
      label: "Compact Context (~1.5k tokens)",
    },
    isStale: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
