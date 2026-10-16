import { getGeminiApiKey } from "./client";
import { getProductTypeProfile } from "./product-type-profiles";
import {
  UserPersona,
  FunctionalRequirement,
  NonFunctionalRequirement,
  AdaptiveDiscoveryQuestion,
} from "@/types";

export interface ResearchContextInput {
  market_context?: string;
  user_context?: string;
  user_needs?: string[];
  risks?: Array<{ risk: string; severity: string; mitigation: string }>;
  opportunities?: string[];
  competitor_analysis?: Array<{
    name: string;
    strengths: string;
    weaknesses: string;
    differentiation: string;
  }>;
}

/**
 * Step 1: Generate Real-Time Research Synthesis Document BEFORE asking discovery questions.
 * Tailored strictly to the user's Product Type (SaaS, Landing Page, E-commerce, Web App, etc.)
 * and raw product concept. Zero fictional fallback data.
 */
export async function generateResearchDocument(
  projectName: string,
  productDescription: string,
  qnaContext: Array<{ question: string; answer?: string | null }> = [],
  productType?: string | null,
  projectDetails?: {
    targetAudience?: string | null;
    problemStatement?: string | null;
    goal?: string | null;
    techStack?: string | null;
  }
) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      "Gemini API key is required for real-time product research. Fictional fallback data is disabled."
    );
  }

  const profile = getProductTypeProfile(productType);

  const prompt = `
System Instruction:
You are the Lead Product & Architecture Research AI Agent for Aigenstra.
Before we ask the user any discovery questions or compile any prompts, conduct a deep, real-time domain and architectural research analysis for their specific product.

CRITICAL RULES:
1. ZERO GUESSWORK / ZERO GENERIC BOILERPLATE: Analyze the exact product ("${projectName}") and its Product Type ("${profile.productType}" — ${profile.label}).
2. TAILOR TO PRODUCT TYPE (${profile.productType}):
   - Architectural Summary: ${profile.architecturalSummary}
   - Research Focus Areas: ${profile.researchFocusAreas.join(" | ")}
   - Anti-Bloat Guardrails: ${profile.antiBloatGuardrails.join(" | ")}
3. Explicitly label all assumptions using ONLY:
   - "VERIFIED" (explicitly stated by the user in their description or Q&A)
   - "INFERRED" (direct logical deduction from the domain and product type)
   - "ASSUMPTION" (unverified premise that requires asking the user)
   - "NEEDS RESEARCH" (open domain question we must ask the user next)

Project Context:
- Project Name: ${projectName}
- Product Type: ${profile.productType} (${profile.label})
- Raw Idea / Description: ${productDescription}
- Target Audience: ${projectDetails?.targetAudience || "To be clarified with user"}
- Problem Statement: ${projectDetails?.problemStatement || "Derived from description"}
- Target Goal: ${projectDetails?.goal || "Build production-ready " + profile.productType}
- Tech Stack: ${projectDetails?.techStack || "Next.js 15, Supabase, Tailwind CSS"}
- Answered Discovery Context So Far: ${JSON.stringify(qnaContext, null, 2)}

Return a valid JSON object matching this exact schema:
{
  "market_context": "Detailed domain & architectural research specific to ${projectName} as a ${profile.productType}...",
  "user_context": "Target user workflow, core pain points, and interaction expectations for this specific ${profile.productType}...",
  "competitor_analysis": [
    {
      "name": "Real or category-specific alternative in this domain",
      "strengths": "What existing solutions do well",
      "weaknesses": "Where existing solutions fail users",
      "differentiation": "How ${projectName} solves this better"
    }
  ],
  "user_needs": [
    "Specific user need 1 for ${projectName}",
    "Specific user need 2 for ${projectName}",
    "Specific user need 3 for ${projectName}"
  ],
  "risks": [
    {
      "risk": "Specific architectural or UX risk for this ${profile.productType}",
      "severity": "HIGH",
      "mitigation": "Concrete technical mitigation in Next.js + Supabase"
    }
  ],
  "opportunities": [
    "High-impact product opportunity 1",
    "High-impact product opportunity 2"
  ],
  "assumptions": [
    {
      "assumption": "Specific architectural or workflow detail not yet specified by user",
      "status": "NEEDS RESEARCH"
    }
  ],
  "hypotheses": [
    "Testable product/conversion hypothesis tailored to ${projectName}"
  ],
  "sources": [
    {
      "title": "${profile.label} Architecture & UX Standards",
      "notes": "Domain research synthesis for ${projectName}"
    }
  ]
}
`;

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
    const errText = await res.text().catch(() => "Unknown AI error");
    throw new Error(`Real-time research synthesis failed (HTTP ${res.status}): ${errText.slice(0, 150)}`);
  }

  const resData = await res.json();
  const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error("AI Research Agent returned an empty response.");
  }

  return JSON.parse(rawText);
}

