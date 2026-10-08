import { createClient } from "@/lib/supabase/server";
import { ProjectHealthSnapshot, AuditVerification, Phase7Finding } from "@/types";

export interface ProjectAuditMemoryRecord {
  lastUpdated: string;
  auditId?: string;
  healthStatus: string;
  openCriticalCount: number;
  openHighCount: number;
  regressionCount: number;
  resolvedFindings: Array<{ code: string; title: string; resolvedAt: string }>;
  activeRegressions: Array<{ code: string; title: string; regressionCount: number }>;
  recentVerifications: Array<{ findingCode: string; status: string; timestamp: string }>;
}

/**
 * Synchronizes structured project health & verification state into project memory (Phase 8)
 */
export async function syncAuditToProjectMemory(
  projectId: string,
  health: ProjectHealthSnapshot,
  findings: Phase7Finding[],
  recentVerifications: AuditVerification[] = []
): Promise<void> {
  const supabase = await createClient();

  const memoryRecord: ProjectAuditMemoryRecord = {
    lastUpdated: new Date().toISOString(),
    auditId: health.auditId,
    healthStatus: health.healthStatus,
    openCriticalCount: health.criticalCount,
    openHighCount: health.highCount,
    regressionCount: health.regressionCount,
    resolvedFindings: findings
      .filter((f) => f.status === "VERIFIED" || f.verificationStatus === "RESOLVED")
      .slice(0, 10)
      .map((f) => ({
        code: f.findingCode,
        title: f.title,
        resolvedAt: f.resolvedAt || f.updatedAt,
      })),
    activeRegressions: findings
      .filter((f) => f.verificationStatus === "REGRESSED")
      .map((f) => ({
        code: f.findingCode,
        title: f.title,
        regressionCount: f.regressionCount || 1,
      })),
    recentVerifications: recentVerifications.slice(0, 5).map((v) => ({
      findingCode: v.findingId,
      status: v.status,
      timestamp: v.createdAt,
    })),
  };

  try {
    const { data } = await supabase
      .from("architecture_docs")
      .select("storage")
      .eq("project_id", projectId)
      .single();

    const storage = (data?.storage as Record<string, any>) || {};
    storage.audit_memory = memoryRecord;

    await supabase
      .from("architecture_docs")
      .update({ storage })
      .eq("project_id", projectId);
  } catch (err) {
    console.warn("Failed to sync audit state to project memory:", err);
  }
}
