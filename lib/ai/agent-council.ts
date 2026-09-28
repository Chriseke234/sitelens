import { getGeminiApiKey } from "./client";
import { AgentRole, AgentMessage } from "@/types";

export interface CouncilDiscussionResult {
  topic: string;
  agentMessages: AgentMessage[];
  decision: {
    decisionNumber: number;
    topic: string;
    problem: string;
    decision: string;
    reason: string;
    agentContributions: Array<{ agentName: string; stance: string }>;
    alternativesConsidered: string[];
    impactedAreas: string[];
    status: string;
  };
}

/**
 * Execute a Multi-Agent Council Discussion orchestrated by the AI Orchestrator Agent.
 */
export async function runAgentCouncilDiscussion(
  projectName: string,
  productDescription: string,
  topic: string
): Promise<CouncilDiscussionResult> {
  const apiKey = getGeminiApiKey();

  const prompt = `
System Instruction:
You are the AI Orchestrator Agent for Aigenstra V2.
You manage a multidisciplinary council of specialized AI agents:
1. Product Manager Agent (Requirements & Scope)
2. Research Agent (Market & User Evidence)
3. UX Agent (User Journeys & Friction)
4. UI Agent (Interface & Component System)
5. Frontend Engineer Agent (Client State & Components)
6. Backend Engineer Agent (APIs, Server Logic, Database)
7. Security Engineer Agent (Threat Modeling & Authz)
8. QA Agent (Test Scenarios & Edge Cases)
9. Performance Agent (Latency & Bundle Size)
10. Auditor Agent (Contradiction & Assumption Detection)

Topic for Debate: "${topic}"
Project: ${projectName}
Description: ${productDescription}

Simulate a realistic structured discussion among relevant agents (4-6 messages total).
Show initial positions, evidence/reasoning, security/usability trade-offs, and final consensus decision.
Do NOT allow endless debate. The Orchestrator MUST synthesize a definitive, actionable decision.

Return a valid JSON object matching this schema:
{
  "topic": "${topic}",
  "agentMessages": [
    { "agentId": "pm", "agentName": "Product Manager Agent", "content": "...", "timestamp": "${new Date().toISOString()}" }
  ],
  "decision": {
    "decisionNumber": 1,
    "topic": "${topic}",
    "problem": "...",
    "decision": "...",
    "reason": "...",
    "agentContributions": [
      { "agentName": "Product Manager Agent", "stance": "Supported for conversion" }
    ],
    "alternativesConsidered": ["Alternative 1"],
    "impactedAreas": ["Authentication", "Orders API", "Database RLS"],
    "status": "APPROVED BY COUNCIL"
  }
}
`;

  if (!apiKey) {
    return {
      topic,
      agentMessages: [
        {
          agentId: "pm",
          agentName: "Product Manager Agent",
          content: `We should evaluate "${topic}" to streamline customer onboarding while protecting business logic.`,
          timestamp: new Date().toISOString(),
        },
        {
          agentId: "ux",
          agentName: "UX Agent",
          content: "Requiring account registration before order review creates conversion friction. Guest flow is preferred.",
          timestamp: new Date().toISOString(),
        },
        {
          agentId: "sec",
          agentName: "Security Engineer Agent",
          content: "Guest flow is acceptable if order lookup uses cryptographically secure tokens and server-side ownership verification.",
          timestamp: new Date().toISOString(),
        },
        {
          agentId: "backend",
          agentName: "Backend Engineer Agent",
          content: "We can issue a signed JWT order token upon creation and enforce token validation on the order status endpoint.",
          timestamp: new Date().toISOString(),
        },
        {
          agentId: "orchestrator",
          agentName: "Orchestrator Agent",
          content: `Decision reached: Implement guest checkout with secure ownership token verification. Affected areas: Auth, API, DB RLS.`,
          timestamp: new Date().toISOString(),
        },
      ],
      decision: {
        decisionNumber: Math.floor(Math.random() * 100) + 1,
        topic,
        problem: `Balancing onboarding friction against order access authorization for ${topic}.`,
        decision: `Approve guest checkout flow backed by cryptographic order ownership tokens and server-side verification.`,
        reason: `Maximizes conversion rate while enforcing strict data isolation and preventing IDOR vulnerabilities.`,
        agentContributions: [
          { agentName: "Product Manager Agent", stance: "Promote conversion" },
          { agentName: "Security Engineer Agent", stance: "Enforce server token check" },
        ],
        alternativesConsidered: ["Mandatory registration prior to checkout", "Unprotected public order endpoint"],
        impactedAreas: ["Authentication", "API Route Handlers", "Database RLS Policies"],
        status: "APPROVED BY COUNCIL",
      },
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
            temperature: 0.3,
          },
        }),
      }
    );

    const resData = await res.json();
    const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(rawText);
  } catch (err) {
    console.error("Agent council discussion error:", err);
    throw err;
  }
}
