import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = await createClient();

    // Verify share token
    const { data: share } = await supabase
      .from("project_shares")
      .select("*, projects(*)")
      .eq("share_token", token)
      .eq("is_active", true)
      .single();

    if (!share || !share.projects) {
      return NextResponse.json({ error: "Invalid or expired share link." }, { status: 404 });
    }

    const projectId = share.project_id;

    // Fetch project artifacts for public report
    const [productRes, journeyRes, archRes, secRes, councilRes, promptsRes, findingsRes, checklistRes] = await Promise.all([
      supabase.from("product_specs").select("*").eq("project_id", projectId).limit(1),
      supabase.from("user_journeys").select("*").eq("project_id", projectId).limit(1),
      supabase.from("architecture_docs").select("*").eq("project_id", projectId).limit(1),
      supabase.from("security_plans").select("*").eq("project_id", projectId).limit(1),
      supabase.from("agent_decisions").select("*").eq("project_id", projectId).order("decision_number", { ascending: true }),
      supabase.from("prompts").select("*, prompt_versions(*)").eq("project_id", projectId),
      supabase.from("audit_findings").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
      supabase.from("production_checklists").select("*").eq("project_id", projectId),
    ]);

    return NextResponse.json({
      project: share.projects,
      productSpec: productRes.data?.[0] || null,
      userJourney: journeyRes.data?.[0] || null,
      architectureDoc: archRes.data?.[0] || null,
      securityPlan: secRes.data?.[0] || null,
      decisions: councilRes.data || [],
      prompts: promptsRes.data || [],
      findings: findingsRes.data || [],
      checklist: checklistRes.data || [],
    });
  } catch (err) {
    console.error("Public share GET error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}