/**
 * Step 2: Generate Adaptive Discovery Questions AFTER Research has been synthesized.
 * Grounded strictly in the Research Document and tailored to the user's Product Type
 * (SaaS, Web App, Landing Page, E-commerce, Marketplace, Mobile App, Internal Tool, AI Product, API).
 * Zero hardcoded fictional fallback questions.
 */
export async function generateAdaptiveDiscoveryQuestions(
  projectName: string,
  productDescription: string,
  previousQnA: Array<{ question: string; answer?: string | null }>,
  productType?: string | null,
  researchContext?: ResearchContextInput | null
): Promise<AdaptiveDiscoveryQuestion[]> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      "Gemini API key is required to generate research-backed discovery questions. Fictional fallback questions are disabled."
    );
  }

  const profile = getProductTypeProfile(productType);
  const answeredTexts = (previousQnA || []).map((q) => q.question.toLowerCase());

  const researchSummaryBlock = researchContext
    ? `
Synthesized Product Research Findings (Use this research to formulate your questions):
- Market & Domain Context: ${researchContext.market_context || "N/A"}
- User Workflow Context: ${researchContext.user_context || "N/A"}
- Identified User Needs: ${(researchContext.user_needs || []).join("; ")}
- Key Architectural Risks to Resolve: ${(researchContext.risks || []).map((r) => `${r.risk} (${r.mitigation})`).join("; ")}
`
    : "";

  const prompt = `
System Instruction:
You are the Principal Discovery & Architecture AI Guide for Aigenstra.
You have just completed domain and architectural research on the user's project ("${projectName}", Product Type: "${profile.productType}" — ${profile.label}).
Now generate 4 highly tailored, progressive discovery questions that resolve the exact architectural, UX, data schema, and workflow decisions needed before we build their ${profile.productType} prompts and wireframes.

CRITICAL RULES FOR RESEARCH-BACKED, PRODUCT-TAILORED QUESTIONS:
1. TAILOR STRICTLY TO PRODUCT TYPE ("${profile.productType}"):
   - Product Type Architectural Summary: ${profile.architecturalSummary}
   - Essential Dimensions to Cover for ${profile.productType}:
     ${profile.essentialQuestionDimensions.map((d, i) => `${i + 1}. ${d}`).join("\n     ")}
   - Typical Screens for ${profile.productType}: ${profile.typicalScreenPatterns.join(" | ")}
   - Anti-Bloat Guardrails: ${profile.antiBloatGuardrails.join(" | ")}
2. NO GENERIC MISMATCHED QUESTIONS:
   - If the user is building a "Landing Page", ask about conversion goals, CTA action, lead capture fields in Supabase, hero/section structure, social proof, and interactive elements—NEVER ask about multi-tenant order tracking or complex admin roles unless mentioned in their idea.
   - If the user is building "SaaS", ask about tenant/workspace structure, core workflow execution, role permissions, and billing/tier rules.
   - If the user is building "E-commerce", ask about product catalog/variants, guest vs. account checkout, payment provider, and order fulfillment states.
   - If the user is building a "Web App", "Marketplace", "Mobile App", "Internal Tool", "AI Product", or "API", tailor every question to "${projectName}" and "${profile.productType}".
3. DEDUPLICATION: Do NOT ask about anything already answered in previous Q&A or already explicitly stated in the user's description.
   Previous questions asked: ${JSON.stringify(answeredTexts)}
4. TONE & OPTIONS:
   - Clear, direct, founder-friendly language.
   - Provide 3 concrete "suggestedOptions" tailored to "${projectName}" so the user can either click an option or type a custom response.
   - Provide "whyItMatters" explaining how this answer shapes their wireframe, Supabase schema, and agent prompts.

Project Name: ${projectName}
Product Type: ${profile.productType} (${profile.label})
User's Raw Idea / Description: ${productDescription}
${researchSummaryBlock}

Previous Q&A Context:
${JSON.stringify(previousQnA, null, 2)}

Return a valid JSON array of 4 objects matching this exact schema:
[
  {
    "question": "Specific question tailored to ${projectName} (${profile.productType})?",
    "priority": "MUST_KNOW" | "HELPFUL" | "OPTIONAL",
    "whyItMatters": "How this decision directly shapes the ${profile.productType} wireframe, Supabase tables, and coding prompt",
    "suggestedOptions": [
      "Tailored Option A for ${projectName}",
      "Tailored Option B for ${projectName}",
      "Tailored Option C for ${projectName}"
    ],
    "defaultRecommendation": "Recommended architectural choice for ${projectName} based on research",
    "defaultAssumption": "Explicit assumption recorded if the user selects the recommended option"
  }
]
`;

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
    const errText = await res.text().catch(() => "Unknown AI error");
    throw new Error(`Discovery question synthesis failed (HTTP ${res.status}): ${errText.slice(0, 150)}`);
  }

  const resData = await res.json();
  const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error("Discovery AI returned an empty response.");
  }

  const parsed = JSON.parse(rawText);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Discovery AI did not return a valid list of questions.");
  }

  return parsed;
}

