import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateArchitectureDoc } from "@/lib/ai/design-architecture";

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

    const { data: archDoc } = await supabase
      .from("architecture_docs")
      .select("*")
      .eq("project_id", id)
      .maybeSingle();

    return NextResponse.json({ archDoc });
  } catch (err) {
    console.error("Architecture GET error:", err);
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

    const doc = await generateArchitectureDoc(project.name, project.description, project.tech_stack || undefined);

    const { data: savedDoc, error } = await supabase
      .from("architecture_docs")
      .upsert(
        {
          project_id: id,
          frontend: doc.frontend,
          backend: doc.backend,
          database_schema: doc.database_schema,
          authentication: doc.authentication,
          storage: doc.storage,
          integrations: doc.integrations,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "project_id" }
      )
      .select("*")
      .single();

    if (error) {
      console.error("Architecture upsert error:", error);
      return NextResponse.json({ error: "Failed to save architecture document." }, { status: 500 });
    }

    return NextResponse.json({ archDoc: savedDoc });
  } catch (err) {
    console.error("Architecture POST error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}
