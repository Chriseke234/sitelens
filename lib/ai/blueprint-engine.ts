import { getGeminiApiKey } from "./client";
import { getProductTypeProfile } from "./product-type-profiles";
import { runBuiltInBlueprintAgent } from "./aigenstra-local-agent";
import {
  SoftwareBlueprint,
  DiscoveryQnA,
  ProductSummary,
  IdeaUnderstandingRecord,
} from "@/types";
import { evaluateBlueprintHealth } from "./blueprint-health";

/**
 * Generates a real-time, product-tailored 13-section Software Blueprint from project details,
 * product-type architecture profile, research synthesis, and user discovery answers.
 * Hybrid Architecture: Uses Gemini API when configured and reachable; automatically switches
 * to Aigenstra's Built-In Adaptive Blueprint Agent when Gemini API is missing or offline.
 */
export async function generateSoftwareBlueprint(
  projectId: string,
  projectName: string,
  productType: string,
  rawIdea: string,
  summary?: ProductSummary | null,
  qnas?: DiscoveryQnA[],
  understanding?: IdeaUnderstandingRecord | null,
  projectDetails?: {
    problemStatement?: string | null;
    targetAudience?: string | null;
    goal?: string | null;
    techStack?: string | null;
    codingEnvironment?: string | null;
  },
  researchDoc?: {
    market_context?: string;
    user_context?: string;
    user_needs?: string[];
    risks?: Array<{ risk: string; severity: string; mitigation: string }>;
    opportunities?: string[];
  } | null
): Promise<SoftwareBlueprint> {
  const normalizedDetails = projectDetails
    ? {
        problemStatement: projectDetails.problemStatement || undefined,
        targetAudience: projectDetails.targetAudience || undefined,
        goal: projectDetails.goal || undefined,
        techStack: projectDetails.techStack || undefined,
        codingEnvironment: projectDetails.codingEnvironment || undefined,
      }
    : undefined;

  const buildLocalFallback = () => {
    const bp = runBuiltInBlueprintAgent(
      projectId,
      projectName,
      productType,
      rawIdea,
      researchDoc,
      qnas || [],
      normalizedDetails
    );
    const health = evaluateBlueprintHealth(bp);
    bp.healthScore = health.score;
    bp.healthWarnings = health.issues.map((i) => i.message);
    return bp;
  };

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return buildLocalFallback();
  }

  const profile = getProductTypeProfile(productType);

  const qnaContext = (qnas || [])
    .filter((q) => q.answer && q.answer.trim().length > 0)
    .map((q, idx) => `Decision ${idx + 1} — Q: ${q.question}\nUser Answer: ${q.answer}`)
    .join("\n\n");

  const researchContext = researchDoc
    ? `
Real-Time Research Synthesis:
- Market & Domain Context: ${researchDoc.market_context || "N/A"}
- User Workflow Context: ${researchDoc.user_context || "N/A"}
- Verified User Needs: ${(researchDoc.user_needs || []).join("; ")}
- Key Risks & Mitigations: ${(researchDoc.risks || []).map((r) => `${r.risk} -> ${r.mitigation}`).join("; ")}
`
    : "";

  const prompt = `
System Instruction:
You are the Principal Software Product Architect for Aigenstra.
Transform the user's product concept, real-time domain research, and exact Discovery Q&A answers into a comprehensive, highly structured 13-section Software Blueprint tailored specifically for a "${profile.productType}" (${profile.label}).

CRITICAL ARCHITECTURAL RULES (ZERO GUESSWORK / ZERO FICTIONAL DATA):
1. AIGENSTRA IS A PROMPT BUILDER AND ARCHITECTURE GUIDE.
2. STRICT PRODUCT-TYPE TAILORING (${profile.productType}):
   - Architectural Summary: ${profile.architecturalSummary}
   - Expected Screen Patterns for ${profile.productType}: ${profile.typicalScreenPatterns.join(" | ")}
   - Expected Data Entities for ${profile.productType}: ${profile.typicalDataEntities.join(" | ")}
   - UX & Conversion Priorities: ${profile.uxAndConversionPriorities.join(" | ")}
   - Security & Backend Priorities: ${profile.securityAndBackendPriorities.join(" | ")}
   - Anti-Bloat Guardrails: ${profile.antiBloatGuardrails.join(" | ")}
3. RESPECT USER ANSWERS: Every screen, routePath, dataEntity, workflow, and businessRule MUST directly reflect the user's answered Discovery Questions below. NEVER invent generic entities like "WorkspaceItem" or "CoreResource".
4. Tag every item with 'source' ('USER_CONFIRMED' | 'USER_DESCRIBED' | 'SYSTEM_INFERRED' | 'SYSTEM_RECOMMENDED') and 'status' ('CONFIRMED' | 'PROPOSED').
5. SHARED PRODUCT DEVELOPMENT STANDARD: The Software Blueprint defines the authoritative INTENDED PRODUCT specification (what should exist). Every feature and workflow must include measurable criteria so external coding agents and auditors can verify implementation without guesswork.

Project Details:
- Project Name: ${projectName}
- Product Type: ${profile.productType} (${profile.label})
- Raw User Concept: ${rawIdea}
- Target Audience: ${projectDetails?.targetAudience || summary?.whoFor?.join(", ") || understanding?.targetUsers?.join(", ") || "Derived from user concept & Q&A"}
- Problem Statement: ${projectDetails?.problemStatement || "Derived from user concept & Q&A"}
- Target Goal: ${projectDetails?.goal || "Build production-ready " + profile.productType}
- Tech Stack: ${projectDetails?.techStack || "Next.js 15, Supabase, Tailwind CSS"}
${researchContext}
${qnaContext ? `\nConfirmed User Discovery Answers:\n${qnaContext}` : ""}

Return a valid JSON object matching the exact SoftwareBlueprint schema:
{
  "overview": {
    "name": "${projectName.replace(/"/g, '\\"')}",
    "summary": "Clear product summary grounded in user concept and Q&A answers",
    "problemStatement": "Specific pain point solved by ${projectName}",
    "valueProposition": "Core value delivered to target users",
    "productType": "${profile.productType}",
    "targetOutcome": "Measurable outcome for ${projectName}",
    "source": "USER_CONFIRMED",
    "status": "CONFIRMED"
  },
  "usersRoles": [
    {
      "id": "role_1",
      "roleName": "Specific Role Name for ${projectName}",
      "simpleDescription": "What this actor does in ${projectName}",
      "technicalPermissions": ["specific:permission"],
      "userGoals": ["Goal 1", "Goal 2"],
      "restrictions": ["Specific restriction"],
      "relatedRoles": [],
      "source": "USER_CONFIRMED",
      "status": "CONFIRMED"
    }
  ],
  "userJourneys": [
    {
      "id": "journey_1",
      "title": "Primary End-to-End Flow for ${projectName}",
      "role": "Primary Role",
      "happyPathSteps": [
        {
          "stepNumber": 1,
          "title": "Step Title",
          "userAction": "Concrete user action",
          "systemResponse": "Concrete system response",
          "technicalImplication": "Next.js / Supabase implementation detail"
        }
      ],
      "frictionPoints": ["Specific UX friction point to prevent"],
      "failureScenarios": [
        {
          "scenario": "Specific failure case",
          "resolution": "Concrete recovery handling"
        }
      ],
      "source": "USER_CONFIRMED",
      "status": "CONFIRMED"
    }
  ],
  "features": [
    {
      "id": "feat_1",
      "title": "Domain-Specific Feature Title",
      "simpleDescription": "What this feature does for the user",
      "technicalDetails": "Exact Next.js + Supabase implementation architecture",
      "category": "CORE_MVP",
      "priority": "CRITICAL",
      "source": "USER_CONFIRMED",
      "status": "CONFIRMED"
    }
  ],
  "screens": [
    {
      "id": "screen_1",
      "screenName": "Specific Screen Name",
      "routePath": "/actual-route-path",
      "simplePurpose": "Exact purpose of this screen/view in ${projectName}",
      "accessRoles": ["Primary Role"],
      "keyComponents": ["RealComponentName1", "RealComponentName2", "RealComponentName3"],
      "emptyState": "Specific empty state UI for this screen",
      "loadingState": "Specific loading skeleton state for this screen",
      "errorState": "Specific error recovery UI for this screen",
      "technicalNotes": "Next.js Server/Client component & Supabase query notes",
      "source": "USER_CONFIRMED",
      "status": "CONFIRMED"
    }
  ],
  "workflows": [
    {
      "id": "flow_1",
      "name": "Specific Domain Workflow Name",
      "trigger": "What triggers this workflow",
      "simpleDescription": "End-to-end explanation",
      "steps": ["1. Step one", "2. Step two", "3. Step three"],
      "technicalServices": ["Supabase PostgreSQL", "Next.js Server Actions"],
      "source": "USER_CONFIRMED",
      "status": "CONFIRMED"
    }
  ],
  "businessRules": [
    {
      "id": "rule_1",
      "code": "BR-001",
      "ruleStatement": "Concrete business rule derived from user answers",
      "reason": "Why this rule is enforced",
      "enforcementLevel": "STRICT",
      "technicalConstraint": "Supabase RLS policy or Zod validation constraint",
      "source": "USER_CONFIRMED",
      "status": "CONFIRMED"
    }
  ],
  "dataEntities": [
    {
      "id": "entity_1",
      "entityName": "ActualTableName",
      "simpleDescription": "What records this Supabase table stores for ${projectName}",
      "ownershipRole": "Owner Role",
      "attributes": [
        { "name": "id", "type": "uuid", "required": true, "description": "Primary key UUID" }
      ],
      "lifecycleStates": ["state_1", "state_2"],
      "source": "USER_CONFIRMED",
      "status": "CONFIRMED"
    }
  ],
  "integrations": [
    {
      "id": "integ_1",
      "serviceName": "Supabase",
      "category": "STORAGE",
      "purpose": "Database & persistence for ${projectName}",
      "fallbackPlan": "PostgreSQL connection",
      "technicalApiNotes": "@supabase/ssr client",
      "source": "SYSTEM_RECOMMENDED",
      "status": "CONFIRMED"
    }
  ],
  "adminTools": [],
  "security": [
    {
      "id": "sec_1",
      "title": "Row-Level Security & Input Validation",
      "simpleDescription": "Protects ${projectName} data and endpoints",
      "category": "AUTHORIZATION",
      "technicalImplementation": "Supabase RLS policies + Zod server-side schema validation",
      "source": "SYSTEM_RECOMMENDED",
      "status": "CONFIRMED"
    }
  ],
  "quality": [
    {
      "id": "qual_1",
      "category": "RESPONSIVENESS",
      "requirement": "100% responsive across mobile (360px+), tablet, and desktop",
      "targetMetric": "Zero horizontal overflow across 360px–4K",
      "technicalApproach": "Mobile-first Tailwind CSS layout",
      "source": "SYSTEM_RECOMMENDED",
      "status": "CONFIRMED"
    }
  ],
  "futureConsiderations": []
}

DO NOT include markdown code blocks. Output raw JSON only.
`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.2,
          },
        }),
      }
    );

    if (!res.ok) {
      return buildLocalFallback();
    }

    const resData = await res.json();
    const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return buildLocalFallback();
    }

    const parsed = JSON.parse(rawText);

    const generatedBlueprint: SoftwareBlueprint = {
      project_id: projectId,
      overview: parsed.overview,
      usersRoles: parsed.usersRoles || [],
      userJourneys: parsed.userJourneys || [],
      features: parsed.features || [],
      screens: parsed.screens || [],
      workflows: parsed.workflows || [],
      businessRules: parsed.businessRules || [],
      dataEntities: parsed.dataEntities || [],
      integrations: parsed.integrations || [],
      adminTools: parsed.adminTools || [],
      security: parsed.security || [],
      quality: parsed.quality || [],
      futureConsiderations: parsed.futureConsiderations || [],
      healthScore: 100,
      healthWarnings: [],
      updated_at: new Date().toISOString(),
    };

    const health = evaluateBlueprintHealth(generatedBlueprint);
    generatedBlueprint.healthScore = health.score;
    generatedBlueprint.healthWarnings = health.issues.map((i) => i.message);

    return generatedBlueprint;
  } catch {
    return buildLocalFallback();
  }
}

