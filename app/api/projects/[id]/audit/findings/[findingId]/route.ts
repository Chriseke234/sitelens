import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateFindingUserOverride } from "@/lib/audit/store";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; findingId: string }> }
) {
  try {
    const { id, findingId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const { action, rationale } = body;

    if (!action || !["DISMISSED", "MARKED_NA", "MANUAL_REVIEW"].includes(action)) {
      return NextResponse.json({ error: "Invalid override action." }, { status: 400 });
    }

    const override = {
      action,
      rationale: rationale || "User marked via Audit Hub",
      timestamp: new Date().toISOString(),
    };

    await updateFindingUserOverride(id, findingId, override);

    return NextResponse.json({ success: true, override });
  } catch (err) {
    console.error("Finding override PATCH error:", err);
    return NextResponse.json({ error: "Failed to update finding." }, { status: 500 });
  }
}
