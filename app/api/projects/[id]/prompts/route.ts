import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateStructuredPrompt, checkPrePromptReadiness, formatPromptForAgent } from "@/lib/ai/prompt-engine";
import { PromptCategory, CodingAgentProfile } from "@/types";

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

    const [promptsRes, sessionsRes, productRes, journeyRes, archRes, secRes] = await Promise.all([
      supabase
        .from("prompts")
        .select("*, prompt_versions(*)")
        .eq("project_id", id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("build_sessions")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false }),
      supabase.from("product_specs").select("id, structured_functional_reqs, edge_cases, acceptance_criteria").eq("project_id", id).limit(1),
      supabase.from("user_journeys").select("id").eq("project_id", id).limit(1),
      supabase.from("architecture_docs").select("id").eq("project_id", id).limit(1),
      supabase.from("security_plans").select("id").eq("project_id", id).limit(1),
    ]);

    const productSpec = productRes.data?.[0];
    const hasReqs = Boolean(productSpec);
    const hasUX = Boolean(journeyRes.data?.[0]);
    const hasArch = Boolean(archRes.data?.[0]);
    const hasSec = Boolean(secRes.data?.[0]);
    const hasEdge = Boolean(productSpec?.edge_cases && productSpec.edge_cases.length > 0);
    const hasAcceptance = Boolean(productSpec?.acceptance_criteria && productSpec.acceptance_criteria.length > 0);

    const readiness = checkPrePromptReadiness(hasReqs, hasUX, hasArch, hasSec, hasEdge, hasAcceptance);

    return NextResponse.json({
      prompts: promptsRes.data || [],
      buildSessions: sessionsRes.data || [],
      readiness,
    });
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
    const codingAgent: CodingAgentProfile = body?.codingAgent || (project.coding_environment as CodingAgentProfile) || "Antigravity";

    const promptData = await generateStructuredPrompt(
      project.name,
      project.description,
      category,
      codingAgent
    );

    // Check if a prompt already exists for this category
    const { data: existingPrompt } = await supabase
      .from("prompts")
      .select("*, prompt_versions(version)")
      .eq("project_id", id)
      .eq("category", category)
      .single();

    let promptRecord = existingPrompt;
    let nextVersionNumber = 1;

    if (!existingPrompt) {
      const { data: newPrompt, error: promptError } = await supabase
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

      if (promptError || !newPrompt) {
        console.error("Prompt record insert error:", promptError);
        return NextResponse.json({ error: "Failed to initialize prompt record." }, { status: 500 });
      }
      promptRecord = newPrompt;
    } else {
      const maxVer = (existingPrompt.prompt_versions || []).reduce((max: number, v: { version: number }) => Math.max(max, v.version), 0);
      nextVersionNumber = maxVer + 1;

      await supabase
        .from("prompts")
        .update({
          current_version: nextVersionNumber,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingPrompt.id);
    }

    // Insert new version
    const { data: versionRecord, error: versionError } = await supabase
      .from("prompt_versions")
      .insert({
        prompt_id: promptRecord.id,
        version: nextVersionNumber,
        role: promptData.role,
        project_context: promptData.projectContext,
        current_state: promptData.currentState,
        objective: promptData.objective,
        requirements: promptData.requirements,
        existing_architecture: promptData.existingArchitecture,
        technical_constraints: promptData.technicalConstraints,
        ux_requirements: promptData.uxRequirements,
        security_requirements: promptData.securityRequirements,
        edge_cases: promptData.edgeCases,
        do_not_change: promptData.doNotChange,
        acceptance_criteria: promptData.acceptanceCriteria,
        testing_requirements: promptData.testingRequirements,
        validation: promptData.validation,
        expected_output: promptData.expectedOutput,
        full_prompt_text: promptData.fullPromptText,
      })
      .select("*")
      .single();

    if (versionError) {
      console.error("Prompt version insert error:", versionError);
      return NextResponse.json({ error: "Failed to save prompt version." }, { status: 500 });
    }

    // Optionally create or update a build session for this stage
    try {
      await supabase.from("build_sessions").insert({
        project_id: id,
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Implementation`,
        stage: category,
        coding_agent: codingAgent,
        prompt_id: promptRecord.id,
        status: "not_started",
        user_notes: `Prompt v${nextVersionNumber} generated for ${codingAgent}.`,
      });
    } catch (_) {}

    return NextResponse.json({
      prompt: promptRecord,
      version: versionRecord,
    });
  } catch (err) {
    console.error("Prompts POST error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}

export async function PATCH(
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

    const body = await request.json().catch(() => ({}));
    const { sessionId, status, notes } = body;

    if (!sessionId || !status) {
      return NextResponse.json({ error: "Session ID and status are required." }, { status: 400 });
    }

    const { data: updatedSession, error } = await supabase
      .from("build_sessions")
      .update({
        status,
        user_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .eq("project_id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to update build session." }, { status: 500 });
    }

    return NextResponse.json({ session: updatedSession });
  } catch (err) {
    console.error("Prompts PATCH error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}
