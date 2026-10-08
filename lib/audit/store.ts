import { createClient } from "@/lib/supabase/server";
import { AuditSnapshot, Phase7Finding, AuditFixTask } from "@/types";

/**
 * Server-side Audit Engine Database Store with JSONB Fallback Support (Phase 7)
 */
export async function persistAuditSnapshot(audit: AuditSnapshot): Promise<void> {
  const supabase = await createClient();

  try {
    // 1. Try writing to public.project_audits
    const { error: auditErr } = await supabase.from("project_audits").insert({
      id: audit.id,
      project_id: audit.projectId,
      repository_snapshot_id: audit.repositorySnapshotId || null,
      blueprint_revision: audit.blueprintRevision || null,
      engineering_revision: audit.engineeringRevision || null,
      audit_scope: audit.auditScope,
      status: audit.status,
      summary: audit.summary,
      coverage: audit.coverage,
      warnings: audit.warnings,
      completed_at: audit.completedAt,
    });

    if (auditErr) {
      console.warn("Direct insert into project_audits failed, using architecture_docs fallback:", auditErr);
      await saveAuditToArchitectureFallback(audit);
      return;
    }

    // 2. Insert findings
    if (audit.findings && audit.findings.length > 0) {
      const dbFindings = audit.findings.map((f) => ({
        id: f.id,
        project_id: audit.projectId,
        audit_id: audit.id,
        finding_code: f.findingCode,
        category: f.category,
        severity: f.severity,
        status: f.status,
        title: f.title,
        summary: f.summary,
        description: f.description,
        impact: f.impact,
        evidence: f.evidence,
        expected_behavior: f.expectedBehavior,
        observed_behavior: f.observedBehavior,
        recommendation: f.recommendation,
        verification_criteria: f.verificationCriteria,
        confidence: f.confidence,
        affected_feature: f.affectedFeature,
        affected_screen: f.affectedScreen,
        affected_workflow: f.affectedWorkflow,
        affected_file: f.affectedFile,
        affected_symbol: f.affectedSymbol,
        source_requirement: f.sourceRequirement,
        fix_status: f.fixStatus,
        user_override: f.userOverride,
      }));

      await supabase.from("audit_findings").insert(dbFindings);
    }

    // 3. Insert requirement coverage
    if (audit.requirementCoverage && audit.requirementCoverage.length > 0) {
      const dbCoverage = audit.requirementCoverage.map((r) => ({
        id: r.id,
        project_id: audit.projectId,
        audit_id: audit.id,
        requirement_id: r.requirementId,
        requirement_type: r.requirementType,
        title: r.title,
        coverage_status: r.coverageStatus,
        evidence_paths: r.evidencePaths,
        observations: r.observations,
      }));

      await supabase.from("audit_requirement_coverage").insert(dbCoverage);
    }
  } catch (err) {
    console.warn("Error in persistAuditSnapshot, saving to architecture fallback:", err);
    await saveAuditToArchitectureFallback(audit);
  }
}

/**
 * Load latest active audit for a project
 */
export async function loadLatestAuditSnapshot(projectId: string): Promise<AuditSnapshot | null> {
  const supabase = await createClient();

  try {
    const { data: auditRow, error } = await supabase
      .from("project_audits")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !auditRow) {
      return await loadAuditFromArchitectureFallback(projectId);
    }

    const [findingsRes, coverageRes] = await Promise.all([
      supabase
        .from("audit_findings")
        .select("*")
        .eq("audit_id", auditRow.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("audit_requirement_coverage")
        .select("*")
        .eq("audit_id", auditRow.id),
    ]);

    const findings: Phase7Finding[] = (findingsRes.data || []).map((f: any) => ({
      id: f.id,
      projectId: f.project_id,
      auditId: f.audit_id,
      findingCode: f.finding_code,
      category: f.category,
      severity: f.severity,
      status: f.status,
      title: f.title,
      summary: f.summary || f.simple_explanation || "",
      description: f.description || f.technical_explanation || "",
      impact: f.impact || f.potential_impact || "",
      evidence: typeof f.evidence === "object" ? f.evidence : { observedDiff: f.evidence },
      expectedBehavior: f.expected_behavior || "",
      observedBehavior: f.observed_behavior || "",
      recommendation: f.recommendation || f.recommended_fix || "",
      verificationCriteria: Array.isArray(f.verification_criteria) ? f.verification_criteria : [],
      confidence: f.confidence || "HIGH",
      affectedFeature: f.affected_feature,
      affectedScreen: f.affected_screen,
      affectedWorkflow: f.affected_workflow,
      affectedFile: f.affected_file || f.affected_file_or_route,
      affectedSymbol: f.affected_symbol,
      sourceRequirement: f.source_requirement,
      fixStatus: f.fix_status || "OPEN",
      userOverride: f.user_override,
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    }));

    return {
      id: auditRow.id,
      projectId: auditRow.project_id,
      repositorySnapshotId: auditRow.repository_snapshot_id,
      blueprintRevision: auditRow.blueprint_revision,
      engineeringRevision: auditRow.engineering_revision,
      auditScope: auditRow.audit_scope || "FULL",
      status: auditRow.status || "COMPLETED",
      summary: auditRow.summary || {},
      coverage: auditRow.coverage || {},
      findings,
      requirementCoverage: coverageRes.data || [],
      warnings: auditRow.warnings || [],
      createdAt: auditRow.created_at,
      completedAt: auditRow.completed_at,
    };
  } catch (err) {
    console.error("loadLatestAuditSnapshot error:", err);
    return await loadAuditFromArchitectureFallback(projectId);
  }
}

/**
 * Update user override on a finding (dismiss, mark N/A, add rationale)
 */
export async function updateFindingUserOverride(
  projectId: string,
  findingId: string,
  override: {
    action: "DISMISSED" | "MARKED_NA" | "MANUAL_REVIEW";
    rationale: string;
    timestamp: string;
  }
): Promise<void> {
  const supabase = await createClient();

  try {
    await supabase
      .from("audit_findings")
      .update({
        user_override: override,
        status: override.action === "DISMISSED" ? "NOT_APPLICABLE" : "NEEDS_REVIEW",
        updated_at: override.timestamp,
      })
      .eq("id", findingId)
      .eq("project_id", projectId);
  } catch (err) {
    console.warn("Could not update finding override directly in DB:", err);
  }
}

// --------------------------------------------------------------------------
// FALLBACK STORAGE HELPERS
// --------------------------------------------------------------------------
async function saveAuditToArchitectureFallback(audit: AuditSnapshot): Promise<void> {
  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("architecture_docs")
    .select("storage")
    .eq("project_id", audit.projectId)
    .single();

  const currentStorage = doc?.storage || {};
  const currentAudits = currentStorage.audit_snapshots || [];

  const updatedStorage = {
    ...currentStorage,
    audit_snapshots: [audit, ...currentAudits.slice(0, 4)],
    latest_audit: audit,
  };

  await supabase
    .from("architecture_docs")
    .update({ storage: updatedStorage })
    .eq("project_id", audit.projectId);
}

async function loadAuditFromArchitectureFallback(projectId: string): Promise<AuditSnapshot | null> {
  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("architecture_docs")
    .select("storage")
    .eq("project_id", projectId)
    .single();

  return doc?.storage?.latest_audit || doc?.storage?.audit_snapshots?.[0] || null;
}
