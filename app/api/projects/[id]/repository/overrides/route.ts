import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project workspace not found." }, { status: 404 });
    }

    const body = await request.json();
    const { taskId, filePath, overrideAction, userRationale } = body;

    if (!taskId || !filePath || !overrideAction) {
      return NextResponse.json({ error: "Missing required override fields." }, { status: 400 });
    }

    const { error: upsertErr } = await supabase.from("task_context_overrides").upsert(
      {
        project_id: projectId,
        task_id: taskId,
        file_path: filePath,
        override_action: overrideAction,
        user_rationale: userRationale || "User manual task context adjustment",
      },
      { onConflict: "project_id,task_id,file_path" }
    );

    if (upsertErr) {
      console.warn("Could not save to task_context_overrides table:", upsertErr);
    }

    return NextResponse.json({
      success: true,
      message: `Override '${overrideAction}' applied for ${filePath}`,
    });
  } catch (err: any) {
    console.error("Override POST error:", err);
    return NextResponse.json({ error: err.message || "Failed to update context override." }, { status: 500 });
  }
}
