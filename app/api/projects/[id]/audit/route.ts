import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runMultiAgentProjectAudit } from "@/lib/ai/project-audit";

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

    const [auditsRes, findingsRes] = await Promise.all([
      supabase
        .from("project_audits")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("audit_findings")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false }),
    ]);

    return NextResponse.json({
      audits: auditsRes.data || [],
      findings: findingsRes.data || [],
    });
  } catch (err) {
    console.error("Project Audit GET error:", err);
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
    const codeContext = body?.codeContext || body?.repoUrl || body?.deployedUrl || "";

    const auditResult = await runMultiAgentProjectAudit(
      project.name,
      project.description,
      codeContext
    );

    // Save project audit record
    const { data: auditRecord } = await supabase
      .from("project_audits")
      .insert({
        project_id: id,
        status: "completed",
        readiness_scores: auditResult.readinessScores,
        completed_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    // Insert findings with complete Phase 6-7 metadata
    if (auditResult.findings && auditResult.findings.length > 0) {
      const findingsToInsert = auditResult.findings.map((f) => ({
        project_id: id,
        project_audit_id: auditRecord?.id || null,
        finding_code: f.findingCode,
        category: f.category,
        severity: f.severity,
        title: f.title,
        simple_explanation: f.simpleExplanation,
        technical_explanation: f.technicalExplanation,
        evidence: f.evidence,
        affected_file_or_route: f.affectedFileOrRoute,
        potential_impact: f.potentialImpact,
        recommended_fix: f.recommendedFix,
        verification_method: f.verificationMethod,
        confidence: f.confidence || "likely",
        related_files: f.relatedFiles,
        status: "open",
        lifecycle_status: "open",
      }));

      await supabase.from("audit_findings").insert(findingsToInsert);
    }

    const { data: allFindings } = await supabase
      .from("audit_findings")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      audit: auditRecord,
      findings: allFindings || [],
    });
  } catch (err) {
    console.error("Project Audit POST error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}
