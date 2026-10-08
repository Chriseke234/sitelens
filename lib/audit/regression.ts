import {
  Phase7Finding,
  RepositorySnapshot,
  RepositoryFile,
  RepositoryChunk,
  AuditVerification,
} from "@/types";
import { compareSnapshots, SnapshotChangeDiff } from "@/lib/repository/change-detection";
import { verifyFinding } from "@/lib/audit/verify";

export interface RegressionAnalysisResult {
  regressedFindings: Phase7Finding[];
  stillResolvedFindings: Phase7Finding[];
  sharedDependencyWarnings: string[];
  diff: SnapshotChangeDiff;
  summary: {
    previouslyResolvedCount: number;
    confirmedStillResolvedCount: number;
    regressedCount: number;
  };
}

/**
 * Regression Detection & Blast Radius Analysis Engine (Phase 8)
 * Checks whether newly modified files reintroduced previously resolved vulnerabilities or broken contracts.
 */
export async function detectRegressions(
  previouslyResolvedFindings: Phase7Finding[],
  previousFiles: RepositoryFile[],
  currentSnapshot: RepositorySnapshot,
  currentFiles: RepositoryFile[],
  currentChunks: RepositoryChunk[]
): Promise<RegressionAnalysisResult> {
  const diff = compareSnapshots(previousFiles, currentFiles);
  const changedPathsSet = new Set([...diff.addedFiles, ...diff.modifiedFiles, ...diff.deletedFiles]);

  const regressedFindings: Phase7Finding[] = [];
  const stillResolvedFindings: Phase7Finding[] = [];
  const sharedDependencyWarnings: string[] = [];

  // 1. Shared Dependency / Blast Radius Warning
  const coreSharedFiles = changedPathsSet;
  for (const path of coreSharedFiles) {
    const lower = path.toLowerCase();
    if (lower.includes("middleware.ts") || lower.includes("middleware.js")) {
      sharedDependencyWarnings.push(`'${path}' was modified. Changes to root middleware affect all protected routes in the application.`);
    } else if (lower.includes("lib/auth") || lower.includes("auth.ts") || lower.includes("session.ts")) {
      sharedDependencyWarnings.push(`Core authentication provider '${path}' changed. Re-audit of authorization and protected APIs recommended.`);
    } else if (lower.includes("lib/supabase") || lower.includes("lib/db") || lower.includes("schema.sql")) {
      sharedDependencyWarnings.push(`Database access layer '${path}' modified. Potential regression blast radius across all entity access points.`);
    }
  }

  // 2. Inspect previously resolved findings
  for (const resolvedFinding of previouslyResolvedFindings) {
    const affectedPath = resolvedFinding.affectedFile || resolvedFinding.evidence?.filePath;

    // If the affected file wasn't changed and no core middleware changed, assume it remains resolved
    if (!affectedPath || (!changedPathsSet.has(affectedPath) && !changedPathsSet.has("middleware.ts"))) {
      stillResolvedFindings.push(resolvedFinding);
      continue;
    }

    // The affected file was modified! Re-verify to check for regression
    const verification: AuditVerification = await verifyFinding({
      finding: resolvedFinding,
      currentSnapshot,
      files: currentFiles,
      chunks: currentChunks,
    });

    if (verification.status === "STILL_PRESENT" || verification.status === "REGRESSED") {
      // REGRESSION DETECTED!
      const regressedFinding: Phase7Finding = {
        ...resolvedFinding,
        id: `finding-regressed-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        status: "CRITICAL", // Escalate to CRITICAL per user decision
        severity: "CRITICAL",
        title: `[REGRESSION] ${resolvedFinding.title.replace(/^\[REGRESSION\]\s*/, "")}`,
        summary: `Previously resolved issue ${resolvedFinding.findingCode} returned in snapshot ${currentSnapshot.id.slice(0, 8)}.`,
        impact: `Regression: ${resolvedFinding.impact}. Changes in ${affectedPath} re-introduced the original vulnerability.`,
        observedBehavior: verification.observedBehavior,
        evidence: verification.currentEvidence,
        previousFindingId: resolvedFinding.id,
        regressionCount: (resolvedFinding.regressionCount || 0) + 1,
        verificationStatus: "REGRESSED",
        fixStatus: "OPEN",
        updatedAt: new Date().toISOString(),
      };

      regressedFindings.push(regressedFinding);
    } else {
      stillResolvedFindings.push(resolvedFinding);
    }
  }

  return {
    regressedFindings,
    stillResolvedFindings,
    sharedDependencyWarnings,
    diff,
    summary: {
      previouslyResolvedCount: previouslyResolvedFindings.length,
      confirmedStillResolvedCount: stillResolvedFindings.length,
      regressedCount: regressedFindings.length,
    },
  };
}
