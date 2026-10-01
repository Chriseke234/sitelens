import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runReAuditComparison } from "@/lib/ai/re-audit-engine";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { data: reAudits } = await supabase
      .from("re_audits")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ reAudits: reAudits || [] });
  } catch (err) {
    console.error("Re-Audit GET error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project workspace not found." }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const codeContext = body?.codeContext || "Latest updated route handlers and database queries.";

    // Fetch existing open or in-progress findings
    const { data: previousFindings } = await supabase
      .from("audit_findings")
      .select("*")
      .eq("project_id", id);

    const findingsToCompare = (previousFindings || []).map((f) => ({
      findingCode: f.finding_code,
      title: f.title,
      evidence: f.evidence || f.technical_explanation,
      recommendedFix: f.recommended_fix,
      status: f.lifecycle_status || f.status,
    }));

    const reAuditResult = await runReAuditComparison(
      project.name,
      findingsToCompare,
      codeContext
    );

    // Update finding statuses based on evidence evaluations
    for (const item of reAuditResult.evidenceLog) {
      const newStatus = item.verdict === "RESOLVED" ? "resolved" : item.verdict === "REGRESSED" ? "regressed" : "open";
      await supabase
        .from("audit_findings")
        .update({
          lifecycle_status: newStatus,
          status: newStatus === "resolved" ? "resolved" : "open",
          updated_at: new Date().toISOString(),
        })
        .eq("project_id", id)
        .eq("finding_code", item.findingCode);
    }

    // Save Re-Audit Record
    const { data: reAuditRecord } = await supabase
      .from("re_audits")
      .insert({
        project_id: id,
        resolved_findings_count: reAuditResult.resolvedCount,
        regressed_findings_count: reAuditResult.regressedCount,
        still_present_count: reAuditResult.stillPresentCount,
        comparison_summary: reAuditResult.comparisonSummary,
        evidence_log: reAuditResult.evidenceLog,
      })
      .select("*")
      .single();

    return NextResponse.json({
      reAudit: reAuditRecord,
      comparison: reAuditResult,
    });
  } catch (err) {
    console.error("Re-Audit POST error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}
