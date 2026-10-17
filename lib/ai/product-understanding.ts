import { getGeminiApiKey } from "./client";
import { getProductTypeProfile } from "./product-type-profiles";
import {
  runBuiltInIdeaUnderstandingAgent,
  runBuiltInSummaryAgent,
} from "./aigenstra-local-agent";
import {
  IdeaUnderstandingRecord,
  ProductSummary,
  BlueprintSkeleton,
  ProductAssumption,
} from "@/types";

/**
 * Synthesizes a raw user idea into a structured Idea Understanding Record
 * tailored to the project's Product Type.
 * Hybrid Architecture: Uses Gemini API when configured; automatically switches to
 * Aigenstra's Built-In Understanding Agent when Gemini API is missing or offline.
 */
export async function synthesizeIdeaUnderstanding(
  projectName: string,
  rawIdea: string,
  productType?: string | null
): Promise<IdeaUnderstandingRecord> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return runBuiltInIdeaUnderstandingAgent(projectName, rawIdea, productType);
  }

  const profile = getProductTypeProfile(productType);

  const prompt = `
System Instruction:
You are the Principal Product Understanding AI Guide for Aigenstra.
Analyze the user's raw product idea for "${projectName}" (${profile.productType} — ${profile.label}).
Produce a structured Idea Understanding Record grounded strictly in what the user described and the architectural requirements of a ${profile.productType}.

CRITICAL RULES:
1. Distinguish between what is CONFIRMED by the user vs what is INFERRED from their ${profile.productType} domain.
2. Zero fictional boilerplate.
3. Respect Anti-Bloat Guardrails: ${profile.antiBloatGuardrails.join(" | ")}

Project Name: ${projectName}
Product Type: ${profile.productType}
Raw User Idea: ${rawIdea}

Return a valid JSON object matching this schema:
{
  "rawIdea": "${rawIdea.replace(/"/g, '\\"')}",
  "normalizedDescription": "Clear plain-language summary of what ${projectName} does",
  "likelyProductType": "${profile.productType}",
  "targetUsers": ["Specific User Type 1", "Specific User Type 2"],
  "primaryOutcome": "What core value the user gets when using ${projectName}",
  "detectedFeatures": ["Feature 1", "Feature 2", "Feature 3"],
  "detectedActors": ["Actor 1"],
  "detectedWorkflows": ["Step 1 -> Step 2 -> Step 3"],
  "uncertainties": ["Specific question to clarify with user"],
  "missingInformation": ["Specific missing detail"],
  "confidence": "CONFIRMED",
  "initialAssumptions": []
}
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
      return runBuiltInIdeaUnderstandingAgent(projectName, rawIdea, productType);
    }

    const resData = await res.json();
    const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return runBuiltInIdeaUnderstandingAgent(projectName, rawIdea, productType);
    }

    return JSON.parse(rawText);
  } catch {
    return runBuiltInIdeaUnderstandingAgent(projectName, rawIdea, productType);
  }
}

/**
 * Checks whether all discovery questions in Stage 1 (Idea & Architecture) have been answered.
 * Process 2 (Agent Prompts & Wireframe) is strictly gated until isSufficient === true.
 */
export function checkDiscoverySufficiency(
  qnaList: Array<{ question: string; answer?: string | null; category?: string }>
): {
  isSufficient: boolean;
  answeredCount: number;
  totalCount: number;
  mustKnowCount: number;
  mustKnowAnswered: number;
  remainingKeyDecisions: string[];
} {
  const totalCount = qnaList.length;
  const answered = qnaList.filter((q) => q.answer && q.answer.trim().length > 0);
  const mustKnowQuestions = qnaList.filter((q) => q.category === "MUST_KNOW");
  const mustKnowAnswered = mustKnowQuestions.filter(
    (q) => q.answer && q.answer.trim().length > 0
  );
  const unansweredQuestions = qnaList
    .filter((q) => !q.answer || q.answer.trim().length === 0)
    .map((q) => q.question);

  // Strict Gating Rule: User must answer all questions in Idea & Architecture before advancing
  const isSufficient = totalCount > 0 && answered.length === totalCount;

  return {
    isSufficient,
    answeredCount: answered.length,
    totalCount,
    mustKnowCount: mustKnowQuestions.length,
    mustKnowAnswered: mustKnowAnswered.length,
    remainingKeyDecisions: unansweredQuestions,
  };
}

/**
 * Generates a real-time Product Summary based strictly on the raw idea, product type,
 * and answered discovery Q&A.
 * Hybrid Architecture: Uses Gemini API when configured; automatically switches to
 * Aigenstra's Built-In Summary Agent when Gemini API is missing or offline.
 */
export async function generateProductSummary(
  projectName: string,
  rawIdea: string,
  qnaList: Array<{ question: string; answer?: string | null }>,
  assumptions: ProductAssumption[] = [],
  productType?: string | null
): Promise<ProductSummary> {
  const sufficiency = checkDiscoverySufficiency(qnaList);
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return runBuiltInSummaryAgent(
      projectName,
      rawIdea,
      qnaList,
      assumptions,
      productType,
      sufficiency.isSufficient
    );
  }

  const profile = getProductTypeProfile(productType);
  const answered = qnaList.filter((q) => q.answer && q.answer.trim().length > 0);

  const prompt = `
