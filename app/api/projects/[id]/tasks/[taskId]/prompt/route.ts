import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { compileTaskPrompt } from "@/lib/ai/prompt-compiler";
import { generateSoftwareBlueprint } from "@/lib/ai/blueprint-engine";
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

    // Fetch existing architecture, discovery QnAs, research doc, and product specs
    const [specRes, archRes, qnaRes, researchRes] = await Promise.all([
      supabase
        .from("product_specs")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle(),
      supabase
        .from("architecture_docs")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle(),
      supabase
        .from("discovery_qna")
        .select("*")
        .eq("project_id", projectId)
        .order("step_order", { ascending: true }),
      supabase
        .from("research_documents")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle(),
    ]);

    const qnas = qnaRes.data || [];
    const researchDoc = researchRes.data;
    const rawSpec = specRes.data;
    const archDoc = archRes.data;

    const projectDetails = {
      problemStatement: project.problem_statement,
      targetAudience: project.target_audience,
      goal: project.goal,
      techStack: project.tech_stack,
      codingEnvironment: project.coding_environment,
    };

    let softwareBlueprint: SoftwareBlueprint | null = null;
    if (
      rawSpec &&
      rawSpec.problem_statement &&
      rawSpec.problem_statement.startsWith("{")
    ) {
      try {
        softwareBlueprint = JSON.parse(rawSpec.problem_statement);
      } catch (err) {
        console.error("Failed to parse stored blueprint in prompt route:", err);
      }
    }

    if (!softwareBlueprint) {
      softwareBlueprint = await generateSoftwareBlueprint(
        projectId,
        project.name,
        project.product_type || "SaaS",
        project.raw_idea || project.description,
        researchDoc,
        qnas,
        null,
        projectDetails
      );
    }

    const engineeringBlueprint = (archDoc?.frontend as
      | EngineeringBlueprint
      | undefined) || null;

    // Resolve the real task from request body or stored tasks in architecture_docs
    const storedTasks: AigenstraTask[] =
      (archDoc?.storage as any)?.tasks || [];
    const matchedStoredTask = storedTasks.find((t) => t.id === taskId);
    const task: AigenstraTask | undefined = body?.task || matchedStoredTask;

    if (!task) {
      return NextResponse.json(
        {
          error:
            "Task specification not found. Complete discovery questions and generate tasks first.",
        },
        { status: 400 }
      );
    }

    const contextPack: ContextPack | null = body?.contextPack || null;

    // Compile the 12-section prompt in real time grounded in user answers + research + blueprint
    const compiledPrompt = await compileTaskPrompt(
      task,
      project.name,
      project.raw_idea || project.description || "",
      targetAgent,
      contextPack,
      softwareBlueprint,
      engineeringBlueprint,
      qnas,
      researchDoc,
      project.product_type || "SaaS"
    );

    // Save prompt version to Supabase
    try {
      const { data: existingPrompt } = await supabase
        .from("prompts")
        .select("id, current_version")
        .eq("project_id", projectId)
        .eq("title", compiledPrompt.title)
        .maybeSingle();

      let promptId = existingPrompt?.id;
      const nextVersion = existingPrompt
        ? (existingPrompt.current_version || 1) + 1
        : 1;

      if (existingPrompt) {
        await supabase
          .from("prompts")
          .update({
            current_version: nextVersion,
            status: "ready",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingPrompt.id);
      } else {
        const { data: insertedPrompt } = await supabase
          .from("prompts")
          .insert({
            project_id: projectId,
            category: (task.task_type || "feature").toLowerCase(),
            title: compiledPrompt.title,
            current_version: 1,
            status: "ready",
          })
          .select("id")
          .single();
        promptId = insertedPrompt?.id;
      }

      if (promptId) {
        await supabase.from("prompt_versions").insert({
          prompt_id: promptId,
          version: nextVersion,
          role:
            compiledPrompt.sections.find((s) => s.key === "ROLE")?.content || "",
          project_context:
            compiledPrompt.sections.find((s) => s.key === "PROJECT_CONTEXT")
              ?.content || "",
          current_state:
            compiledPrompt.sections.find((s) => s.key === "CURRENT_STATE")
              ?.content || "",
          objective:
            compiledPrompt.sections.find((s) => s.key === "OBJECTIVE")
              ?.content || "",
          requirements: [
            compiledPrompt.sections.find((s) => s.key === "REQUIREMENTS")
              ?.content || "",
          ],
          security_requirements: [
            compiledPrompt.sections.find((s) => s.key === "SECURITY")
              ?.content || "",
          ],
          edge_cases: [
            compiledPrompt.sections.find((s) => s.key === "EDGE_CASES")
              ?.content || "",
          ],
          acceptance_criteria: [
            compiledPrompt.sections.find((s) => s.key === "ACCEPTANCE_CRITERIA")
              ?.content || "",
          ],
          validation: [
            compiledPrompt.sections.find(
              (s) => s.key === "TESTING_EXPECTATIONS"
            )?.content || "",
          ],
          expected_output:
            compiledPrompt.sections.find((s) => s.key === "EXPECTED_OUTPUT")
              ?.content || "",
          full_prompt_text: compiledPrompt.markdownText,
        });
      }
    } catch (saveErr) {
      console.warn("Notice: Prompt version persistence skipped:", saveErr);
    }

    return NextResponse.json({
      success: true,
      prompt: compiledPrompt,
      blueprint: softwareBlueprint,
    });
  } catch (err: any) {
    console.error("Task prompt compilation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to compile prompt for this task." },
      { status: 500 }
    );
  }
}
