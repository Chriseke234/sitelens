import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateStructuredPrompt } from "@/lib/ai/prompt-engine";
import { PromptCategory } from "@/types";

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

    const { data: prompts } = await supabase
      .from("prompts")
      .select("*, prompt_versions(*)")
      .eq("project_id", id)
      .order("updated_at", { ascending: false });

    return NextResponse.json({ prompts: prompts || [] });
  } catch (err) {
    console.error("Prompts GET error:", err);
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
    const category: PromptCategory = body?.category || "architecture";

    const promptData = await generateStructuredPrompt(
      project.name,
      project.description,
      category,
      project.coding_environment
    );

    // Insert or update prompt parent record
    const { data: promptRecord, error: promptError } = await supabase
      .from("prompts")
      .insert({
        project_id: id,
        category,
        title: promptData.title,
        current_version: 1,
        status: "draft",
      })
      .select("*")
      .single();

    if (promptError || !promptRecord) {
      console.error("Prompt record insert error:", promptError);
      return NextResponse.json({ error: "Failed to initialize prompt record." }, { status: 500 });
    }

    // Insert prompt version v1
    const { data: versionRecord, error: versionError } = await supabase
      .from("prompt_versions")
      .insert({
        prompt_id: promptRecord.id,
        version: 1,
        role: promptData.role,
        project_context: promptData.projectContext,
        current_state: promptData.currentState,
        objective: promptData.objective,
        requirements: promptData.requirements,
        constraints: promptData.constraints,
        security_requirements: promptData.securityRequirements,
        edge_cases: promptData.edgeCases,
        acceptance_criteria: promptData.acceptanceCriteria,
        validation: promptData.validation,
        output_requirements: promptData.outputRequirements,
        full_prompt_text: promptData.fullPromptText,
      })
      .select("*")
      .single();

    if (versionError) {
      console.error("Prompt version insert error:", versionError);
      return NextResponse.json({ error: "Failed to save prompt version." }, { status: 500 });
    }

    return NextResponse.json({
      prompt: promptRecord,
      version: versionRecord,
    });
  } catch (err) {
    console.error("Prompts POST error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}
