import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateDynamicFixPrompt } from "@/lib/ai/project-audit";

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

    const { data: findings } = await supabase
      .from("audit_findings")
      .select("*, fix_prompts(*)")
      .eq("project_id", id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ findings: findings || [] });
  } catch (err) {
    console.error("Fix Queue GET error:", err);
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

    const body = await request.json().catch(() => ({}));
    const { findingId, action, lifecycleStatus, newStatus } = body;

    if (action === "update_lifecycle" && findingId) {
      const statusToSet = lifecycleStatus || newStatus || "open";
      await supabase
        .from("audit_findings")
        .update({
          lifecycle_status: statusToSet,
          status: statusToSet === "resolved" ? "resolved" : "open",
          updated_at: new Date().toISOString(),
        })
        .eq("id", findingId)
        .eq("project_id", id);

      return NextResponse.json({ success: true, lifecycleStatus: statusToSet });
    }

    if (action === "generate_fix_prompt" && findingId) {
      const { data: finding } = await supabase
        .from("audit_findings")
        .select("*")
        .eq("id", findingId)
        .eq("project_id", id)
        .single();

      if (!finding) {
        return NextResponse.json({ error: "Finding not found." }, { status: 404 });
      }

      const generated = await generateDynamicFixPrompt({
        findingCode: finding.finding_code,
        category: finding.category,
        severity: finding.severity,
        title: finding.title,
        technicalExplanation: finding.technical_explanation,
        evidence: finding.evidence,
        affectedFileOrRoute: finding.affected_file_or_route,
        recommendedFix: finding.recommended_fix,
        verificationMethod: finding.verification_method,
        relatedFiles: finding.related_files || [],
      });

      const { data: fixPromptRecord } = await supabase
        .from("fix_prompts")
        .insert({
          finding_id: findingId,
          project_id: id,
          prompt_text: generated.promptText,
          requirements: generated.requirements,
          verification_steps: generated.verificationSteps,
          status: "generated",
        })
        .select("*")
        .single();

      // Update lifecycle status to fix_prompt_generated
      await supabase
        .from("audit_findings")
        .update({
          lifecycle_status: "fix_prompt_generated",
          updated_at: new Date().toISOString(),
        })
        .eq("id", findingId);

      return NextResponse.json({
        fixPrompt: fixPromptRecord,
        lifecycleStatus: "fix_prompt_generated",
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err) {
    console.error("Fix Queue POST error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}
