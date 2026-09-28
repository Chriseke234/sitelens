import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateUserJourneyDocument } from "@/lib/ai/product-intelligence";

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

    const { data: journeyDoc } = await supabase
      .from("user_journeys")
      .select("*")
      .eq("project_id", id)
      .maybeSingle();

    return NextResponse.json({ journeyDoc });
  } catch (err) {
    console.error("User Journey GET error:", err);
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

    const doc = await generateUserJourneyDocument(project.name, project.description);

    const { data: savedDoc, error } = await supabase
      .from("user_journeys")
      .upsert(
        {
          project_id: id,
          title: doc.title,
          persona: doc.persona,
          steps: doc.steps,
          happy_path: doc.happy_path,
          edge_cases: doc.edge_cases,
          failure_paths: doc.failure_paths,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "project_id" }
      )
      .select("*")
      .single();

    if (error) {
      console.error("User Journey upsert error:", error);
      return NextResponse.json({ error: "Failed to save user journey document." }, { status: 500 });
    }

    return NextResponse.json({ journeyDoc: savedDoc });
  } catch (err) {
    console.error("User Journey POST error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}
