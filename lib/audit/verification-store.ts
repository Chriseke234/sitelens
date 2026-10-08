import { createClient } from "@/lib/supabase/server";
import { AuditVerification, ProjectHealthSnapshot, VerificationStatus } from "@/types";

/**
 * Server-side Verification & Project Health Database Store with JSONB Fallback Support (Phase 8)
 */

export async function saveVerification(verification: AuditVerification): Promise<void> {
  const supabase = await createClient();

  try {
    const { error } = await supabase.from("audit_verifications").insert({
      id: verification.id,
      project_id: verification.projectId,
      finding_id: verification.findingId,
      audit_id: verification.auditId || null,
      repository_snapshot_id: verification.repositorySnapshotId || null,
      verification_scope: verification.verificationScope,
      expected_behavior: verification.expectedBehavior,
      observed_behavior: verification.observedBehavior,
      original_evidence: verification.originalEvidence,
      current_evidence: verification.currentEvidence,
      verification_method: verification.verificationMethod,
      status: verification.status,
      confidence: verification.confidence,
      notes: verification.notes || null,
      created_at: verification.createdAt,
      updated_at: verification.updatedAt,
    });

    if (error) {
      console.warn("Direct insert into audit_verifications failed, using fallback:", error);
      await saveVerificationToFallback(verification);
    }
  } catch (err) {
    console.warn("Error in saveVerification, saving to architecture fallback:", err);
    await saveVerificationToFallback(verification);
  }
}

export async function loadVerificationsForFinding(findingId: string): Promise<AuditVerification[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("audit_verifications")
      .select("*")
      .eq("finding_id", findingId)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((row) => ({
        id: row.id,
        projectId: row.project_id,
        findingId: row.finding_id,
        auditId: row.audit_id || undefined,
        repositorySnapshotId: row.repository_snapshot_id || undefined,
        verificationScope: row.verification_scope,
        expectedBehavior: row.expected_behavior,
        observedBehavior: row.observed_behavior,
        originalEvidence: row.original_evidence || {},
        currentEvidence: row.current_evidence || {},
        verificationMethod: row.verification_method,
        status: row.status,
        confidence: row.confidence,
        notes: row.notes || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    }
  } catch (err) {
    console.warn("Error loading verifications from DB table:", err);
  }

  // Fallback
  return loadVerificationsFromFallback(findingId);
}

export async function updateFindingVerificationStatus(
  findingId: string,
  status: VerificationStatus,
  verificationId: string,
  isRegression: boolean = false
): Promise<void> {
  const supabase = await createClient();

  try {
    const updatePayload: Record<string, any> = {
      verification_id: verificationId,
      updated_at: new Date().toISOString(),
    };

    if (status === "RESOLVED") {
      updatePayload.fix_status = "AWAITING_VERIFICATION"; // or completed
      updatePayload.status = "VERIFIED";
      updatePayload.resolved_at = new Date().toISOString();
    } else if (status === "REGRESSED") {
      updatePayload.status = "CRITICAL"; // escalate priority per user decision
      updatePayload.severity = "CRITICAL";
      updatePayload.fix_status = "OPEN";
      if (isRegression) {
        // Will increment regression_count in DB if supported, else set via fallback
      }
    } else if (status === "PARTIALLY_RESOLVED") {
      updatePayload.status = "NEEDS_REVIEW";
      updatePayload.fix_status = "OPEN";
    } else if (status === "STILL_PRESENT") {
      updatePayload.status = "ISSUE";
      updatePayload.fix_status = "OPEN";
    }

    const { error } = await supabase
      .from("audit_findings")
      .update(updatePayload)
      .eq("id", findingId);

    if (error) {
      console.warn("Direct update on audit_findings failed:", error);
    }
  } catch (err) {
    console.warn("Error updating finding verification status:", err);
  }
}

export async function saveHealthSnapshot(health: ProjectHealthSnapshot): Promise<void> {
  const supabase = await createClient();

  try {
    const { error } = await supabase.from("audit_health_snapshots").insert({
      id: health.id,
      project_id: health.projectId,
      audit_id: health.auditId || null,
      repository_snapshot_id: health.repositorySnapshotId || null,
      health_status: health.healthStatus,
      health_scope: health.healthScope,
      critical_count: health.criticalCount,
      high_count: health.highCount,
      medium_count: health.mediumCount,
      regression_count: health.regressionCount,
      verified_count: health.verifiedCount,
      unverified_count: health.unverifiedCount,
      blueprint_alignment: health.blueprintAlignment,
      metrics: health.metrics,
      recommended_next_action: health.recommendedNextAction || null,
      created_at: health.createdAt,
    });

    if (error) {
      console.warn("Direct insert into audit_health_snapshots failed, using fallback:", error);
      await saveHealthToFallback(health);
    }
  } catch (err) {
    console.warn("Error in saveHealthSnapshot, saving to fallback:", err);
    await saveHealthToFallback(health);
  }
}

export async function loadLatestHealthSnapshot(projectId: string): Promise<ProjectHealthSnapshot | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("audit_health_snapshots")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!error && data) {
      return {
        id: data.id,
        projectId: data.project_id,
        auditId: data.audit_id || undefined,
        repositorySnapshotId: data.repository_snapshot_id || undefined,
        healthStatus: data.health_status,
        healthScope: data.health_scope,
        criticalCount: data.critical_count,
        highCount: data.high_count,
        mediumCount: data.medium_count,
        regressionCount: data.regression_count,
        verifiedCount: data.verified_count,
        unverifiedCount: data.unverified_count,
        blueprintAlignment: data.blueprint_alignment,
        metrics: data.metrics || {
          totalFindings: 0,
          resolvedFindings: 0,
          coveragePercentage: 0,
          isStale: false,
        },
        recommendedNextAction: data.recommended_next_action || undefined,
        createdAt: data.created_at,
      };
    }
  } catch (err) {
    console.warn("Error loading health snapshot from DB table:", err);
  }

  // Fallback
  return loadHealthFromFallback(projectId);
}

