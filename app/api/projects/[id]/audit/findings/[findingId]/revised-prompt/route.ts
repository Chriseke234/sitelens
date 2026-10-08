import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveSnapshot } from "@/lib/repository/store";
import { loadLatestAuditSnapshot } from "@/lib/audit/store";
import { loadVerificationsForFinding } from "@/lib/audit/verification-store";
import { compileRevisedFixPrompt } from "@/lib/audit/revised-fix-prompt";
import { CodingAgentProfile, AuditVerification } from "@/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; findingId: string }> }
) {
  try {
    const { id: projectId, findingId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const targetAgent: CodingAgentProfile = body.targetAgent || "Antigravity";
    const customNotes: string | undefined = body.customNotes;

    const audit = await loadLatestAuditSnapshot(projectId);
    if (!audit) {
      return NextResponse.json({ error: "No audit records found." }, { status: 404 });
    }

    const finding = audit.findings.find((f) => f.id === findingId);
    if (!finding) {
      return NextResponse.json({ error: "Finding not found." }, { status: 404 });
    }

    const repoData = await getActiveSnapshot(projectId);
    const snapshot = repoData?.snapshot;
    const verifications = await loadVerificationsForFinding(findingId);
    const latestVerification: AuditVerification = verifications[0] || {
      id: `ver-${Date.now()}`,
      projectId,
      findingId: finding.id,
      verificationScope: "TARGETED_FINDING",
      expectedBehavior: finding.expectedBehavior,
      observedBehavior: finding.observedBehavior,
      originalEvidence: finding.evidence || {},
      currentEvidence: finding.evidence || {},
      verificationMethod: "STATIC_ANALYSIS",
      status: (finding.verificationStatus as any) || "STILL_PRESENT",
      confidence: "MEDIUM",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const promptText = compileRevisedFixPrompt({
      finding,
      verification: latestVerification,
      targetAgent,
      snapshot: snapshot || undefined,
      customNotes,
    });

    return NextResponse.json({
      success: true,
      prompt: promptText,
      targetAgent,
      verification: latestVerification,
    });
  } catch (err) {
    console.error("Revised Fix Prompt API error:", err);
    return NextResponse.json({ error: "Failed to compile revised fix prompt." }, { status: 500 });
  }
}
