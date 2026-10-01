import { getGeminiApiKey } from "./client";
import { PromptCategory, CodingAgentProfile } from "@/types";

export interface GeneratedPromptData {
  category: PromptCategory;
  title: string;
  role: string;
  projectContext: string;
  currentState: string;
  objective: string;
  requirements: string[];
  existingArchitecture: string;
  technicalConstraints: string[];
  uxRequirements: string[];
  securityRequirements: string[];
  edgeCases: string[];
  doNotChange: string[];
  acceptanceCriteria: string[];
  testingRequirements: string[];
  validation: string[];
  expectedOutput: string;
  fullPromptText: string;
}

export interface PromptReadinessCheck {
  isReady: boolean;
  score: number;
  checks: Array<{
    title: string;
    passed: boolean;
    warning?: string;
  }>;
  guidanceMessage?: string;
}

/**
 * Validate whether project intelligence artifacts are sufficiently formulated
 * before generating implementation prompts.
 */
export function checkPrePromptReadiness(
  hasRequirements: boolean,
  hasUX: boolean,
  hasArchitecture: boolean,
  hasSecurity: boolean,
  hasEdgeCases: boolean,
  hasAcceptanceCriteria: boolean
): PromptReadinessCheck {
  const checks = [
    {
      title: "Core Requirements Defined",
      passed: hasRequirements,
      warning: "Requirements are missing or incomplete. Prompts may lack precise functional scope.",
    },
    {
      title: "UX Journeys & State Rules Mapped",
      passed: hasUX,
      warning: "User journey flow & state rules (empty, loading, error) have not been fully specified.",
    },
    {
      title: "Architecture & Schema Planned",
      passed: hasArchitecture,
      warning: "Database schema entities and API endpoints haven't been resolved.",
    },
    {
      title: "Security Rules & Threat Model Configured",
      passed: hasSecurity,
      warning: "Security checklist and server-side authorization rules are not defined.",
    },
    {
      title: "Edge Cases Identified",
      passed: hasEdgeCases,
      warning: "Failure recovery paths and edge case scenarios have not been formulated.",
    },
    {
      title: "Acceptance Criteria Set",
      passed: hasAcceptanceCriteria,
      warning: "Verification criteria are missing, which may result in vague coding outcomes.",
    },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  const isReady = passedCount >= 4;
  const score = Math.round((passedCount / checks.length) * 100);

  let guidanceMessage = undefined;
  if (!isReady) {
    const missing = checks.filter((c) => !c.passed).map((c) => c.title.toLowerCase());
    guidanceMessage = `This prompt can be generated, but key prerequisites (${missing.slice(0, 2).join(", ")}) haven't been fully resolved in your workspace yet.`;
  }

  return { isReady, score, checks, guidanceMessage };
}

/**
 * Format prompt text specifically for the user's targeted coding agent environment.
 */
export function formatPromptForAgent(
  data: GeneratedPromptData,
  agent: CodingAgentProfile
): string {
  let agentPrefix = "";
  if (agent === "Cursor") {
    agentPrefix = `// @context: Execute with high precision in Cursor IDE (Next.js App Router). Preserve existing comments and file structures.\n\n`;
  } else if (agent === "Claude Code") {
    agentPrefix = `CLAUDE CODE DIRECTIVE: Follow strict architectural boundaries. Inspect existing repository before creating or modifying files.\n\n`;
  } else if (agent === "Antigravity") {
    agentPrefix = `ANTIGRAVITY DIRECTIVE: Prioritize clean code, responsive design across 360px-4K, strict server-side authorization, and SVG icons.\n\n`;
  } else if (agent === "Replit") {
    agentPrefix = `REPLIT AGENT INSTRUCTION: Build production-ready components. Ensure environment variables and dependencies are properly configured.\n\n`;
  }

  return `${agentPrefix}ROLE
${data.role}

PROJECT CONTEXT
${data.projectContext}

CURRENT PROJECT STATE
${data.currentState}

OBJECTIVE
${data.objective}

REQUIREMENTS
${data.requirements.map((r, i) => `${i + 1}. ${r}`).join("\n")}

EXISTING ARCHITECTURE
${data.existingArchitecture}

TECHNICAL CONSTRAINTS
${data.technicalConstraints.map((c, i) => `${i + 1}. ${c}`).join("\n")}

UX REQUIREMENTS
${data.uxRequirements.map((u, i) => `${i + 1}. ${u}`).join("\n")}

SECURITY REQUIREMENTS
${data.securityRequirements.map((s, i) => `${i + 1}. ${s}`).join("\n")}

EDGE CASES
${data.edgeCases.map((e, i) => `${i + 1}. ${e}`).join("\n")}

DO NOT CHANGE
${data.doNotChange.map((d, i) => `${i + 1}. ${d}`).join("\n")}

ACCEPTANCE CRITERIA
${data.acceptanceCriteria.map((a, i) => `${i + 1}. ${a}`).join("\n")}

TESTING REQUIREMENTS
${data.testingRequirements.map((t, i) => `${i + 1}. ${t}`).join("\n")}

VALIDATION
${data.validation.map((v, i) => `${i + 1}. ${v}`).join("\n")}

EXPECTED OUTPUT
${data.expectedOutput}`;
}

/**
 * Generate a strict 16-part implementation prompt for Aigenstra V2.
 */
export async function generateStructuredPrompt(
  projectName: string,
  productDescription: string,
  category: PromptCategory,
  codingAgent: CodingAgentProfile = "Antigravity"
): Promise<GeneratedPromptData> {
  const apiKey = getGeminiApiKey();

  const prompt = `
System Instruction:
You are the Principal Vibe-Coding Prompt Engineering AI Agent for Aigenstra V2.
Generate an exhaustive, production-grade 16-part implementation prompt targeted for ${codingAgent}.
Category: ${category}
Project: ${projectName}
Description: ${productDescription}

Strictly follow these 16 parts to avoid vague AI output:
1. ROLE
2. PROJECT CONTEXT
3. CURRENT PROJECT STATE
4. OBJECTIVE
5. REQUIREMENTS
6. EXISTING ARCHITECTURE
7. TECHNICAL CONSTRAINTS
8. UX REQUIREMENTS
9. SECURITY REQUIREMENTS
10. EDGE CASES
11. DO NOT CHANGE
12. ACCEPTANCE CRITERIA
13. TESTING REQUIREMENTS
14. VALIDATION
15. EXPECTED OUTPUT
16. FULL PROMPT TEXT

Return a valid JSON object matching this schema:
{
  "category": "${category}",
  "title": "${category.toUpperCase()} Implementation Prompt",
  "role": "You are a senior full-stack engineer and security architect specialized in Next.js 15, Tailwind, and Supabase...",
  "projectContext": "Building ${projectName}: ${productDescription}",
  "currentState": "Initial application scaffold with Supabase auth and basic navigation active...",
  "objective": "Implement the complete ${category} module with robust server-side ownership checks, atomic mutations, and responsive UI...",
  "requirements": [
    "Write clean, well-commented, production-ready TypeScript code.",
    "Separate client state from server action API handlers."
  ],
  "existingArchitecture": "Next.js App Router with Server Components, Supabase PostgreSQL, Row Level Security, and Tailwind CSS.",
  "technicalConstraints": [
    "Do not add third-party dependencies unless strictly necessary.",
    "Use SVG Lucide icons exclusively; zero emojis."
  ],
  "uxRequirements": [
    "Provide explicit empty, loading, and error states for all asynchronous operations.",
    "Maintain fluid responsiveness across mobile (360px), tablet (768px), and desktop (1280px+)."
  ],
  "securityRequirements": [
    "Enforce server-side project ownership verification on all resource routes (defend against IDOR).",
    "Sanitize and validate all incoming payload fields using Zod schemas.",
    "Treat all user inputs as untrusted data."
  ],
  "edgeCases": [
    "Handle expired auth sessions during in-flight form submissions.",
    "Gracefully catch network disconnects with retry feedback."
  ],
  "doNotChange": [
    "Do not modify core authentication middleware or session cookie configs.",
    "Do not remove existing project routing structure."
  ],
  "acceptanceCriteria": [
    "0 TypeScript compiler errors on 'tsc --noEmit'.",
    "All new server actions return typed responses { data, error }.",
    "Responsive layout tested and verified on mobile viewport."
  ],
  "testingRequirements": [
    "Add unit tests validating authorized vs unauthorized access attempts.",
    "Verify error states with invalid payload inputs."
  ],
  "validation": [
    "Execute 'npm run build' and verify clean compilation.",
    "Run unit tests and verify 100% pass."
  ],
  "expectedOutput": "List all created and modified files, summarize security measures implemented, and provide verification command results."
}
`;

  if (!apiKey) {
    const rawData: GeneratedPromptData = {
      category,
      title: `${category.toUpperCase()} Implementation Prompt`,
      role: `You are a senior full-stack engineer and security architect specialized in Next.js 15, Tailwind, and Supabase, building for ${codingAgent}.`,
      projectContext: `Building ${projectName}: ${productDescription}.`,
      currentState: "Initial project foundation with authentication and workspace navigation configured.",
      objective: `Implement the complete ${category} module with robust server-side ownership checks, atomic mutations, and responsive UI.`,
      requirements: [
        "Write clean, well-commented, production-ready TypeScript code.",
        "Separate client state from server action API handlers.",
        "Use real Unsplash imagery URLs and pure Lucide SVG icons (0 emojis).",
      ],
      existingArchitecture: "Next.js App Router with React Server Components, Supabase PostgreSQL with RLS, and Tailwind CSS.",
      technicalConstraints: [
        "Avoid fragile external dependencies.",
        "Use Server Actions for database mutations and route handlers for REST webhooks.",
      ],
      uxRequirements: [
        "Provide explicit empty, loading, error, and success states for all interactive actions.",
        "Ensure fluid responsiveness across mobile (360px), tablet, and desktop viewports.",
      ],
      securityRequirements: [
        "Enforce server-side ownership verification on all resource routes (prevent IDOR).",
        "Sanitize and validate all incoming payload fields using Zod schemas.",
        "Never trust client-provided user IDs.",
      ],
      edgeCases: [
        "Handle expired auth sessions during in-flight mutations without data loss.",
        "Gracefully catch network disconnects with offline indicator feedback.",
        "Prevent duplicate form submissions with idempotency safeguards.",
      ],
      doNotChange: [
        "Do not modify core authentication middleware or session cookie configs.",
        "Do not alter existing database migration sequences.",
      ],
      acceptanceCriteria: [
        "0 TypeScript compiler errors on 'npx tsc --noEmit'.",
        "All server actions enforce authenticated user ownership.",
        "Responsive layout verified on mobile, tablet, and desktop.",
      ],
      testingRequirements: [
        "Add authorization unit tests covering owner, non-owner, and unauthenticated requests.",
        "Verify form validation against malformed payloads.",
      ],
      validation: [
        "Run 'npx tsc --noEmit' to verify type safety.",
        "Run 'npm run build' to confirm clean production packaging.",
      ],
      expectedOutput: "List all created and modified files, summarize security measures implemented, and provide verification command results.",
      fullPromptText: "",
    };

    rawData.fullPromptText = formatPromptForAgent(rawData, codingAgent);
    return rawData;
  }

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

    parsed.fullPromptText = formatPromptForAgent(parsed, codingAgent);
    return parsed;
  } catch (err) {
    console.error("Structured prompt generation error:", err);
    throw err;
  }
}
