import { getGeminiApiKey } from "./client";
import { executeResilientAICompletion } from "./resilient-client";
import {
  IdeaUnderstandingRecord,
  ProductSummary,
  BlueprintSkeleton,
  ProductAssumption,
} from "@/types";

/**
 * Synthesizes a raw, messy user idea into a structured Idea Understanding Record.
 */
export async function synthesizeIdeaUnderstanding(
  projectName: string,
  rawIdea: string
): Promise<IdeaUnderstandingRecord> {
  const apiKey = getGeminiApiKey();

  const fallbackRecord: IdeaUnderstandingRecord = {
    rawIdea,
    normalizedDescription: `${projectName} is designed to streamline operations and deliver value to target users based on: ${rawIdea.slice(0, 150)}...`,
    likelyProductType: "Web Platform",
    targetUsers: ["End Customers", "Platform Administrators"],
    primaryOutcome: "Allow users to accomplish their core goal effortlessly through a modern web interface.",
    detectedFeatures: ["User authentication", "Interactive dashboard", "Item/service management", "Status tracking"],
    detectedActors: ["Customer", "Administrator"],
    detectedWorkflows: ["Onboard / Sign in → Browse options → Submit request → Track status"],
    uncertainties: ["Exact payment requirements", "Multi-tier permission requirements"],
    missingInformation: ["User communication channels", "External service integrations"],
    confidence: "INFERRED",
    initialAssumptions: [
      "Users will require secure authentication to track their activity.",
      "Administrators will need an overview panel to manage items.",
    ],
  };

  if (!apiKey) {
    return fallbackRecord;
  }

  const prompt = `
System Instruction:
You are the Principal Product Understanding AI Guide for Aigenstra.
Analyze the user's raw, unedited idea. Produce a structured Idea Understanding Record.
CRITICAL RULES:
1. Distinguish between what is CONFIRMED by the user vs what you INFERRED or ASSUMED.
2. Formulate clear, plain-English summaries without software jargon.
3. Identify actors, likely product type, primary outcome, and key uncertainties.

Project Name: ${projectName}
Raw User Idea: ${rawIdea}

Return a valid JSON object matching this schema:
{
  "rawIdea": "${rawIdea.replace(/"/g, '\\"')}",
  "normalizedDescription": "Clear plain-language summary of what the product does",
  "likelyProductType": "SaaS / Marketplace / Web App / Mobile App / Internal Tool",
  "targetUsers": ["User Type 1", "User Type 2"],
  "primaryOutcome": "What core value the user gets when using the product",
  "detectedFeatures": ["Feature 1", "Feature 2", "Feature 3"],
  "detectedActors": ["Actor 1", "Actor 2"],
  "detectedWorkflows": ["Step 1 → Step 2 → Step 3"],
  "uncertainties": ["Uncertainty 1", "Uncertainty 2"],
  "missingInformation": ["Missing Item 1", "Missing Item 2"],
  "confidence": "CONFIRMED" | "INFERRED" | "ASSUMED",
  "initialAssumptions": [
    "Working assumption 1",
    "Working assumption 2"
  ]
}
`;

  const result = await executeResilientAICompletion<IdeaUnderstandingRecord>({
    prompt,
    systemInstruction: "You are the Principal Product Understanding AI Guide for Aigenstra. Return strictly valid JSON.",
    temperature: 0.2,
    fallback: () => fallbackRecord,
  });

  return result.data;
}

/**
 * Checks whether enough critical decisions have been resolved to complete Discovery.
 */
export function checkDiscoverySufficiency(
  qnaList: Array<{ question: string; answer?: string | null; category?: string }>
): {
  isSufficient: boolean;
  answeredCount: number;
  mustKnowCount: number;
  mustKnowAnswered: number;
  remainingKeyDecisions: string[];
} {
  const answered = qnaList.filter((q) => q.answer && q.answer.trim().length > 0);
  const mustKnowQuestions = qnaList.filter((q) => q.category === "MUST_KNOW");
  const mustKnowAnswered = mustKnowQuestions.filter((q) => q.answer && q.answer.trim().length > 0);
  const unansweredMustKnow = mustKnowQuestions
    .filter((q) => !q.answer || q.answer.trim().length === 0)
    .map((q) => q.question);

  // Sufficiency rule: at least 3 total questions answered OR all must-know questions answered
  const isSufficient =
    (answered.length >= 3 && mustKnowAnswered.length >= Math.min(2, mustKnowQuestions.length)) ||
    (mustKnowQuestions.length > 0 && mustKnowAnswered.length === mustKnowQuestions.length);

  return {
    isSufficient,
    answeredCount: answered.length,
    mustKnowCount: mustKnowQuestions.length,
    mustKnowAnswered: mustKnowAnswered.length,
    remainingKeyDecisions: unansweredMustKnow,
  };
}

/**
 * Generates a human-readable Product Summary based on raw idea, discovery Q&A, and assumptions.
 */