/**
 * Backward compatibility wrapper for string question arrays.
 */
export async function generateDiscoveryQuestions(
  projectName: string,
  productDescription: string,
  previousQnA: Array<{ question: string; answer?: string | null }>,
  productType?: string | null
): Promise<string[]> {
  const adaptive = await generateAdaptiveDiscoveryQuestions(
    projectName,
    productDescription,
    previousQnA,
    productType
  );
  return adaptive.map((q) => q.question);
}

/**
 * Generate Visual User Journey document tailored to the product type and user answers.
 */
export async function generateUserJourneyDocument(
  projectName: string,
  productDescription: string,
  productType?: string | null
) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Gemini API key is required for real-time user journey synthesis.");
  }

  const profile = getProductTypeProfile(productType);

  const prompt = `
System Instruction:
You are the Lead UX AI Agent for Aigenstra.
Generate a complete, real-time visual user journey mapping out step-by-step interactions for ${projectName} (${profile.productType} — ${profile.label}).

For every stage capture:
- User Goal
- User Action
- System Response
- Potential Friction
- Possible Failure
- Security Consideration

Also include Happy Path, Edge Cases, and Failure Recovery Paths tailored specifically to a ${profile.productType}.

Project: ${projectName}
Product Type: ${profile.productType}
Description: ${productDescription}

Return a valid JSON object matching this schema:
{
  "title": "Core User Journey — ${projectName} (${profile.productType})",
  "persona": "Primary Target User",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Stage Title",
      "userGoal": "...",
      "userAction": "...",
      "systemResponse": "...",
      "friction": "...",
      "possibleFailure": "...",
      "errorStates": ["..."],
      "alternativePaths": ["..."],
      "security": "..."
    }
  ],
  "happy_path": ["Step 1", "Step 2", "Step 3"],
  "edge_cases": [
    { "scenario": "...", "resolution": "..." }
  ],
  "failure_paths": [
    { "trigger": "...", "userMessage": "...", "fallbackAction": "..." }
  ]
}
`;

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
    throw new Error(`User journey synthesis failed with HTTP ${res.status}`);
  }

  const resData = await res.json();
  const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(rawText);
}

/**
 * Generate Product Specification (PRD) with Personas, FRs, NFRs, and Edge Cases.
 */
export async function generateProductSpecDocument(
  projectName: string,
  productDescription: string,
  productType?: string | null
) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Gemini API key is required for real-time product specification synthesis.");
  }

  const profile = getProductTypeProfile(productType);

  const prompt = `
System Instruction:
You are the Principal Product Agent for Aigenstra.
Generate a structured Product Requirements Document (PRD) for ${projectName} (${profile.productType} — ${profile.label}).
Anti-Bloat Guardrails: ${profile.antiBloatGuardrails.join(" | ")}

Project: ${projectName}
Product Type: ${profile.productType}
Description: ${productDescription}

Return a valid JSON object matching this schema:
{
  "problem_statement": "...",
  "target_users": ["..."],
  "personas": [
    { "name": "...", "goal": "...", "pain": "...", "technicalAbility": "Medium", "primaryTask": "..." }
  ],
  "goals": ["..."],
  "non_goals": ["..."],
  "user_stories": [
    { "title": "...", "asA": "...", "iWantTo": "...", "soThat": "...", "priority": "CRITICAL" }
  ],
  "functional_reqs": ["FR-001: ..."],
  "structured_functional_reqs": [
    { "code": "FR-001", "title": "...", "description": "...", "priority": "CRITICAL" }
  ],
  "non_functional_reqs": ["NFR-001: ..."],
  "structured_non_functional_reqs": [
    { "code": "NFR-001", "title": "...", "description": "...", "category": "Security" }
  ],
  "business_rules": ["..."],
  "acceptance_criteria": ["..."],
  "edge_cases": ["..."],
  "mvp_scope": ["..."],
  "future_scope": ["..."]
}
`;

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
    throw new Error(`Product specification synthesis failed with HTTP ${res.status}`);
  }

  const resData = await res.json();
  const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(rawText);
}
