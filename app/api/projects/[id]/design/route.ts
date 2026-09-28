import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateDesignSpec } from "@/lib/ai/design-architecture";

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

    const { data: designDoc } = await supabase
      .from("design_specs")
      .select("*")
      .eq("project_id", id)
      .maybeSingle();

    return NextResponse.json({ designDoc });
  } catch (err) {
    console.error("Design Spec GET error:", err);
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

    const doc = await generateDesignSpec(project.name, project.description);

    const { data: savedDoc, error } = await supabase
      .from("design_specs")
      .upsert(
        {
          project_id: id,
          sitemap: doc.sitemap,
          user_flows: doc.user_flows,
          pages: doc.pages,
          components: doc.components,
          responsive_reqs: doc.responsive_reqs,
          accessibility_reqs: doc.accessibility_reqs,
          states: doc.states,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "project_id" }
      )
      .select("*")
      .single();

    if (error) {
      console.error("Design Spec upsert error:", error);
      return NextResponse.json({ error: "Failed to save design spec document." }, { status: 500 });
    }

    return NextResponse.json({ designDoc: savedDoc });
  } catch (err) {
    console.error("Design Spec POST error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}
