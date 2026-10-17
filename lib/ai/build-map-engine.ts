import { getGeminiApiKey } from "./client";
import { getProductTypeProfile } from "./product-type-profiles";
import { runBuiltInBuildMapAgent } from "./aigenstra-local-agent";
import { BuildMap, BuildStage, SoftwareBlueprint } from "@/types";

/**
 * Generates an actionable, sequential Build Map strictly tailored to the project's
 * Software Blueprint and Product Type.
 * Hybrid Architecture: Uses Gemini API when configured and reachable; automatically switches
 * to Aigenstra's Built-In Adaptive Build Map Agent when Gemini API is missing or offline.
 */
export async function generateBuildMap(
  projectId: string,
  blueprint: SoftwareBlueprint
): Promise<BuildMap> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return runBuiltInBuildMapAgent(projectId, blueprint);
  }

  const profile = getProductTypeProfile(blueprint.overview?.productType);

  const prompt = `
System Instruction:
You are the Principal Build Architect for Aigenstra.
Transform the provided Software Blueprint into a chronologically sequenced, actionable Build Map tailored specifically for "${blueprint.overview.name}" (Product Type: "${profile.productType}" — ${profile.label}).

CRITICAL RULES:
1. AIGENSTRA IS A PROMPT BUILDER, NOT AN APP BUILDER. The build map sequences bounded development increments for external coding agents (Google Antigravity, Claude Code, Cursor, Codex).
2. TAILOR STRICTLY TO PRODUCT TYPE ("${profile.productType}"):
   - Architectural Summary: ${profile.architecturalSummary}
   - Expected Screen Patterns: ${profile.typicalScreenPatterns.join(" | ")}
   - Anti-Bloat Guardrails: ${profile.antiBloatGuardrails.join(" | ")}
3. Reference ONLY the actual screens (${blueprint.screens.map((s) => s.routePath).join(", ")}) and actual data entities (${blueprint.dataEntities.map((e) => e.entityName).join(", ")}) from the project's blueprint. NEVER invent generic "CoreResource" or "WorkspaceItem" entities.

Blueprint Context:
- Product: ${blueprint.overview.name} (${profile.productType})
- Summary: ${blueprint.overview.summary}
- Problem Solved: ${blueprint.overview.problemStatement}
- Roles: ${blueprint.usersRoles.map((r) => r.roleName).join(", ")}
- Screens: ${blueprint.screens.map((s) => `${s.screenName} (${s.routePath}): ${s.simplePurpose}`).join(" | ")}
- Entities: ${blueprint.dataEntities.map((e) => `${e.entityName} (${e.attributes.map((a) => a.name).join(", ")})`).join(" | ")}
- Core Features: ${blueprint.features.map((f) => `${f.title}: ${f.simpleDescription}`).join(" | ")}

Return a valid JSON object matching this exact schema:
{
  "stages": [
    {
      "id": "stage_1",
      "stageNumber": 1,
      "title": "Stage Title Tailored to ${blueprint.overview.name}",
      "userCentricName": "Clear Human-Readable Stage Name",
      "whyThisExists": "Plain-English explanation of why this stage is sequenced here for ${blueprint.overview.name}",
      "deliverables": [
        "Concrete deliverable 1",
        "Concrete deliverable 2",
        "Concrete deliverable 3"
      ],
      "associatedScreens": ["/actual-route"],
      "associatedEntities": ["ActualEntityName"],
      "dependencies": [],
      "status": "READY",
      "agentGuidance": "Specific technical guidance for the coding agent executing this stage",
      "estimatedComplexity": "MEDIUM"
    }
  ]
}

DO NOT include markdown code blocks. Output raw JSON only.
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
      return runBuiltInBuildMapAgent(projectId, blueprint);
    }

    const data = await response.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) {
      return runBuiltInBuildMapAgent(projectId, blueprint);
    }

    const parsed = JSON.parse(rawContent);
    const stages: BuildStage[] = Array.isArray(parsed.stages) ? parsed.stages : [];
    if (stages.length === 0) {
      return runBuiltInBuildMapAgent(projectId, blueprint);
    }

    return {
      project_id: projectId,
      stages,
      currentStageNumber: 1,
      totalStages: stages.length,
      completedStages: stages.filter((s) => s.status === "COMPLETED").length,
      updated_at: new Date().toISOString(),
    };
  } catch {
    return runBuiltInBuildMapAgent(projectId, blueprint);
  }
}

