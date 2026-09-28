import { getGeminiApiKey } from "./client";

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
      "Who is the primary target customer for this product?",
      "What specific friction or problem currently makes their workflow difficult?",
      "How will providers/partners interact with the platform?",
      "What is your primary revenue model or business success metric?",
      "What constraints (budget, timeline, security, compliance) exist for launch?",
    ];
  }

  const prompt = `
System Instruction:
You are an expert AI Product Manager conducting a discovery session for an AI Product Engineering workspace called Aigenstra.
Analyze the project details and previous answers. Identify missing critical product information.
Generate 3 to 5 clear, intelligent follow-up questions to clarify the product scope.
Do NOT ask technical stack questions. Focus on user motivation, business goals, core workflows, edge cases, and constraints.

Project Name: ${projectName}
Product Description: ${productDescription}

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

    if (!res.ok) {
      throw new Error(`Gemini API returned status ${res.status}`);
    }

    const resData = await res.json();
    const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("Empty response from Gemini API");

    const parsed = JSON.parse(rawText);
    return Array.isArray(parsed) ? parsed : [parsed.question || "What is the primary action a user takes?"];
  } catch (err) {
    console.error("Discovery question generation error:", err);
    return [
      "Who is the primary customer for this product?",
      "What currently makes their experience difficult?",
      "What is the main action they must complete in the app?",
      "What are the non-negotiable security or privacy requirements?",
    ];
  }
}

/**
 * Generate Research Synthesis document.
 */
export async function generateResearchDocument(
  projectName: string,
  productDescription: string,
  qnaContext: Array<{ question: string; answer?: string | null }>
) {
  const apiKey = getGeminiApiKey();

  const prompt = `
System Instruction:
You are a senior Market & User Research AI Agent for Aigenstra.
Synthesize market context, user context, competitor landscape, user needs, risks, assumptions, and hypotheses for this product idea.
Clearly separate verified information, user-provided assumptions, and AI-generated hypotheses. Never present AI assumptions as verified facts.

Project: ${projectName}
Description: ${productDescription}
Discovery Insights:
${JSON.stringify(qnaContext, null, 2)}

