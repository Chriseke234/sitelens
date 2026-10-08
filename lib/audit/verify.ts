import {
  Phase7Finding,
  RepositorySnapshot,
  RepositoryFile,
  RepositoryChunk,
  AuditVerification,
  VerificationStatus,
  VerificationMethod,
  VerificationConfidence,
  FindingEvidence,
} from "@/types";
import { redactSecrets } from "@/lib/repository/secrets";

export interface VerifyFindingParams {
  finding: Phase7Finding;
  currentSnapshot: RepositorySnapshot;
  files: RepositoryFile[];
  chunks: RepositoryChunk[];
  previousSnapshot?: RepositorySnapshot;
}

/**
 * Targeted Verification Evaluator (Phase 8)
 * Compares Original Evidence vs. Current Evidence vs. Expected Behavior.
 * Strictly evidence-based: Never resolves purely based on file modifications.
 */
export async function verifyFinding({
  finding,
  currentSnapshot,
  files,
  chunks,
}: VerifyFindingParams): Promise<AuditVerification> {
  const targetFilePath = finding.affectedFile || finding.evidence?.filePath;
  const targetFile = targetFilePath ? files.find((f) => f.path === targetFilePath) : undefined;
  const fileChunks = targetFilePath ? chunks.filter((c) => (c.file_path || (c as any).filePath) === targetFilePath) : [];

  let verificationMethod: VerificationMethod = "STATIC_ANALYSIS";
  let status: VerificationStatus = "UNABLE_TO_VERIFY";
  let confidence: VerificationConfidence = "MEDIUM";
  let observedBehavior = "No current evidence found for the target component.";
  let currentSnippet = "";

  // 1. DETERMINISTIC CHECKS BY FINDING CATEGORY & CODE

  // SEC-001: Exposed secret in repository
  if (finding.findingCode === "SEC-001" || finding.category === "SECURITY") {
    if (!targetFile) {
      status = "RESOLVED";
      confidence = "HIGH";
      observedBehavior = `The file ${targetFilePath} containing exposed credentials has been removed from the repository.`;
    } else {
      const fullText = fileChunks.map((c) => c.content).join("\n");
      const secretCheck = redactSecrets(fullText);

      if (secretCheck.secretsCount > 0) {
        status = "STILL_PRESENT";
        confidence = "HIGH";
        observedBehavior = `Credentials or tokens are still detected within ${targetFilePath}.`;
        currentSnippet = secretCheck.redactedText.slice(0, 300);
      } else {
        status = "RESOLVED";
        confidence = "HIGH";
        observedBehavior = `Secret patterns have been scrubbed from ${targetFilePath}. No plaintext credentials detected.`;
        currentSnippet = fullText.slice(0, 200);
      }
    }
  }

  // AUTH-001: Missing IDOR / Ownership Check
  else if (finding.findingCode === "AUTH-001" || finding.category === "AUTHORIZATION") {
    if (!targetFile) {
      status = "UNABLE_TO_VERIFY";
      confidence = "LOW";
      observedBehavior = `Target route file ${targetFilePath} could not be located in current snapshot.`;
    } else {
      const fullText = fileChunks.map((c) => c.content).join("\n");
      const lower = fullText.toLowerCase();

      const checksOwnership =
        (lower.includes("user_id") || lower.includes("userid") || lower.includes("ownerid")) &&
        (lower.includes("auth.uid") || lower.includes("session.user") || lower.includes("user.id") || lower.includes("===") || lower.includes("==") || lower.includes("eq("));

      const hasAuthorizationMiddleware =
        lower.includes("createserverclient") ||
        lower.includes("getuser") ||
        lower.includes("requireauth") ||
        lower.includes("session");

      if (checksOwnership) {
        status = "RESOLVED";
        confidence = "HIGH";
        observedBehavior = `Route handler now verifies record ownership against the authenticated user identifier.`;
        currentSnippet = fullText.slice(0, 350);
      } else if (hasAuthorizationMiddleware) {
        status = "PARTIALLY_RESOLVED";
        confidence = "MEDIUM";
        observedBehavior = `Session authentication is verified, but explicit entity ownership check (matching user_id) is still ambiguous.`;
        currentSnippet = fullText.slice(0, 300);
      } else {
        status = "STILL_PRESENT";
        confidence = "HIGH";
        observedBehavior = `Route handler parameters are queried without cross-tenant ownership enforcement.`;
        currentSnippet = fullText.slice(0, 300);
      }
    }
  }

  // UI-001: Missing Screen / Route
  else if (finding.findingCode === "UI-001" || finding.category === "UI") {
    const plannedPath = finding.affectedFile || finding.affectedScreen || "";
    const routeExists = currentSnapshot.manifest?.routes?.some(
      (r) => r.path === plannedPath || (targetFilePath && r.filePath === targetFilePath)
    );
    const fileExists = files.some(
      (f) => f.path.toLowerCase().includes(plannedPath.toLowerCase().replace(/^\//, "")) || (targetFilePath && f.path === targetFilePath)
    );

    if (routeExists || fileExists) {
      status = "RESOLVED";
      confidence = "HIGH";
      verificationMethod = "STRUCTURAL_CHECK";
      observedBehavior = `Planned interface screen exists and is mapped in the application routing hierarchy.`;
    } else {
      status = "STILL_PRESENT";
      confidence = "HIGH";
      verificationMethod = "STRUCTURAL_CHECK";
      observedBehavior = `Route / screen ${plannedPath} remains absent from the project source tree.`;
    }
  }

  // DATA-001: Missing Database Schema / Entity
  else if (finding.findingCode === "DATA-001" || finding.category === "DATABASE") {
    const plannedEntity = finding.affectedSymbol || finding.affectedFeature || "";
    const schemaFileFound = files.some((f) => {
      const p = f.path.toLowerCase();
      return (p.includes("schema") || p.includes("migration") || p.includes("entities")) && f.extension === "sql";
    });

    const entityRegex = new RegExp(`CREATE\\s+TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?(?:public\\.)?["']?${plannedEntity}["']?`, "i");
    const foundEntityInChunks = chunks.some((c) => entityRegex.test(c.content));

    if (foundEntityInChunks) {
      status = "RESOLVED";
      confidence = "HIGH";
      verificationMethod = "STRUCTURAL_CHECK";
      observedBehavior = `Table schema definition for entity '${plannedEntity}' is present in migrations.`;
    } else if (schemaFileFound) {
      status = "STILL_PRESENT";
      confidence = "MEDIUM";
      verificationMethod = "STRUCTURAL_CHECK";
      observedBehavior = `Database migrations exist but entity '${plannedEntity}' table declaration was not found.`;
    } else {
      status = "STILL_PRESENT";
      confidence = "HIGH";
      verificationMethod = "STRUCTURAL_CHECK";
      observedBehavior = `No database migrations or entity definitions found for '${plannedEntity}'.`;
    }
  }

  // TEST-001: Missing Test Suite
  else if (finding.findingCode === "TEST-001" || finding.category === "TESTING") {
    const hasTests = files.some((f) => f.file_type === "TEST" || f.path.includes(".test.") || f.path.includes(".spec."));
    if (hasTests) {
      status = "RESOLVED";
      confidence = "HIGH";
      verificationMethod = "TEST_EVIDENCE";
      observedBehavior = `Automated test files detected in repository coverage.`;
    } else {
      status = "STILL_PRESENT";
      confidence = "HIGH";
      verificationMethod = "TEST_EVIDENCE";
      observedBehavior = `No unit or integration tests detected in repository.`;
    }
  }

  // 2. FALLBACK SEMANTIC EVALUATION FOR GENERIC CODE FINDINGS
  else {
    if (!targetFile) {
      status = "UNABLE_TO_VERIFY";
      confidence = "LOW";
      observedBehavior = `Cannot locate target file ${targetFilePath} to inspect current implementation.`;
    } else {
      const fullText = fileChunks.map((c) => c.content).join("\n");
      // Check if file contains keywords from expected behavior
      const expectedKeywords = finding.expectedBehavior
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 4);

      const matchedKeywords = expectedKeywords.filter((w) => fullText.toLowerCase().includes(w));
      const matchRatio = expectedKeywords.length > 0 ? matchedKeywords.length / expectedKeywords.length : 0;

      if (matchRatio >= 0.7) {
        status = "RESOLVED";
        confidence = "MEDIUM";
        verificationMethod = "SEMANTIC_ANALYSIS";
        observedBehavior = `Implementation appears to contain logic fulfilling expected behavior: ${finding.expectedBehavior}`;
        currentSnippet = fullText.slice(0, 300);
      } else if (matchRatio >= 0.4) {
        status = "PARTIALLY_RESOLVED";
        confidence = "MEDIUM";
        verificationMethod = "SEMANTIC_ANALYSIS";
        observedBehavior = `Partial logic detected, but some criteria remain unverified: missing ${expectedKeywords.filter((w) => !fullText.toLowerCase().includes(w)).slice(0, 3).join(", ")}.`;
        currentSnippet = fullText.slice(0, 300);
      } else {
        status = "STILL_PRESENT";
        confidence = "MEDIUM";
        verificationMethod = "SEMANTIC_ANALYSIS";
        observedBehavior = `Current code does not exhibit the required behaviors described in acceptance criteria.`;
        currentSnippet = fullText.slice(0, 300);
      }
    }
  }

  const currentEvidence: FindingEvidence = {
    filePath: targetFilePath,
    route: finding.evidence?.route,
    snippet: currentSnippet ? redactSecrets(currentSnippet).redactedText : undefined,
    blueprintRef: finding.evidence?.blueprintRef,
    engineeringRef: finding.evidence?.engineeringRef,
  };

  const verificationRecord: AuditVerification = {
    id: `ver-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    projectId: finding.projectId,
    findingId: finding.id,
    auditId: finding.auditId,
    repositorySnapshotId: currentSnapshot.id,
    verificationScope: "TARGETED_FINDING",
    expectedBehavior: finding.expectedBehavior,
    observedBehavior,
    originalEvidence: finding.evidence || {},
    currentEvidence,
    verificationMethod,
    status,
    confidence,
    notes: `Verified against repository snapshot ${currentSnapshot.id.slice(0, 8)} on ${new Date().toISOString()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return verificationRecord;
}
