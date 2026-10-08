import {
  Phase7Finding,
  SoftwareBlueprint,
  EngineeringBlueprint,
  RepositorySnapshot,
  AuditFixTask,
  CodingAgentProfile,
} from "@/types";
import { getAgentDirectives } from "@/lib/ai/prompt-compiler";

export interface GenerateFixPromptParams {
  projectId: string;
  finding: Phase7Finding;
  targetAgent?: CodingAgentProfile;
  blueprint?: SoftwareBlueprint | null;
  engineeringBlueprint?: EngineeringBlueprint | null;
  snapshot?: RepositorySnapshot | null;
}

/**
 * Generate a targeted, architecture-preserving Fix Prompt for an audit finding (Phase 7)
 * Directly integrates with Phase 5 Prompt Compiler conventions:
 * 1. Targeted problem details + observed evidence
 * 2. Architecture preservation directives (never introduce second auth/db system)
 * 3. Specific acceptance criteria and test verification steps
 * 4. Tailored for user's target coding agent (Google Antigravity, Claude Code, Cursor, Windsurf)
 */
export function buildFixPromptForFinding(params: GenerateFixPromptParams): {
  promptText: string;
  fixTask: AuditFixTask;
} {
  const { finding, targetAgent = "google_antigravity" } = params;
  const now = new Date().toISOString();

  const framework = params.snapshot?.manifest?.architecture?.framework || "Next.js App Router";
  const database = params.snapshot?.manifest?.architecture?.database || "Supabase PostgreSQL";
  const auth = params.snapshot?.manifest?.architecture?.authentication || "Supabase Auth";

  const targetFile = finding.affectedFile || finding.evidence.filePath || "Specified application file";

  // Build 12-section production prompt
  const rawPrompt = `ROLE
You are a senior defensive software engineer and code quality specialist resolving an identified project audit finding.

OBJECTIVE
Resolve finding [${finding.findingCode}]: ${finding.title}.

EXISTING PROJECT ARCHITECTURE (DO NOT CHANGE)
- Framework: ${framework}
- Database: ${database}
- Authentication: ${auth}
CRITICAL ARCHITECTURE RULE: Extend existing code and patterns. Do NOT install replacement libraries or rewrite working unrelated modules.

PROBLEM DETAILS & OBSERVED EVIDENCE
- Category: ${finding.category}
- Severity: ${finding.severity}
- Affected File / Target: ${targetFile}
- Observed Behavior: ${finding.observedBehavior}
- Evidence: ${finding.evidence.snippet ? `\n\`\`\`\n${finding.evidence.snippet}\n\`\`\`` : finding.observedBehavior}
- Technical Context: ${finding.description}

EXPECTED BEHAVIOR
${finding.expectedBehavior}

RECOMMENDED FIX
${finding.recommendation}

CONSTRAINTS & DEFENSIVE CODING RULES
1. Enforce strict server-side validation; never rely exclusively on client-supplied IDs or payloads.
2. If authorization or ownership is required, verify that the authenticated user owns or has access to the target record before returning or mutating data.
3. Preserve all existing API response contracts and URL routes.
4. Maintain TypeScript strictness with 0 compilation errors.

ACCEPTANCE CRITERIA
${finding.verificationCriteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}
${finding.verificationCriteria.length === 0 ? "1. Issue is resolved according to recommended fix\n2. No regressions introduced" : ""}

TESTING & VERIFICATION
1. Verify happy path with authorized user.
2. Verify unauthorized or edge-case access is handled with appropriate HTTP status codes (e.g. 401/403/404).
3. Run project build or test suite ('npm run typecheck') to verify zero regressions.

EXPECTED OUTPUT
Explain the modified lines of code, demonstrate how the issue was resolved, and provide commands to run verification tests.`;

  // Map agent name safely to CodingAgentProfile
  let agentKey: CodingAgentProfile = "Antigravity";
  const lower = String(targetAgent).toLowerCase();
  if (lower.includes("claude")) agentKey = "Claude Code";
  else if (lower.includes("cursor")) agentKey = "Cursor";
  else if (lower.includes("codex")) agentKey = "Codex";
  else if (lower.includes("replit")) agentKey = "Replit";
  else if (lower.includes("generic")) agentKey = "Generic";

  const directives = getAgentDirectives(agentKey);
  const formattedPrompt = `${directives.prefix}\n\n${rawPrompt}`;

  const fixTaskId = `fix-task-${finding.id}-${Date.now()}`;
  const fixTask: AuditFixTask = {
    id: fixTaskId,
    projectId: params.projectId,
    auditId: finding.auditId,
    findingId: finding.id,
    title: `Fix ${finding.findingCode}: ${finding.title}`,
    fixStatus: "FIX_PROMPT_READY",
    targetAgent,
    promptText: formattedPrompt,
    createdAt: now,
    updatedAt: now,
  };

  return {
    promptText: formattedPrompt,
    fixTask,
  };
}
