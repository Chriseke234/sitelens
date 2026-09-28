import { getGeminiApiKey } from "./client";
import { UserPersona, FunctionalRequirement, NonFunctionalRequirement } from "@/types";

/**
 * Generate Discovery Q&A follow-ups based on initial idea and previous answers.
 */
export async function generateDiscoveryQuestions(
  projectName: string,
  productDescription: string,
  previousQnA: Array<{ question: string; answer?: string | null }>
): Promise<string[]> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return [
      "Who experiences the core problem most frequently?",
      "When and where does the problem typically occur (context)?",
      "What does an ideal, effortless outcome look like for the user?",
      "What critical assumptions are we currently making about user behavior?",
      "What potential business or technical risks could cause this product to fail?",
    ];
  }

  const prompt = `
System Instruction:
You are an expert AI Product Manager conducting a discovery session for Aigenstra.
Analyze the project details and previous answers. Identify missing critical product information.
Break discovery down into:
- Problem (What problem is the product attempting to solve?)
- Users (Who experiences the problem?)
- Context (When and where does it happen?)
- Desired outcome (What does success look like?)
- Assumptions (What are we currently assuming?)
- Unknowns (What don't we know yet?)
- Risks (What could make the product fail?)

Generate 3 to 5 clear, progressive follow-up questions to clarify scope.
Do NOT ask technical stack questions.

Project: ${projectName}
Description: ${productDescription}

Previous Q&A Context:
${JSON.stringify(previousQnA, null, 2)}

Respond ONLY with a JSON array of string questions, e.g. ["Question 1?", "Question 2?"]
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
            temperature: 0.3,
          },
        }),
      }
    );

    const resData = await res.json();
    const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText);
    return Array.isArray(parsed) ? parsed : [parsed.question || "What is the primary action a user takes?"];
  } catch (err) {
    console.error("Discovery question generation error:", err);
    return [
      "Who experiences the core problem most frequently?",
      "What does an ideal, effortless outcome look like for the user?",
      "What critical assumptions are we currently making about user behavior?",
      "What potential risks could cause this product to fail?",
    ];
  }
}

/**
 * Generate Research Synthesis document with explicit label tagging:
 * VERIFIED, INFERRED, ASSUMPTION, NEEDS RESEARCH.
 */
export async function generateResearchDocument(
  projectName: string,
  productDescription: string,
  qnaContext: Array<{ question: string; answer?: string | null }>
) {
  const apiKey = getGeminiApiKey();

  const prompt = `
System Instruction:
You are the Lead Research AI Agent for Aigenstra.
Synthesize market context, user context, competitor landscape, user needs, risks, assumptions, and hypotheses for ${projectName}.
CRITICAL RULE: Explicitly label all assumptions and findings using these exact labels:
- VERIFIED (proven fact or user confirmed)
- INFERRED (logical deduction from context)
- ASSUMPTION (unverified premise)
- NEEDS RESEARCH (unknown requiring validation)

Project: ${projectName}
Description: ${productDescription}
Discovery Insights:
${JSON.stringify(qnaContext, null, 2)}

Return a valid JSON object matching this schema:
{
  "market_context": "Detailed market overview...",
  "user_context": "Target user context & workflow...",
  "competitor_analysis": [
    { "name": "Competitor Name", "strengths": "...", "weaknesses": "...", "differentiation": "..." }
  ],
  "user_needs": ["Need 1", "Need 2"],
  "risks": [
    { "risk": "Risk description", "severity": "HIGH/MEDIUM/LOW", "mitigation": "..." }
  ],
  "opportunities": ["Opportunity 1", "Opportunity 2"],
  "assumptions": [
    { "assumption": "Users prefer WhatsApp over mobile app download", "status": "ASSUMPTION" },
    { "assumption": "Local providers have stable smartphone access", "status": "VERIFIED" },
    { "assumption": "Average ticket size justifies 5% transaction commission", "status": "NEEDS RESEARCH" }
  ],
  "hypotheses": ["Guest checkout increases conversion by 30%"],
  "sources": [
    { "title": "Industry E-Commerce & Service Benchmarks", "notes": "Baseline metrics" }
  ]
}
`;

  if (!apiKey) {
    return {
      market_context: `The market for ${projectName} represents a high-growth opportunity in on-demand service and workflow automation.`,
      user_context: `Target users experience high friction in manual scheduling and status tracking.`,
      competitor_analysis: [
        { name: "Legacy Alternatives", strengths: "Brand presence", weaknesses: "Clunky UI, mandatory signup barriers", differentiation: "Instant AI-assisted workflows & friction-free checkout" }
      ],
      user_needs: ["Rapid task execution", "Transparent pricing", "Data security"],
      risks: [{ risk: "User abandonment at signup modal", severity: "HIGH", mitigation: "Enable guest flow with secure order tokens" }],
      opportunities: ["Automated status notifications", "Mobile-optimized progressive app"],
      assumptions: [
        { assumption: "Target users prefer quick mobile web access over app store downloads", status: "VERIFIED" as const },
        { assumption: "Providers can manage orders via simple web dashboard", status: "INFERRED" as const },
        { assumption: "Average user repeats orders twice per month", status: "NEEDS RESEARCH" as const },
      ],
      hypotheses: ["Zero-friction onboarding increases completion rates by 35%"],
      sources: [{ title: "Aigenstra Service Benchmarks", notes: "Standard SaaS & marketplace metrics" }],
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
    console.error("Research document generation error:", err);
    throw err;
  }
}

/**
 * Generate Visual User Journey document.
 */
export async function generateUserJourneyDocument(
  projectName: string,
  productDescription: string
) {
  const apiKey = getGeminiApiKey();

  const prompt = `
