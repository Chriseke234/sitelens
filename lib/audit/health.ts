import {
  AuditSnapshot,
  Phase7Finding,
  ProjectHealthSnapshot,
  ProjectHealthStatus,
  BlueprintAlignmentStatus,
  RepositorySnapshot,
} from "@/types";

export interface ComputeHealthParams {
  projectId: string;
  audit: AuditSnapshot;
  snapshot?: RepositorySnapshot;
  historicalRegressions?: Phase7Finding[];
  sharedDependencyWarnings?: string[];
}

/**
 * Computes Factual Project Health (Phase 8)
 * Strictly zero fake scores (no "97/100"). Every metric is evidence-backed.
 */
export function computeProjectHealth({
  projectId,
  audit,
  snapshot,
  historicalRegressions = [],
  sharedDependencyWarnings = [],
}: ComputeHealthParams): ProjectHealthSnapshot {
  const activeFindings = audit.findings.filter(
    (f) => f.status !== "NOT_APPLICABLE" && f.status !== "VERIFIED"
  );

  const criticalCount = activeFindings.filter((f) => f.severity === "CRITICAL").length;
  const highCount = activeFindings.filter((f) => f.severity === "HIGH").length;
  const mediumCount = activeFindings.filter((f) => f.severity === "MEDIUM").length;
  const regressionCount = historicalRegressions.length + activeFindings.filter((f) => f.verificationStatus === "REGRESSED").length;

  const verifiedCount = audit.coverage?.verifiedRequirements || 0;
  const totalReqs = audit.coverage?.totalRequirements || 0;
  const unverifiedCount = Math.max(0, totalReqs - verifiedCount);

  // Compute Blueprint Alignment
  let blueprintAlignment: BlueprintAlignmentStatus = "UNKNOWN";
  if (totalReqs > 0) {
    const ratio = verifiedCount / totalReqs;
    if (ratio >= 0.8) blueprintAlignment = "ALIGNED";
    else if (ratio >= 0.4) blueprintAlignment = "PARTIALLY_ALIGNED";
    else blueprintAlignment = "DIFFERENT";
  }

  // Compute Categorical Health Status
  let healthStatus: ProjectHealthStatus = "HEALTHY_WITHIN_SCOPE";

  // Check staleness (if snapshot > 7 days or not refreshed)
  const isStale = Boolean(
    audit.createdAt && Date.now() - new Date(audit.createdAt).getTime() > 7 * 24 * 60 * 60 * 1000
  );

  if (isStale) {
    healthStatus = "STALE";
  } else if (criticalCount > 0 || regressionCount > 0) {
    healthStatus = "HIGH_RISK";
  } else if (highCount > 0) {
    healthStatus = "NEEDS_ATTENTION";
  } else if (unverifiedCount > verifiedCount) {
    healthStatus = "INCOMPLETE";
  }

  // Determine Recommended Next Action
  let recommendedNextAction = "All inspected components appear healthy within the audited scope.";
  if (regressionCount > 0) {
    const firstReg = historicalRegressions[0] || activeFindings.find((f) => f.verificationStatus === "REGRESSED");
    recommendedNextAction = `Verify and resolve regression: ${firstReg?.title || "re-introduced issue"}`;
  } else if (criticalCount > 0) {
    const crit = activeFindings.find((f) => f.severity === "CRITICAL");
    recommendedNextAction = `Address critical priority finding: ${crit?.title || "critical vulnerability"}`;
  } else if (highCount > 0) {
    const high = activeFindings.find((f) => f.severity === "HIGH");
    recommendedNextAction = `Remediate high priority issue: ${high?.title || "unprotected workflow"}`;
  } else if (unverifiedCount > 0) {
    recommendedNextAction = `Implement test suites or routes for ${unverifiedCount} unverified blueprint requirements.`;
  }

  // Dimension health breakdown
  const dimensionHealth: Record<string, { status: string; findingCount: number }> = {};
  const dimensions = ["AUTHENTICATION", "AUTHORIZATION", "SECURITY", "DATABASE", "API", "UI", "TESTING"];
  for (const dim of dimensions) {
    const dimFindings = activeFindings.filter((f) => f.category === dim);
    dimensionHealth[dim] = {
      status: dimFindings.length === 0 ? "VERIFIED" : dimFindings.some((f) => f.severity === "CRITICAL") ? "CRITICAL" : "ATTENTION_NEEDED",
      findingCount: dimFindings.length,
    };
  }

  return {
    id: `health-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    projectId,
    auditId: audit.id,
    repositorySnapshotId: snapshot?.id || audit.repositorySnapshotId,
    healthStatus,
    healthScope: audit.auditScope || "FULL",
    criticalCount,
    highCount,
    mediumCount,
    regressionCount,
    verifiedCount,
    unverifiedCount,
    blueprintAlignment,
    metrics: {
      totalFindings: audit.findings.length,
      resolvedFindings: audit.findings.filter((f) => f.status === "VERIFIED" || f.verificationStatus === "RESOLVED").length,
      coveragePercentage: audit.coverage?.coveragePercentage || 0,
      lastAuditTimestamp: audit.completedAt || audit.createdAt,
      isStale,
      sharedDependencyWarnings,
      dimensionHealth,
    },
    recommendedNextAction,
    createdAt: new Date().toISOString(),
  };
}
