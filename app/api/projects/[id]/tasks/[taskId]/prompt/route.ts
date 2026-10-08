import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { compileTaskPrompt } from "@/lib/ai/prompt-compiler";
import {
  AigenstraTask,
  ContextPack,
  CodingAgentProfile,
  SoftwareBlueprint,
  EngineeringBlueprint,
} from "@/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { id: projectId, taskId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    // Verify project access
    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: "Project workspace not found." },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const targetAgent: CodingAgentProfile =
      body?.targetAgent ||
      (project.coding_environment as CodingAgentProfile) ||
      "Antigravity";

    // Fetch existing architecture / task intelligence
    const [specRes, archRes] = await Promise.all([
      supabase
        .from("product_specs")
        .select("*")
        .eq("project_id", projectId)
        .limit(1),
      supabase
        .from("architecture_docs")
        .select("*")
        .eq("project_id", projectId)
        .limit(1),
    ]);

    const softwareBlueprint = specRes.data?.[0] as SoftwareBlueprint | undefined;
    const engineeringBlueprint = archRes.data?.[0] as
      | EngineeringBlueprint
      | undefined;

    // Build the task object from body or project metadata
    const task: AigenstraTask = body?.task || {
      id: taskId,
      project_id: projectId,
      title: body?.title || "Implement Feature Component",
      short_description: body?.purpose || "Implement production workflow",
      purpose: body?.purpose || "Build and verify user capability",
      user_value: body?.user_value || "Enables end users to interact smoothly",
      task_type: body?.task_type || "FEATURE",
      category: body?.category || "Core Workflow",
      priority: "HIGH",
      status: "READY",
      readiness: "READY_FOR_PROMPT",
      complexity: "MEDIUM",
      source: "BUILD_MAP",
      stageNumber: 1,
      dependencies: [],
      blocked_by: [],
      related_blueprint_items: [],
      related_engineering_items: [],
      related_decisions: [],
      related_assumptions: [],
      affected_screens: body?.affected_screens || [],
      affected_entities: body?.affected_entities || [],
      affected_apis: body?.affected_apis || [],
      acceptance_criteria: body?.acceptance_criteria || [
        "Feature operates reliably without unhandled errors",
        "0 TypeScript compilation errors on typecheck",
        "100% responsive layout across mobile and desktop",
      ],
      change_boundaries: body?.change_boundaries || {
        mustChange: ["app/", "components/"],
        mayChange: ["lib/", "types/"],
        mustNotChange: ["middleware.ts", "supabase/migrations/"],
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const contextPack: ContextPack | null = body?.contextPack || null;

    // Compile the 12-section prompt
    const compiledPrompt = await compileTaskPrompt(
      task,
      project.name,
      project.description || "",
      targetAgent,
      contextPack,
      softwareBlueprint,
      engineeringBlueprint
    );

    // Save prompt version to Supabase if table exists
    try {
      const { data: promptRecord } = await supabase
        .from("prompts")
        .upsert(
          {
            project_id: projectId,
            category: "backend",
            title: compiledPrompt.title,
            current_version: 1,
            status: "draft",
          },
          { onConflict: "project_id,category" }
        )
        .select()
        .single();

      if (promptRecord) {
        await supabase.from("prompt_versions").insert({
          prompt_id: promptRecord.id,
          version: 1,
          role: compiledPrompt.sections.find((s) => s.key === "ROLE")?.content || "",
          project_context: compiledPrompt.sections.find((s) => s.key === "PROJECT_CONTEXT")?.content || "",
          current_state: compiledPrompt.sections.find((s) => s.key === "CURRENT_STATE")?.content || "",
          objective: compiledPrompt.sections.find((s) => s.key === "OBJECTIVE")?.content || "",
          requirements: [compiledPrompt.sections.find((s) => s.key === "REQUIREMENTS")?.content || ""],
          security_requirements: [compiledPrompt.sections.find((s) => s.key === "SECURITY")?.content || ""],
          edge_cases: [compiledPrompt.sections.find((s) => s.key === "EDGE_CASES")?.content || ""],
          acceptance_criteria: [compiledPrompt.sections.find((s) => s.key === "ACCEPTANCE_CRITERIA")?.content || ""],
          validation: [compiledPrompt.sections.find((s) => s.key === "TESTING_EXPECTATIONS")?.content || ""],
          expected_output: compiledPrompt.sections.find((s) => s.key === "EXPECTED_OUTPUT")?.content || "",
          full_prompt_text: compiledPrompt.markdownText,
        });
      }
    } catch (saveErr) {
      console.warn("Notice: Prompt version saved in memory:", saveErr);
    }

    return NextResponse.json({
      success: true,
      prompt: compiledPrompt,
    });
  } catch (err) {
    console.error("Task prompt compilation error:", err);
    return NextResponse.json(
      { error: "Failed to compile prompt for this task." },
      { status: 500 }
    );
  }
}
