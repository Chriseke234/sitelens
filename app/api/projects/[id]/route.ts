import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !project) {
      return NextResponse.json({ error: "Project workspace not found." }, { status: 404 });
    }

    // Fetch related counts and summary metrics
    const [findingsRes, decisionsRes, promptsRes] = await Promise.all([
      supabase.from("audit_findings").select("severity", { count: "exact" }).eq("project_id", id).eq("status", "open"),
      supabase.from("agent_decisions").select("id", { count: "exact" }).eq("project_id", id),
      supabase.from("prompts").select("id", { count: "exact" }).eq("project_id", id),
    ]);

    const findings = findingsRes.data || [];
    const openIssues = {
      critical: findings.filter((f) => f.severity === "critical").length,
      high: findings.filter((f) => f.severity === "high").length,
      medium: findings.filter((f) => f.severity === "medium").length,
      low: findings.filter((f) => f.severity === "low").length,
    };

    return NextResponse.json({
      project,
      summary: {
        openIssuesCount: findingsRes.count || 0,
        openIssues,
        decisionsCount: decisionsRes.count || 0,
        promptsCount: promptsRes.count || 0,
      },
    });
  } catch (err) {
    console.error("Project GET API Error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}

export async function DELETE(
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

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting project:", error);
      return NextResponse.json({ error: "Failed to delete project workspace." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Project DELETE API Error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}