// ==========================================
// JSONB FALLBACK HELPERS
// ==========================================

async function saveVerificationToFallback(verification: AuditVerification): Promise<void> {
  const supabase = await createClient();
  try {
    const { data } = await supabase
      .from("architecture_docs")
      .select("storage")
      .eq("project_id", verification.projectId)
      .single();

    const storage = (data?.storage as Record<string, any>) || {};
    const verifications: AuditVerification[] = storage.verifications || [];

    const updated = [verification, ...verifications.filter((v) => v.id !== verification.id)];
    storage.verifications = updated;

    await supabase
      .from("architecture_docs")
      .update({ storage })
      .eq("project_id", verification.projectId);
  } catch (err) {
    console.error("Failed to save verification to fallback JSONB:", err);
  }
}

async function loadVerificationsFromFallback(findingId: string): Promise<AuditVerification[]> {
  const supabase = await createClient();
  try {
    const { data } = await supabase
      .from("architecture_docs")
      .select("storage")
      .limit(10);

    for (const row of data || []) {
      const storage = row.storage as Record<string, any>;
      if (storage?.verifications && Array.isArray(storage.verifications)) {
        const matches = storage.verifications.filter((v: AuditVerification) => v.findingId === findingId);
        if (matches.length > 0) return matches;
      }
    }
  } catch (err) {
    console.error("Failed to load verifications from fallback JSONB:", err);
  }
  return [];
}

async function saveHealthToFallback(health: ProjectHealthSnapshot): Promise<void> {
  const supabase = await createClient();
  try {
    const { data } = await supabase
      .from("architecture_docs")
      .select("storage")
      .eq("project_id", health.projectId)
      .single();

    const storage = (data?.storage as Record<string, any>) || {};
    storage.latest_health = health;

    await supabase
      .from("architecture_docs")
      .update({ storage })
      .eq("project_id", health.projectId);
  } catch (err) {
    console.error("Failed to save health snapshot to fallback JSONB:", err);
  }
}

async function loadHealthFromFallback(projectId: string): Promise<ProjectHealthSnapshot | null> {
  const supabase = await createClient();
  try {
    const { data } = await supabase
      .from("architecture_docs")
      .select("storage")
      .eq("project_id", projectId)
      .single();

    const storage = data?.storage as Record<string, any>;
    return storage?.latest_health || null;
  } catch (err) {
    console.error("Failed to load health snapshot from fallback JSONB:", err);
    return null;
  }
}
