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

    const { data: decisions } = await supabase
      .from("agent_decisions")
      .select("*")
      .eq("project_id", id)
      .order("decision_number", { ascending: false });

    return NextResponse.json({ decisions: decisions || [] });
  } catch (err) {
    console.error("Decisions GET error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}