System Instruction:
You are the Principal Product Architect for Aigenstra.
Synthesize a clear, real-time Product Understanding Summary for "${projectName}" (${profile.productType} — ${profile.label}) grounded strictly in the user's description and their exact Discovery Q&A answers.

CRITICAL RULES:
1. Do NOT invent features, payment gateways, or roles that contradict the user's answers.
2. Tailor the summary to a ${profile.productType} (${profile.architecturalSummary}).

Project: ${projectName}
Product Type: ${profile.productType}
Raw Idea: ${rawIdea}
User Discovery Answers:
${JSON.stringify(answered, null, 2)}

Return a valid JSON object matching this schema:
{
  "whatBuilding": "Clear description of ${projectName} based on user answers",
  "whoFor": ["Target user group 1"],
  "mainExperience": "End-to-end user experience steps confirmed by user answers",
  "businessExperience": "Operational or backend flow confirmed by user answers",
  "coreCapabilities": ["Confirmed Capability 1", "Confirmed Capability 2", "Confirmed Capability 3"],
  "activeAssumptions": [],
  "decisionsLeft": [],
  "isSufficient": ${sufficiency.isSufficient}
}
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
      return runBuiltInSummaryAgent(
        projectName,
        rawIdea,
        qnaList,
        assumptions,
        productType,
        sufficiency.isSufficient
      );
    }

    const resData = await res.json();
    const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return runBuiltInSummaryAgent(
        projectName,
        rawIdea,
        qnaList,
        assumptions,
        productType,
        sufficiency.isSufficient
      );
    }

    const parsed = JSON.parse(rawText);
    parsed.isSufficient = sufficiency.isSufficient;
    if (assumptions.length > 0 && (!parsed.activeAssumptions || parsed.activeAssumptions.length === 0)) {
      parsed.activeAssumptions = assumptions;
    }
    return parsed;
  } catch {
    return runBuiltInSummaryAgent(
      projectName,
      rawIdea,
      qnaList,
      assumptions,
      productType,
      sufficiency.isSufficient
    );
  }
}

/**
 * Creates a preliminary Blueprint Skeleton from a verified ProductSummary.
 */
export async function generateInitialBlueprintSkeleton(
  summary: ProductSummary,
  productType: string = "Web Application"
): Promise<BlueprintSkeleton> {
  return {
    productOverview: {
      name: summary.whatBuilding.split("—")[0].trim() || "Product Blueprint",
      type: productType,
      purpose: summary.whatBuilding,
      targetUsers: summary.whoFor,
    },
    experiences: summary.whoFor.map((role, idx) => ({
      userRole: role,
      coreGoal: idx === 0 ? summary.mainExperience : (summary.businessExperience || summary.mainExperience),
      keyWorkflow: idx === 0 ? summary.mainExperience : (summary.businessExperience || summary.mainExperience),
    })),
    features: summary.coreCapabilities.map((cap, i) => ({
      title: cap,
      description: cap,
      priority: i === 0 ? "CRITICAL" : "HIGH",
    })),
    screens: [],
    dataEntities: [],
    securityBasics: [
      "Server-side Row Level Security (RLS) enforcing data isolation.",
      "Strict input validation and payload sanitization via Zod.",
    ],
    qualityConsiderations: [
      "Fluid responsive design across mobile (360px), tablet, and desktop.",
      "Clear visual states for loading, empty, error, and success.",
    ],
  };
}
