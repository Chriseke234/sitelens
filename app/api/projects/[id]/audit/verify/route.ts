import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveSnapshot } from "@/lib/repository/store";
import { loadLatestAuditSnapshot, persistAuditSnapshot } from "@/lib/audit/store";
import { verifyFinding } from "@/lib/audit/verify";
import {
  saveVerification,
  updateFindingVerificationStatus,
  saveHealthSnapshot,
} from "@/lib/audit/verification-store";
import { computeProjectHealth } from "@/lib/audit/health";
import { syncAuditToProjectMemory } from "@/lib/audit/memory-sync";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project workspace not found." }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { findingId } = body;

    if (!findingId) {
      return NextResponse.json({ error: "findingId is required for targeted verification." }, { status: 400 });
    }

    // 1. Load active snapshot & files
    const repoData = await getActiveSnapshot(projectId);
    if (!repoData || !repoData.snapshot) {
      return NextResponse.json(
        { error: "No connected repository snapshot found. Connect or refresh your project repository first." },
        { status: 400 }
      );
    }

    const snapshot = repoData.snapshot;
    const files = repoData.files;
    const chunks = repoData.chunks;

    // 2. Load latest audit & find target finding
    const audit = await loadLatestAuditSnapshot(projectId);
    if (!audit) {
      return NextResponse.json({ error: "No audit records found for this project." }, { status: 404 });
    }

    const finding = audit.findings.find((f) => f.id === findingId);
    if (!finding) {
      return NextResponse.json({ error: "Finding not found in active audit report." }, { status: 404 });
    }

    // 3. Execute targeted verification check
    const verification = await verifyFinding({
      finding,
      currentSnapshot: snapshot,
      files,
      chunks,
    });

    // 4. Save verification record
    await saveVerification(verification);

    // 5. Update finding status
    const isRegression = verification.status === "REGRESSED";
    await updateFindingVerificationStatus(finding.id, verification.status, verification.id, isRegression);

    // Update in-memory audit object for consistency
    finding.verificationStatus = verification.status;
    finding.verificationId = verification.id;
    if (verification.status === "RESOLVED") {
      finding.status = "VERIFIED";
      finding.resolvedAt = new Date().toISOString();
    } else if (verification.status === "REGRESSED") {
      finding.status = "CRITICAL";
      finding.severity = "CRITICAL";
      finding.regressionCount = (finding.regressionCount || 0) + 1;
    }
    await persistAuditSnapshot(audit);

    // 6. Compute & save updated Project Health
    const health = computeProjectHealth({
      projectId,
      audit,
      snapshot,
    });
    await saveHealthSnapshot(health);

    // 7. Sync to project memory
    await syncAuditToProjectMemory(projectId, health, audit.findings, [verification]);

    return NextResponse.json({
      success: true,
      verification,
      finding,
      health,
    });
  } catch (err) {
    console.error("Verification API error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred during verification." }, { status: 500 });
  }
}