Return a valid JSON object matching this schema:
{
  "market_context": "Detailed market overview...",
  "user_context": "Target user demographics & pain points...",
  "competitor_analysis": [
    { "name": "Competitor Name", "strengths": "...", "weaknesses": "...", "differentiation": "..." }
  ],
  "user_needs": ["Need 1", "Need 2"],
  "risks": [
    { "risk": "Description", "severity": "HIGH/MEDIUM/LOW", "mitigation": "..." }
  ],
  "opportunities": ["Opportunity 1", "Opportunity 2"],
  "assumptions": [
    { "assumption": "Text", "status": "unverified" }
  ],
  "hypotheses": ["Hypothesis 1"],
  "sources": [
    { "title": "Industry Benchmark", "notes": "Reference baseline" }
  ]
}
`;

  if (!apiKey) {
    return {
      market_context: `The market for ${projectName} represents a high-growth opportunity in tech-enabled service automation.`,
      user_context: `Target users require seamless, low-friction interactions and real-time status visibility.`,
      competitor_analysis: [
        { name: "Legacy Alternatives", strengths: "Brand awareness", weaknesses: "High friction, poor mobile UX", differentiation: "AI-assisted workflows & instant verification" }
      ],
      user_needs: ["Fast order placement", "Transparent pricing", "Secure data protection"],
      risks: [{ risk: "User drop-off at account registration", severity: "HIGH", mitigation: "Implement guest checkout with secure order tokens" }],
      opportunities: ["Automated status notifications", "Mobile-optimized progressive app"],
      assumptions: [{ assumption: "Users prefer mobile web access over app downloads", status: "unverified" as const }],
      hypotheses: ["Guest checkout increases conversion by over 25%"],
      sources: [{ title: "Aigenstra UX Benchmarks", notes: "Standard e-commerce & SaaS metrics" }],
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
You are a lead UX AI Agent for Aigenstra.
Generate a complete visual user journey mapping out step-by-step interactions, happy paths, edge cases, and failure recovery paths for ${projectName}.
Include friction points, system responses, error states, and security checks for every step.

Project: ${projectName}
Description: ${productDescription}

Return a valid JSON object matching this schema:
{
  "title": "Primary Customer Journey - ${projectName}",
  "persona": "Target Customer",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Landing Page Discovery",
      "userGoal": "Understand value proposition and options",
      "userAction": "Browses services and pricing",
      "systemResponse": "Renders responsive hero & interactive preview",
      "friction": "Unclear navigation links",
      "errorStates": ["Failed asset load"],
      "alternativePaths": ["Direct search query"],
      "security": "HTTPS enforced"
    }
  ],
  "happy_path": ["Discover", "Select Service", "Provide Details", "Confirm & Pay", "Receive Value"],
  "edge_cases": [
    { "scenario": "Network disconnect during submission", "resolution": "Local state autosave & offline retry indicator" }
  ],
  "failure_paths": [
    { "trigger": "Payment authorization fails", "userMessage": "Payment failed. Please verify card details or choose another method.", "fallbackAction": "Allow retry without losing order details" }
  ]
}
`;

  if (!apiKey) {
    return {
      title: `Primary Customer Journey - ${projectName}`,
      persona: "Primary App User",
      steps: [
        {
          stepNumber: 1,
          title: "Discovery & Value Understanding",
          userGoal: "Understand what the service provides",
          userAction: "Visits landing page",
          systemResponse: "Displays clear value headline and primary CTA button",
          friction: "Too much text above the fold",
          errorStates: ["Slow image load"],
          alternativePaths: ["Direct link to order form"],
          security: "CSRF & SSL protection",
        },
        {
          stepNumber: 2,
          title: "Service Selection & Configuration",
          userGoal: "Select options and specify details",
          userAction: "Fills out interactive form",
          systemResponse: "Validates input in real-time and calculates total price",
          friction: "Ambiguous form fields",
          errorStates: ["Validation error on address"],
          alternativePaths: ["Save draft for later"],
          security: "Server-side input sanitization",
        },
      ],
      happy_path: ["Landing", "Configuration", "Confirmation", "Fulfillment"],
      edge_cases: [{ scenario: "User leaves page mid-way", resolution: "Restore form state from localStorage draft" }],
      failure_paths: [{ trigger: "Form validation error", userMessage: "Please check highlighted fields", fallbackAction: "Focus first invalid input" }],
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
 * Generate Product Specification document.
 */
export async function generateProductSpecDocument(
  projectName: string,
  productDescription: string
) {
  const apiKey = getGeminiApiKey();

  const prompt = `
System Instruction:
You are a Principal Product Manager AI Agent for Aigenstra.
Generate a structured Product Specification for ${projectName}.
Actively identify and eliminate unnecessary feature bloat. Focus on a tight, high-converting MVP scope.

Project: ${projectName}
Description: ${productDescription}

Return a valid JSON object matching this schema:
{
  "problem_statement": "Clear problem definition...",
  "target_users": ["User Segment 1", "User Segment 2"],
  "goals": ["Goal 1", "Goal 2"],
  "non_goals": ["Non-Goal 1 (Anti-bloat)"],
  "user_stories": [
    { "title": "Place Order", "asA": "customer", "iWantTo": "schedule laundry", "soThat": "I save time", "priority": "CRITICAL" }
  ],
  "functional_reqs": ["Functional requirement 1"],
  "non_functional_reqs": ["Performance under 2s", "Mobile responsive"],
  "business_rules": ["Order cancellation allowed up to 1h before pickup"],
  "acceptance_criteria": ["Criteria 1"],
  "edge_cases": ["Edge case 1"],
  "mvp_scope": ["MVP feature 1"],
  "future_scope": ["Post-launch feature 1"]
}
`;

  if (!apiKey) {
    return {
      problem_statement: `Users lack an efficient, transparent way to request and track ${projectName} services online.`,
      target_users: ["Busy urban professionals", "Small business partners"],
      goals: ["Enable 2-click service requests", "Provide real-time status updates"],
      non_goals: ["In-app social networking", "Complex multi-tier loyalty point exchange (anti-bloat)"],
      user_stories: [
        { title: "Service Booking", asA: "busy customer", iWantTo: "book service in 2 minutes", soThat: "I don't waste time on phone calls", priority: "CRITICAL" }
      ],
      functional_reqs: ["User authentication & guest token checkout", "Real-time order status tracking"],
      non_functional_reqs: ["Sub-second page loading speed", "100% Mobile responsiveness"],
      business_rules: ["Server-side ownership verification on all order lookups"],
      acceptance_criteria: ["Form submits successfully and returns tracking code", "User receives visual confirmation screen"],
      edge_cases: ["Duplicate request submission within 30 seconds"],
      mvp_scope: ["Landing page", "Order booking form", "Order status view", "Admin dashboard"],
      future_scope: ["Subscription recurring billing", "Native iOS/Android app push notifications"],
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
