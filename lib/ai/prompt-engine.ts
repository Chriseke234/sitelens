import { getGeminiApiKey } from "./client";
import { PromptCategory } from "@/types";

export interface GeneratedPromptData {
  category: PromptCategory;
  title: string;
  role: string;
  projectContext: string;
  currentState: string;
  objective: string;
  requirements: string[];
  constraints: string[];
  securityRequirements: string[];
  edgeCases: string[];
  acceptanceCriteria: string[];
  validation: string[];
  outputRequirements: string;
  fullPromptText: string;
}

/**
 * Generate a structured coding prompt following the 11-part Aigenstra prompt framework.
 */
export async function generateStructuredPrompt(
  projectName: string,
  productDescription: string,
  category: PromptCategory,
  codingEnvironment: string
): Promise<GeneratedPromptData> {
  const apiKey = getGeminiApiKey();

  const prompt = `
System Instruction:
You are the Lead Vibe-Coding Prompt Engineering AI Agent for Aigenstra V2.
Generate an 11-part structured implementation prompt for a developer using ${codingEnvironment}.
Category: ${category}
Project: ${projectName}
Description: ${productDescription}

Strictly follow this 11-part structure:
1. ROLE
2. PROJECT CONTEXT
3. CURRENT STATE
4. OBJECTIVE
5. REQUIREMENTS
6. CONSTRAINTS
7. SECURITY REQUIREMENTS
8. EDGE CASES
9. ACCEPTANCE CRITERIA
10. VALIDATION
11. OUTPUT REQUIREMENTS

Return a valid JSON object matching this schema:
{
  "category": "${category}",
  "title": "${category.toUpperCase()} Implementation Prompt",
  "role": "You are an expert full-stack engineer acting as a vibe-coding assistant...",
  "projectContext": "Building ${projectName}: ${productDescription}",
  "currentState": "Initializing initial feature foundation...",
  "objective": "Implement robust ${category} module with production security...",
  "requirements": ["Requirement 1", "Requirement 2"],
  "constraints": ["Do not modify existing auth middleware", "Do not add payments"],
  "securityRequirements": ["Enforce server-side ownership check", "Sanitize inputs with Zod"],
  "edgeCases": ["Handle network disconnects gracefully"],
  "acceptanceCriteria": ["All tests pass with 0 errors"],
  "validation": ["Run typecheck (tsc --noEmit)"],
  "outputRequirements": "Report changed files, security verification result, and test outputs.",
  "fullPromptText": "ROLE\\nYou are...\\n\\nPROJECT CONTEXT\\n..."
}
`;

  if (!apiKey) {
    const defaultText = `ROLE
You are an expert full-stack engineer acting as a vibe-coding assistant in ${codingEnvironment}.

PROJECT CONTEXT
Building ${projectName}: ${productDescription}.

CURRENT STATE
Initializing initial feature foundation and routing.

OBJECTIVE
Implement robust ${category} module with production security.

REQUIREMENTS
1. Write clean, responsive, modular code.
2. Separate client UI components from server API logic.

CONSTRAINTS
1. Do not modify existing authentication middleware.
2. Do not introduce payment code until explicitly instructed.

SECURITY REQUIREMENTS
1. Enforce server-side ownership verification on all resource routes.
2. Sanitize all client request inputs with Zod.

EDGE CASES
1. Handle null/undefined properties gracefully without crashing.
2. Provide visual error toast feedback on network failure.

ACCEPTANCE CRITERIA
1. 0 compilation errors on typecheck.
2. Fully responsive across desktop, tablet, and mobile.

VALIDATION
1. Run tsc --noEmit.
2. Verify UI responsiveness.

OUTPUT REQUIREMENTS
Summarize changed files, security checks, and verification results.`;

    return {
      category,
      title: `${category.toUpperCase()} Implementation Prompt`,
      role: `You are an expert full-stack engineer acting as a vibe-coding assistant in ${codingEnvironment}.`,
      projectContext: `Building ${projectName}: ${productDescription}.`,
      currentState: "Initializing initial feature foundation and routing.",
      objective: `Implement robust ${category} module with production security.`,
      requirements: [
        "Write clean, responsive, modular code.",
        "Separate client UI components from server API logic.",
      ],
      constraints: [
        "Do not modify existing authentication middleware.",
        "Do not introduce payment code until explicitly instructed.",
      ],
      securityRequirements: [
        "Enforce server-side ownership verification on all resource routes.",
        "Sanitize all client request inputs with Zod.",
      ],
      edgeCases: [
        "Handle null/undefined properties gracefully without crashing.",
        "Provide visual error toast feedback on network failure.",
      ],
      acceptanceCriteria: [
        "0 compilation errors on typecheck.",
        "Fully responsive across desktop, tablet, and mobile.",
      ],
      validation: ["Run tsc --noEmit.", "Verify UI responsiveness."],
      outputRequirements: "Summarize changed files, security checks, and verification results.",
      fullPromptText: defaultText,
    };
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
    return JSON.parse(rawText);
  } catch (err) {
    console.error("Structured prompt generation error:", err);
    throw err;
  }
}
