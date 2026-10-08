import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProjectUsageMetrics } from "@/lib/analytics/usage";
import { createSafeErrorResponse } from "@/lib/errors/handler";

export async function GET(
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

    const { data: project, error: projErr } = await supabase
      .from("projects")
      .select("id, name")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projErr || !project) {
      return NextResponse.json({ error: "Project workspace not found." }, { status: 404 });
    }

    const usage = await getProjectUsageMetrics(projectId);

    return NextResponse.json({
      success: true,
      usage,
    });
  } catch (err) {
    return createSafeErrorResponse(err, 500, "Failed to load project token & usage analytics.", "INTERNAL_ERROR");
  }
}