System Instruction:
You are the Lead UX AI Agent for Aigenstra.
Generate a complete visual user journey mapping out step-by-step interactions for ${projectName}:
Discovery → Landing Page → Sign Up / Guest → Onboarding → Dashboard → Core Action → Confirmation → Return / Retention.

For every stage capture:
- User Goal
- User Action
- System Response
- Potential Friction
- Possible Failure
- Security Consideration

Also include Happy Path, Edge Cases, and Failure Recovery Paths.

Project: ${projectName}
Description: ${productDescription}

Return a valid JSON object matching this schema:
{
  "title": "Core Customer Journey — ${projectName}",
  "persona": "Primary User",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Discovery & Landing Page",
      "userGoal": "Understand value proposition and options",
      "userAction": "Browses services and pricing",
      "systemResponse": "Renders responsive hero and value propositions",
      "friction": "Ambiguous CTAs",
      "possibleFailure": "Slow asset load",
      "errorStates": ["Failed image load"],
      "alternativePaths": ["Direct search query"],
      "security": "HTTPS & Content Security Policy enforced"
    }
  ],
  "happy_path": ["Discovery", "Select Option", "Provide Details", "Confirm & Pay", "Receive Value", "Repeat"],
  "edge_cases": [
    { "scenario": "Network disconnect during submission", "resolution": "Local state autosave and offline retry indicator" }
  ],
  "failure_paths": [
    { "trigger": "Payment authorization failure", "userMessage": "Payment failed. Please verify details or try another method.", "fallbackAction": "Allow retry without losing form input state" }
  ]
}
`;

  if (!apiKey) {
    return {
      title: `Core Customer Journey — ${projectName}`,
      persona: "Primary User",
      steps: [
        {
          stepNumber: 1,
          title: "Discovery & Value Understanding",
          userGoal: "Understand service offering and pricing",
          userAction: "Visits landing page",
          systemResponse: "Displays clear headline, demo, and primary action button",
          friction: "Too much text above fold",
          possibleFailure: "Slow initial render",
          errorStates: ["CDN asset timeout"],
          alternativePaths: ["Direct link to order form"],
          security: "HTTPS & CSRF protection",
        },
        {
          stepNumber: 2,
          title: "Configuration & Order Entry",
          userGoal: "Configure preferences and submit request",
          userAction: "Fills out responsive order form",
          systemResponse: "Real-time client validation and subtotal computation",
          friction: "Unclear input labels",
          possibleFailure: "Validation errors",
          errorStates: ["Invalid phone/email format"],
          alternativePaths: ["Save draft locally"],
          security: "Zod server-side sanitization",
        },
      ],
      happy_path: ["Landing", "Configuration", "Confirmation", "Tracking", "Retention"],
      edge_cases: [{ scenario: "User navigates away mid-order", resolution: "Restore draft state on return" }],
      failure_paths: [{ trigger: "Form validation error", userMessage: "Please check highlighted fields", fallbackAction: "Auto-focus first error field" }],
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
    console.error("User journey generation error:", err);
    throw err;
  }
}

/**
 * Generate Product Specification (PRD) with Personas, FRs, NFRs, and Edge Cases.
 */
export async function generateProductSpecDocument(
  projectName: string,
  productDescription: string
) {
  const apiKey = getGeminiApiKey();

  const prompt = `
System Instruction:
You are the Principal Product Agent for Aigenstra.
Generate a structured Product Requirements Document (PRD) for ${projectName}.
Include:
1. Problem Statement
2. Target Users & Lightweight Personas (Goal, Pain, Technical Ability [Low/Medium/High], Primary Task)
3. Core Goals & Non-Goals (Anti-bloat filter)
4. Structured Functional Requirements (e.g. FR-001: Users can create an account)
5. Structured Non-Functional Requirements (e.g. NFR-001: Sub-second latency, NFR-002: Server-side authorization)
6. Automatic Edge Cases for every major feature
7. Business Rules & Acceptance Criteria
8. MVP Scope vs Future Scope

