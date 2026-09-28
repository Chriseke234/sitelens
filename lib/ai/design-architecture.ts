import { getGeminiApiKey } from "./client";

/**
 * Generate Design & UX Specification.
 */
export async function generateDesignSpec(projectName: string, productDescription: string) {
  const apiKey = getGeminiApiKey();

  const prompt = `
System Instruction:
You are a Lead UI/UX Engineer AI Agent for Aigenstra.
Generate a comprehensive UX/Design Specification for ${projectName}.
Detail sitemap, information architecture, page list, component breakdown, responsive rules, accessibility specs, and state rules (empty, loading, error, success).

Project: ${projectName}
Description: ${productDescription}

Return a valid JSON object matching this schema:
{
  "sitemap": [
    { "page": "Landing Page", "path": "/", "purpose": "Convert visitors to sign ups", "actions": ["Explore demo", "Sign up"] }
  ],
  "user_flows": ["Flow 1: Sign up to order completion"],
  "pages": ["Landing", "Dashboard", "Checkout"],
  "components": [
    { "name": "OrderCard", "purpose": "Display order status", "props": ["orderId", "status"], "states": ["default", "hover", "loading"] }
  ],
  "responsive_reqs": ["Mobile breakpoint 360px+", "Tablet 768px+", "Desktop 1024px+"],
  "accessibility_reqs": ["WCAG 2.1 AA compliance", "Keyboard navigation focus rings"],
  "states": [
    { "stateType": "empty", "pageOrComponent": "Orders List", "description": "Display friendly empty icon with 'Create your first order' CTA" }
  ]
}
`;

  if (!apiKey) {
    return {
      sitemap: [
        { page: "Landing Page", path: "/", purpose: "Convert visitors into users", actions: ["View demo", "Sign up"] },
        { page: "Project Workspace", path: "/projects/[id]", purpose: "Product engineering workspace", actions: ["Configure", "Generate prompts"] }
      ],
      user_flows: ["User landing → Registration → Workspace setup → Prompt generation"],
      pages: ["Landing", "Auth", "Workspace Overview", "Audit Dashboard"],
      components: [
        { name: "WorkspaceNav", purpose: "Tabbed workspace sub-navigation", props: ["projectId"], states: ["active", "inactive"] }
      ],
      responsive_reqs: ["Mobile-first fluid layouts", "Touch-friendly tap targets (>44px)"],
      accessibility_reqs: ["Screen reader labels", "High-contrast text color ratios"],
      states: [
        { stateType: "empty" as const, pageOrComponent: "Workspaces", description: "Show clean illustration with 'Create Workspace' action" }
      ],
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
    console.error("Design spec generation error:", err);
    throw err;
  }
}

/**
 * Generate Technical Architecture Specification.
 */
export async function generateArchitectureDoc(projectName: string, productDescription: string, techStack?: string) {
  const apiKey = getGeminiApiKey();

  const prompt = `
System Instruction:
You are a Principal Software Architect AI Agent for Aigenstra.
Generate a Technical Architecture for ${projectName}.
Detail Frontend architecture, Backend architecture, Database schema entities & constraints, Authentication flows, Storage, and Integrations.
Specified Tech Stack: ${techStack || "Next.js App Router, Supabase Postgres, Tailwind"}

Return a valid JSON object matching this schema:
{
  "frontend": {
    "framework": "Next.js 15 (App Router)",
    "routing": "Nested layout routes",
    "stateManagement": "React state & server components",
    "errorHandling": "Error boundaries & Toast notifications"
  },
  "backend": {
    "framework": "Next.js Route Handlers & Supabase SSR",
    "apiRoutes": "RESTful endpoints",
    "serverActions": "Server-side data mutations",
    "validation": "Zod schema validation"
  },
  "database_schema": {
    "entities": ["users", "projects", "orders"],
    "relationships": ["projects belong to users", "orders belong to projects"],
    "constraints": ["Foreign key cascades", "Unique indexes on email"]
  },
  "authentication": {
    "authType": "Supabase SSR Auth (Session Cookies)",
    "sessionManagement": "Server middleware session refresh",
    "roles": ["authenticated user", "admin"]
  },
  "storage": {
    "fileStorage": "Supabase Storage Buckets",
    "accessControl": "Authenticated user RLS storage policies"
  },
  "integrations": [
    { "name": "Google Gemini API", "type": "AI Content Generation", "securityNote": "API Key secured in server env variables" }
  ]
}
`;

  if (!apiKey) {
    return {
      frontend: {
        framework: "Next.js 15 (App Router)",
        routing: "App router nested route groups",
        stateManagement: "Server Components & Local React Hooks",
        errorHandling: "App level error.tsx & Zod validation toasts",
      },
      backend: {
        framework: "Next.js Route Handlers + Supabase SSR",
        apiRoutes: "JSON REST handlers at /api/*",
        serverActions: "Typed server actions",
        validation: "Zod runtime schema enforcement",
      },
      database_schema: {
        entities: ["profiles", "projects", "prompts", "audit_findings"],
        relationships: ["projects belong to profiles", "findings belong to projects"],
        constraints: ["Foreign key cascade on delete", "Indexed project_id"],
      },
      authentication: {
        authType: "Supabase Auth with cookie middleware",
        sessionManagement: "HttpOnly server cookies",
        roles: ["authenticated user"],
      },
      storage: {
        fileStorage: "Supabase Public Storage Bucket",
        accessControl: "Authenticated user insert policies",
      },
      integrations: [
        { name: "Google Gemini 2.5 Flash", type: "AI Engine", securityNote: "GEMINI_API_KEY kept strictly server-side" }
      ],
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
    console.error("Architecture doc generation error:", err);
    throw err;
  }
}

/**
 * Generate Security Architecture Specification.
 */
export async function generateSecurityPlan(projectName: string, productDescription: string) {
  const apiKey = getGeminiApiKey();

  const prompt = `
System Instruction:
You are a Senior Security Architect AI Agent for Aigenstra.
Generate a Security Architecture Plan for ${projectName} BEFORE code generation.
Define explicit security rules detailing WHAT, WHY, WHERE, and HOW TO VERIFY for:
- Authentication
- Authorization & Ownership
- Database Security (RLS)
- API Security (SSRF, Rate Limiting, Input Validation)
- Secret Management
- Threat Modeling

Return a valid JSON object matching this schema:
{
  "authentication_rules": [
    { "requirement": "HttpOnly Cookie Session", "why": "Prevent XSS session hijacking", "where": "middleware.ts & auth endpoints", "verify": "Inspect set-cookie header flags" }
  ],
  "authorization_rules": [
    { "requirement": "Server-side ownership verification", "why": "Prevent IDOR vulnerabilities", "where": "API Route Handlers", "verify": "Test requesting resource owned by another user ID" }
  ],
  "database_security": [
    { "requirement": "Row Level Security (RLS)", "why": "Enforce database tenant isolation", "where": "Supabase Postgres tables", "verify": "Execute query with unauthorized JWT" }
  ],
  "api_security": [
    { "requirement": "Zod Input Validation", "why": "Prevent SQLi, XSS, and malformed payload crashes", "where": "POST/PUT Request Body parser", "verify": "Submit unexpected JSON structures" }
  ],
  "input_validation": [
    { "requirement": "Untrusted Context Tagging", "why": "Prevent AI Prompt Injection", "where": "AI Prompt Assembler", "verify": "Submit prompt injection strings in user inputs" }
  ],
  "secret_management": [
    { "requirement": "Server-only environment variables", "why": "Prevent API key leaks to frontend bundle", "where": ".env.local & server functions", "verify": "Inspect client JS bundle for API key strings" }
  ],
  "threat_model": [
    { "threat": "Unauthorized access to order data", "impact": "Data leak", "mitigation": "Enforce user_id equality checks in database queries" }
  ]
}
`;

  if (!apiKey) {
    return {
      authentication_rules: [
        { requirement: "HttpOnly Auth Session Cookies", why: "Prevent client-side script session theft", where: "middleware.ts", verify: "Verify HTTP headers in devtools" }
      ],
      authorization_rules: [
        { requirement: "Server-side ownership check", why: "Prevent IDOR / unauthorized record access", where: "API Route Handlers", verify: "Attempt to query another user's project ID" }
      ],
      database_security: [
        { requirement: "Supabase Row Level Security (RLS)", why: "Ensure multi-tenant data isolation", where: "Postgres schema", verify: "Run query without auth session token" }
      ],
      api_security: [
        { requirement: "Strict Zod Schema Sanitization", why: "Block invalid inputs and injection payloads", where: "Request Handlers", verify: "Send malformed JSON payloads" }
      ],
      input_validation: [
        { requirement: "Untrusted Project Content Tagging", why: "Defend against prompt injection", where: "AI Client", verify: "Pass 'Ignore previous instructions' in text inputs" }
      ],
      secret_management: [
        { requirement: "GEMINI_API_KEY server-side only", why: "Prevent secret exposure in client bundle", where: "lib/ai/client.ts", verify: "Search bundle for GEMINI_API_KEY" }
      ],
      threat_model: [
        { threat: "Insecure Direct Object Reference (IDOR)", impact: "HIGH", mitigation: "Always filter queries by auth.uid() equal to user_id" }
      ],
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
    console.error("Security plan generation error:", err);
    throw err;
  }
}
