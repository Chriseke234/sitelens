import {
  SoftwareBlueprint,
  EngineeringBlueprint,
  RepositorySnapshot,
  RepositoryFile,
  RepositorySymbol,
  RepositoryChunk,
  AuditSnapshot,
  AuditScope,
  Phase7Finding,
} from "@/types";
import { runDeterministicChecks } from "./deterministic";
import { runSemanticChecks } from "./semantic";
import { calculateRequirementCoverage } from "./coverage";

export interface AuditPipelineParams {
  projectId: string;
  scope?: AuditScope;
  blueprint?: SoftwareBlueprint | null;
  engineeringBlueprint?: EngineeringBlueprint | null;
  snapshot: RepositorySnapshot;
  files?: RepositoryFile[];
  symbols?: RepositorySymbol[];
  chunks?: RepositoryChunk[];
}

/**
 * End-to-end Audit Engine Orchestrator (Phase 7)
 * Runs deterministic static checks, followed by targeted semantic checks,
 * traces requirement coverage, deduplicates findings, and compiles an executive summary.
 */
export async function runProjectAuditPipeline(
  params: AuditPipelineParams
): Promise<AuditSnapshot> {
  const auditId = `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const scope: AuditScope = params.scope || "FULL";
  const now = new Date().toISOString();

  const files = params.files || [];
  const symbols = params.symbols || [];
  const chunks = params.chunks || [];

  // Stage 1: Deterministic Checks (Zero AI Tokens)
  const deterministicFindings = runDeterministicChecks({
    projectId: params.projectId,
    auditId,
    blueprint: params.blueprint,
    engineeringBlueprint: params.engineeringBlueprint,
    snapshot: params.snapshot,
    files,
    symbols,
    chunks,
  });

  // Stage 2: Targeted Semantic Checks (Bounded chunks only)
  let semanticFindings: Phase7Finding[] = [];
  try {
    semanticFindings = await runSemanticChecks({
      projectId: params.projectId,
      auditId,
      scope,
      blueprint: params.blueprint,
      engineeringBlueprint: params.engineeringBlueprint,
      snapshot: params.snapshot,
      chunks,
    });
  } catch (err) {
    console.warn("Semantic audit checks skipped or encountered error:", err);
  }

  // Stage 3: Deduplication & Root Cause Prioritization (Rule 39, 40, 79)
  const combinedFindings = [...deterministicFindings, ...semanticFindings];
  const uniqueFindings: Phase7Finding[] = [];
  const seenKeys = new Set<string>();

  for (const f of combinedFindings) {
    const key = `${f.category}:${f.affectedFile || ""}:${f.title}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueFindings.push(f);
    }
  }

  // Stage 4: Requirement Traceability & Coverage Mapping
  const { items: requirementCoverage, stats: coverageStats } = calculateRequirementCoverage({
    projectId: params.projectId,
    auditId,
    blueprint: params.blueprint,
    snapshot: params.snapshot,
  });

  // Stage 5: Executive Summary & Recommendation
  const criticalCount = uniqueFindings.filter((f) => f.severity === "CRITICAL").length;
  const highCount = uniqueFindings.filter((f) => f.severity === "HIGH").length;
  const mediumCount = uniqueFindings.filter((f) => f.severity === "MEDIUM").length;
  const lowCount = uniqueFindings.filter((f) => f.severity === "LOW").length;
  const infoCount = uniqueFindings.filter((f) => f.severity === "INFO").length;
  const verifiedCount = requirementCoverage.filter((r) => r.coverageStatus === "VERIFIED").length;

  let biggestIssue: string | undefined;
  let nextRecommendedAction: string | undefined;

  const highestPriority = uniqueFindings.find(
    (f) => f.severity === "CRITICAL" || f.severity === "HIGH"
  );

  if (highestPriority) {
    biggestIssue = `${highestPriority.title} (${highestPriority.category})`;
    nextRecommendedAction = `Review finding ${highestPriority.findingCode} and generate a targeted fix prompt for your coding agent.`;
  } else if (uniqueFindings.length > 0) {
    biggestIssue = `${uniqueFindings[0].title}`;
    nextRecommendedAction = `Address finding ${uniqueFindings[0].findingCode} to complete pending implementation polish.`;
  } else {
    biggestIssue = "No critical architectural or requirement issues identified within the audited scope.";
    nextRecommendedAction = "All core inspected requirements are supported by repository evidence.";
  }

  return {
    id: auditId,
    projectId: params.projectId,
    repositorySnapshotId: params.snapshot.id,
    blueprintRevision: params.blueprint?.id,
    engineeringRevision: params.engineeringBlueprint?.id,
    auditScope: scope,
    status: "COMPLETED",
    summary: {
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      infoCount,
      verifiedCount,
      totalFindings: uniqueFindings.length,
      biggestIssue,
      nextRecommendedAction,
    },
    coverage: coverageStats,
    findings: uniqueFindings,
    requirementCoverage,
    warnings: params.snapshot.warnings || [],
    createdAt: now,
    completedAt: now,
  };
}
