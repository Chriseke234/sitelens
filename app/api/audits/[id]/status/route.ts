import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: auditId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: audit, error } = await supabase
      .from("audits")
      .select("id, status, overall_score, created_at, completed_at")
      .eq("id", auditId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !audit) {
      return NextResponse.json({ error: "Audit not found." }, { status: 404 });
    }

    return NextResponse.json({
      id: audit.id,
      status: audit.status,
      overallScore: audit.overall_score,
      completedAt: audit.completed_at,
    });
  } catch (err) {
    console.error("Audit status API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch audit status." },
      { status: 500 }
    );
  }
}