Project: ${projectName}
Description: ${productDescription}

Return a valid JSON object matching this schema:
{
  "problem_statement": "...",
  "target_users": ["User Segment 1", "User Segment 2"],
  "personas": [
    { "name": "Business Owner", "goal": "Get orders without manual phone calls", "pain": "Repeated customer questions", "technicalAbility": "Low", "primaryTask": "Create and manage orders" }
  ],
  "goals": ["Goal 1", "Goal 2"],
  "non_goals": ["In-app social feed (anti-bloat)"],
  "user_stories": [
    { "title": "Place Order", "asA": "customer", "iWantTo": "book service quickly", "soThat": "I save time", "priority": "CRITICAL" }
  ],
  "functional_reqs": ["FR-001: Users can create account", "FR-002: Users can place orders"],
  "structured_functional_reqs": [
    { "code": "FR-001", "title": "User Account & Guest Flow", "description": "Users can authenticate or proceed with secure guest order tokens.", "priority": "CRITICAL" },
    { "code": "FR-002", "title": "Order Management", "description": "Users can view real-time status of submitted orders.", "priority": "HIGH" }
  ],
  "non_functional_reqs": ["NFR-001: Sub-second page load", "NFR-002: Server-side authorization"],
  "structured_non_functional_reqs": [
    { "code": "NFR-001", "title": "Security & Authorization", "description": "Every API endpoint must enforce server-side ownership checks.", "category": "Security" },
    { "code": "NFR-002", "title": "Mobile Responsiveness", "description": "UI must render seamlessly across 360px to 4K displays.", "category": "Usability" }
  ],
  "business_rules": ["Order cancellation permitted up to 1 hour prior to pickup"],
  "acceptance_criteria": ["Order confirmation returns valid tracking code and SMS link"],
  "edge_cases": [
    "Email already registered during guest checkout upgrade",
    "Network disconnect mid-payment submission",
    "Duplicate request submitted within 30 seconds"
  ],
  "mvp_scope": ["Landing page", "Order booking form", "Order status view", "Admin portal"],
  "future_scope": ["Subscription recurring billing", "Native mobile push notifications"]
}
`;

  if (!apiKey) {
    return {
      problem_statement: `Users lack an efficient, transparent way to request and track ${projectName} services online.`,
      target_users: ["Busy urban professionals", "Service providers"],
      personas: [
        {
          name: "Busy Professional",
          goal: "Book services quickly on mobile without phone calls",
          pain: "Unpredictable wait times and confusing pricing",
          technicalAbility: "Medium" as const,
          primaryTask: "Submit request and track status",
        },
      ],
      goals: ["Enable 2-minute booking flow", "Provide real-time status updates"],
      non_goals: ["In-app social networking", "Complex multi-tier loyalty exchange (anti-bloat)"],
      user_stories: [
        { title: "Service Booking", asA: "busy customer", iWantTo: "book service in 2 minutes", soThat: "I don't waste time", priority: "CRITICAL" },
      ],
      functional_reqs: ["FR-001: Secure authentication & guest checkout", "FR-002: Real-time status tracking"],
      structured_functional_reqs: [
        { code: "FR-001", title: "Authentication & Guest Flow", description: "Users can register or proceed as guest with secure order tokens.", priority: "CRITICAL" as const },
        { code: "FR-002", title: "Status Tracking", description: "Live progress dashboard for active orders.", priority: "HIGH" as const },
      ],
      non_functional_reqs: ["NFR-001: Server-side authorization", "NFR-002: Mobile responsiveness"],
      structured_non_functional_reqs: [
        { code: "NFR-001", title: "Security & Authorization", description: "Enforce ownership verification on all resource routes.", category: "Security" as const },
        { code: "NFR-002", title: "Mobile Performance", description: "Sub-second page loading speed on 4G connections.", category: "Performance" as const },
      ],
      business_rules: ["Order cancellation allowed up to 1h before pickup"],
      acceptance_criteria: ["Form submission generates tracking code and displays confirmation screen"],
      edge_cases: [
        "User registers with already existing email address",
        "Network drop during form submission",
        "Duplicate order submission within 30 seconds",
      ],
      mvp_scope: ["Landing page", "Order booking flow", "Status tracking", "Admin overview"],
      future_scope: ["Recurring subscriptions", "Native mobile app push notifications"],
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
    console.error("Product spec generation error:", err);
    throw err;
  }
}