export async function generateProductSummary(
  projectName: string,
  rawIdea: string,
  qnaList: Array<{ question: string; answer?: string | null }>,
  assumptions: ProductAssumption[] = []
): Promise<ProductSummary> {
  const apiKey = getGeminiApiKey();

  const answered = qnaList.filter((q) => q.answer && q.answer.trim().length > 0);
  const sufficiency = checkDiscoverySufficiency(qnaList);

  const fallbackSummary: ProductSummary = {
    whatBuilding: `${projectName} — A streamlined application designed to solve core workflows as described: ${rawIdea.slice(0, 120)}...`,
    whoFor: ["Customers seeking effortless access", "Administrators overseeing platform activity"],
    mainExperience: "Discover service / product → Configure preferences → Submit request → Receive live status & completion updates.",
    businessExperience: "Receive incoming requests → Review details → Process and update status → Confirm completion.",
    coreCapabilities: [
      "User Accounts & Authentication",
      "Request / Order Processing Flow",
      "Real-time Status Tracking",
      "Administrative Overview & Management",
    ],
    activeAssumptions: assumptions.length > 0 ? assumptions : [
      {
        statement: "Customers can create accounts to track previous activity securely.",
        reason: "Allows users to return and inspect their historical submissions.",
        source: "default",
        status: "PROVISIONAL",
        confidence: "INFERRED",
      },
      {
        statement: "Platform administrators have a dedicated management interface.",
        reason: "Necessary to fulfill and inspect incoming requests.",
        source: "default",
        status: "PROVISIONAL",
        confidence: "INFERRED",
      },
    ],
    decisionsLeft: sufficiency.remainingKeyDecisions.length > 0 ? sufficiency.remainingKeyDecisions : [
      "Direct online payment processing vs manual invoicing on delivery.",
    ],
    isSufficient: sufficiency.isSufficient,
  };

  if (!apiKey) {
    return fallbackSummary;
  }

  const prompt = `
System Instruction:
You are the Principal Product Architect for Aigenstra.
Synthesize a plain-English, non-technical Product Understanding Summary for the user.
Explain:
1. What they are building (in clear, non-technical words).
2. Who uses it.
3. The main customer experience and business experience.
4. Core capabilities.
5. Highlight active assumptions and decisions remaining.

Project: ${projectName}
Raw Idea: ${rawIdea}
Discovery Answers:
${JSON.stringify(answered, null, 2)}

Return a valid JSON object matching this schema:
{
  "whatBuilding": "Plain-language description of the product",
  "whoFor": ["User group 1", "User group 2"],
  "mainExperience": "Customer journey steps from arrival to completion",
  "businessExperience": "Admin / operator journey steps",
  "coreCapabilities": ["Capability 1", "Capability 2", "Capability 3"],
  "activeAssumptions": [
    {
      "statement": "Assumption description",
      "reason": "Why we are assuming this",
      "source": "default",
      "status": "PROVISIONAL",
      "confidence": "INFERRED"
    }
  ],
  "decisionsLeft": ["Any remaining open questions"],
  "isSufficient": true
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

    const resData = await res.json();
    const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText);
    parsed.isSufficient = sufficiency.isSufficient;
    return parsed;
  } catch (err) {
    console.error("Product summary generation error:", err);
    return fallbackSummary;
  }
}

/**
 * Creates the preliminary 10-section Blueprint Skeleton for Phase 1.
 */
export async function generateInitialBlueprintSkeleton(
  summary: ProductSummary
): Promise<BlueprintSkeleton> {
  return {
    productOverview: {
      name: summary.whatBuilding.split("—")[0].trim() || "Product Blueprint",
      type: "Web Application",
      purpose: summary.whatBuilding,
      targetUsers: summary.whoFor,
    },
    experiences: [
      {
        userRole: summary.whoFor[0] || "Customer",
        coreGoal: "Complete primary task and track status",
        keyWorkflow: summary.mainExperience,
      },
      {
        userRole: summary.whoFor[1] || "Administrator",
        coreGoal: "Manage incoming requests and configure platform",
        keyWorkflow: summary.businessExperience || "Inspect dashboard → Approve/process orders → View telemetry",
      },
    ],
    features: summary.coreCapabilities.map((cap, i) => ({
      title: cap,
      description: `Core functionality enabling ${cap.toLowerCase()} across responsive viewports.`,
      priority: i === 0 ? "CRITICAL" : "HIGH",
    })),
    screens: [
      {
        name: "Landing & Overview Page",
        purpose: "Introduce value proposition and provide primary CTA",
        keyActions: ["Explore services", "Sign in / Get Started"],
      },
      {
        name: "Core Action & Request Flow",
        purpose: "Allow user to submit details and configure options",
        keyActions: ["Fill details", "Confirm submission"],
      },
      {
        name: "Dashboard & Status Tracking",
        purpose: "Live view of submitted requests and activity history",
        keyActions: ["View status timeline", "Update preferences"],
      },
      {
        name: "Admin Management Console",
        purpose: "Platform operator panel for managing items and users",
        keyActions: ["Inspect records", "Update statuses", "Manage settings"],
      },
    ],
    dataEntities: [
      {
        name: "Users & Profiles",
        description: "Stores authentication credentials, contact info, and role permissions.",
        ownership: "Owned by authenticated user record (auth.uid()).",
      },
      {
        name: "Orders / Service Requests",
        description: "Core transaction items containing status, timestamps, and customer payload.",
        ownership: "Linked to user profile and authorized operators.",
      },
    ],
    securityBasics: [
      "Server-side Row Level Security (RLS) enforcing user data isolation.",
      "Strict input validation and payload sanitization via Zod.",
      "Zero-Trust session management with ephemeral tokens.",
    ],
    qualityConsiderations: [
      "Fluid responsive design across mobile (360px), tablet, and desktop.",
      "Clear visual states for loading, empty, error, and success.",
      "Accessible contrast and semantic HTML elements.",
    ],
  };
}
