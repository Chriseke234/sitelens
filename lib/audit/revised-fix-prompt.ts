import {
  Phase7Finding,
  AuditVerification,
  CodingAgentProfile,
  RepositorySnapshot,
} from "@/types";
import { getAgentDirectives } from "@/lib/ai/prompt-compiler";

export interface RevisedFixPromptParams {
  finding: Phase7Finding;
  verification: AuditVerification;
  targetAgent: CodingAgentProfile;
  snapshot?: RepositorySnapshot;
  customNotes?: string;
}

/**
 * Compiles an architecture-preserving Revised Fix Prompt when a previous remediation
 * failed, was only partially resolved, or suffered a regression (Phase 8).
 */
export function compileRevisedFixPrompt({
  finding,
  verification,
  targetAgent,
  snapshot,
  customNotes,
}: RevisedFixPromptParams): string {
  // Map agent profile safely
  let agentKey: CodingAgentProfile = "Antigravity";
  const lower = String(targetAgent).toLowerCase();
  if (lower.includes("claude")) agentKey = "Claude Code";
  else if (lower.includes("cursor")) agentKey = "Cursor";
  else if (lower.includes("codex")) agentKey = "Codex";
  else if (lower.includes("replit")) agentKey = "Replit";
  else if (lower.includes("generic")) agentKey = "Generic";

  const directives = getAgentDirectives(agentKey);
  const targetFile = finding.affectedFile || finding.evidence?.filePath || "the affected files";
  const statusLabel = verification.status.replace(/_/g, " ");

  return `${directives.prefix}

# REVISED REMEDIATION INSTRUCTIONS — ${finding.findingCode} (${statusLabel})

## CODING AGENT DIRECTIVE
Target Agent Profile: ${agentKey}
Role: ${directives.roleDescription}
Key Execution Rules:
${directives.executionRules.map((r) => `- ${r}`).join("\n")}

---

## 1. WHY THIS REVISED PROMPT EXISTS
An initial remediation was attempted for finding **${finding.findingCode}: ${finding.title}**.
However, Aigenstra's verification re-audit against repository snapshot **${snapshot?.id?.slice(0, 8) || "latest"}** determined that the issue is **${statusLabel}**.

### Previous Condition
- **Original Issue**: ${finding.summary || finding.description}
- **Original Impact**: ${finding.impact}

### Current Verification Finding
- **Verification Method**: ${verification.verificationMethod} (Confidence: ${verification.confidence})
- **Expected Behavior**: ${verification.expectedBehavior}
- **Observed Behavior in Latest Code**: ${verification.observedBehavior}

${
  verification.currentEvidence?.snippet
    ? `### Current Code State:\n\`\`\`typescript\n${verification.currentEvidence.snippet}\n\`\`\`\n`
    : ""
}

---

## 2. THE REMAINING GAP
The original fix did not completely fulfill the acceptance criteria:
- **Target File**: \`${targetFile}\`
${
  verification.status === "REGRESSED"
    ? `> ⚠️ **CRITICAL REGRESSION**: This issue was previously resolved, but recent code changes re-introduced the vulnerability or broke expected contracts.`
    : verification.status === "PARTIALLY_RESOLVED"
    ? `> ⚠️ **PARTIAL RESOLUTION**: Part of the fix was applied, but the core ownership, policy, or error handling check remains unverified.`
    : `> ⚠️ **STILL PRESENT**: The required behavior is still not observable in the target implementation.`
}

${customNotes ? `### Developer Notes:\n${customNotes}\n` : ""}

---

## 3. STRICT CHANGE BOUNDARIES (DO NOT REBUILD)
1. **Preserve Existing Architecture**: Do NOT rewrite surrounding application components, authentication providers, or database schemas.
2. **Local Modification Only**: Modify ONLY \`${targetFile}\` to close the specific gap noted above.
3. **No Duplicate Layers**: Use the established database client and auth helpers already present in the codebase.
4. **Clean Verification Surface**: Ensure the fix is directly verifiable via static checks or automated tests.

---

## 4. ACCEPTANCE CRITERIA FOR RESOLUTION
To pass the next verification re-audit, your changes must satisfy:
${
  finding.verificationCriteria && finding.verificationCriteria.length > 0
    ? finding.verificationCriteria.map((c) => `- [ ] ${c}`).join("\n")
    : `- [ ] Ensure ${verification.expectedBehavior} is strictly satisfied without regressions.`
}
- [ ] Ensure all referenced variables, imports, and types are cleanly exported and typecheck without errors.
- [ ] No plaintext credentials or secrets introduced into source code.
`;
}
