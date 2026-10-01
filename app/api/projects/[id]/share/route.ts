import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

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

    const { data: share } = await supabase
      .from("project_shares")
      .select("*")
      .eq("project_id", id)
      .eq("is_active", true)
      .single();

    return NextResponse.json({ share: share || null });
  } catch (err) {
    console.error("Share GET error:", err);
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
    const action = body?.action || "create";

    if (action === "revoke") {
      await supabase
        .from("project_shares")
        .update({ is_active: false })
        .eq("project_id", id);

      return NextResponse.json({ success: true, revoked: true });
    }

    // Generate secure cryptographic token
    const shareToken = "aig_" + crypto.randomBytes(16).toString("hex");

    // Deactivate previous tokens
    await supabase
      .from("project_shares")
      .update({ is_active: false })
      .eq("project_id", id);

    const { data: shareRecord, error } = await supabase
      .from("project_shares")
      .insert({
        project_id: id,
        share_token: shareToken,
        is_active: true,
        created_by: user.id,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to generate share token." }, { status: 500 });
    }

    return NextResponse.json({ share: shareRecord });
  } catch (err) {
    console.error("Share POST error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}
