import { getGeminiApiKey } from "./client";
import { AgentRole, AgentMessageType, AgentMessage } from "@/types";

export interface CouncilDiscussionResult {
  topic: string;
  agentMessages: AgentMessage[];
  decision: {
    decisionNumber: number;
    adrNumber: string;
    topic: string;
    problem: string;
    decision: string;
    reason: string;
    agentContributions: Array<{ agentName: string; stance: string }>;
    alternativesConsidered: string[];
    impactedAreas: string[];
    consequences: string;
    status: string;
  };
}

/**
 * Execute a Multi-Agent Council Discussion orchestrated by the AI Orchestrator Agent.
 * Agents:
 * 1. Orchestrator Agent (Orchestration & Final ADR Decision)
 * 2. Product Agent (Scope & User Value)
 * 3. UX Agent (Flows, Friction, User Centricity)
 * 4. Design Agent (Component Systems & Visual Consistency)
 * 5. Implementation Advisor (Prompt & Code Architecture Guidelines)
 * 6. Security Agent (Threat Modeling, Authz, Zero Trust)
 * 7. QA Agent (Edge Cases & Verification Criteria)
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
You manage a multidisciplinary council of 7 specialized AI agents:
1. Orchestrator Agent (Facilitator & Decision Arbiter)
2. Product Agent (User Value, Feature Scope, ROI)
3. UX Agent (Friction, Onboarding, Information Architecture)
4. Design Agent (Design Systems, Responsive States, Accessibility)
5. Implementation Advisor (Code Architecture, Tech Stack Boundaries, Prompt Directives)
6. Security Agent (Threat Modeling, IDOR Prevention, Authz, Data Privacy)
7. QA Agent (Edge Cases, Verification Matrix, Regression Traps)

Topic for Debate: "${topic}"
Project: ${projectName}
Description: ${productDescription}

Simulate an authentic, structured, multi-turn technical council debate among relevant agents (4-6 messages total).
Each message MUST have a valid messageType chosen from:
- ANALYSIS (Initial technical breakdown or evidence)
- QUESTION (Inquiry or request for clarification)
- CONCERN (Security risk, UX friction, tech debt alert)
- PROPOSAL (Concrete architectural or product solution)
- DISAGREEMENT (Direct counter-argument or conflict)
- AGREEMENT (Concurrence with previous speaker)
- DECISION (Definitive ruling by Orchestrator Agent)

The Orchestrator Agent MUST conclude with a definitive Architecture Decision Record (ADR) resolution.

Return a valid JSON object matching this schema:
{
  "topic": "${topic}",
  "agentMessages": [
    {
      "agentId": "product",
      "agentName": "Product Agent",
      "messageType": "PROPOSAL",
      "content": "...",
      "timestamp": "${new Date().toISOString()}"
    }
  ],
  "decision": {
    "decisionNumber": 1,
    "adrNumber": "ADR-001",
    "topic": "${topic}",
    "problem": "...",
    "decision": "...",
    "reason": "...",
    "agentContributions": [
      { "agentName": "Product Agent", "stance": "Supported for user onboarding speed" },
      { "agentName": "Security Agent", "stance": "Required token verification on server" }
    ],
    "alternativesConsidered": ["Alternative 1", "Alternative 2"],
    "impactedAreas": ["Authentication", "API Handlers", "Database RLS"],
    "consequences": "Allows frictionless entry while maintaining strict data isolation.",
    "status": "ACCEPTED"
  }
}
`;

  if (!apiKey) {
    return {
      topic,
      agentMessages: [
        {
          agentId: "product",
          agentName: "Product Agent",
          messageType: "PROPOSAL",
          content: `We should adopt an optimized workflow for "${topic}" to maximize user onboarding speed without bloated prerequisites.`,
          timestamp: new Date().toISOString(),
        },
        {
          agentId: "ux",
          agentName: "UX Agent",
          messageType: "ANALYSIS",
          content: "Requiring multi-step verification prior to initial value discovery causes high bounce rates. Progressive onboarding is essential.",
          timestamp: new Date().toISOString(),
        },
        {
          agentId: "sec",
          agentName: "Security Agent",
          messageType: "CONCERN",
          content: "Frictionless flows must not bypass server-side authorization. All temporary access tokens must be cryptographically signed and ephemeral.",
          timestamp: new Date().toISOString(),
        },
        {
          agentId: "impl",
          agentName: "Implementation Advisor",
          messageType: "PROPOSAL",
          content: "We can implement atomic Supabase RLS policies paired with Next.js Server Actions to ensure zero client-side credential exposure.",
          timestamp: new Date().toISOString(),
        },
        {
          agentId: "qa",
          agentName: "QA Agent",
          messageType: "QUESTION",
          content: "How do we handle expired guest session states during an in-flight mutation without losing user inputs?",
          timestamp: new Date().toISOString(),
        },
        {
          agentId: "orchestrator",
          agentName: "Orchestrator Agent",
          messageType: "DECISION",
          content: `Consensus synthesized: Proceed with progressive onboarding with cryptographically signed ephemeral tokens and atomic Supabase RLS. Session expiry will cache local state in IndexedDB.`,
          timestamp: new Date().toISOString(),
        },
      ],
      decision: {
        decisionNumber: 1,
        adrNumber: "ADR-001",
        topic,
        problem: `Balancing frictionless user onboarding against zero-trust authorization for ${topic}.`,
        decision: `Adopt progressive onboarding with cryptographically signed ephemeral tokens, atomic RLS policies, and client-side draft preservation.`,
        reason: `Maximizes conversion velocity while maintaining bulletproof data isolation and zero IDOR vulnerability.`,
        agentContributions: [
          { agentName: "Product Agent", "stance": "Advocated rapid time-to-value" },
          { agentName: "Security Agent", "stance": "Enforced signed server-side token checks" },
          { agentName: "Implementation Advisor", "stance": "Standardized on Next.js Server Actions & RLS" },
        ],
        alternativesConsidered: [
          "Enforce mandatory email verification before any interaction",
          "Unauthenticated public endpoints without RLS"
        ],
        impactedAreas: ["Authentication Layer", "API Route Handlers", "Supabase Row Level Security"],
        consequences: "Increased initial conversion while maintaining zero-trust isolation. Requires handling token refresh logic on the client.",
        status: "ACCEPTED",
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
            temperature: 0.2,
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
