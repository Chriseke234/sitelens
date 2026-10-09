import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateProjectTasks } from "@/lib/ai/task-engine";
import { generateBuildMap } from "@/lib/ai/build-map-engine";
import { generateSoftwareBlueprint } from "@/lib/ai/blueprint-engine";
import {
  AigenstraTask,
  BuildMap,
  EngineeringBlueprint,
  SoftwareBlueprint,
  TaskRecommendation,
} from "@/types";

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

    // 1. Fetch project
    const { data: project, error: projErr } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (projErr || !project) {
      return NextResponse.json({ error: "Project workspace not found." }, { status: 404 });
    }

    // 2. Fetch architecture_docs to see if tasks are stored
    const { data: archDoc } = await supabase
      .from("architecture_docs")
      .select("*")
      .eq("project_id", id)
      .maybeSingle();

    let tasks: AigenstraTask[] = [];
    let recommendation: TaskRecommendation | null = null;

    const { data: qnas } = await supabase
      .from("discovery_qna")
      .select("*")
      .eq("project_id", id)
      .order("step_order", { ascending: true });

    const projectDetails = {
      problemStatement: project.problem_statement,
      targetAudience: project.target_audience,
      goal: project.goal,
      techStack: project.tech_stack,
      codingEnvironment: project.coding_environment,
    };

    const storedTasks = (archDoc?.storage as any)?.tasks as AigenstraTask[] | undefined;
    const hasFictionalTasks = storedTasks?.some(
      (t) =>
        t.title.includes("CoreResource") ||
        t.title.includes("Resource Creation") ||
        t.affected_entities.includes("CoreResource")
    );

    if (storedTasks && storedTasks.length > 0 && !hasFictionalTasks) {
      tasks = storedTasks;
      recommendation = (archDoc?.storage as any)?.recommendation;
    } else {
      // Load Software Blueprint & Build Map
      let softwareBlueprint: SoftwareBlueprint;
      const { data: spec } = await supabase
        .from("product_specs")
        .select("*")
        .eq("project_id", id)
        .maybeSingle();

      if (spec && spec.problem_statement && spec.problem_statement.startsWith("{")) {
        try {
          softwareBlueprint = JSON.parse(spec.problem_statement);
        } catch {
          softwareBlueprint = await generateSoftwareBlueprint(
            id,
            project.name,
            project.product_type || "SaaS",
            project.raw_idea || project.description,
            null,
            qnas || [],
            null,
            projectDetails
          );
        }
      } else {
        softwareBlueprint = await generateSoftwareBlueprint(
          id,
          project.name,
          project.product_type || "SaaS",
          project.raw_idea || project.description,
          null,
          qnas || [],
          null,
          projectDetails
        );
      }

      let buildMap: BuildMap;
      if (archDoc && (archDoc.backend as any)?.stages) {
        buildMap = archDoc.backend as unknown as BuildMap;
      } else {
        buildMap = await generateBuildMap(id, softwareBlueprint);
      }

      const engineeringBlueprint: EngineeringBlueprint | null = archDoc?.frontend as any || null;

      const generated = await generateProjectTasks(
        id,
        project.name,
        project.product_type || "SaaS",
        buildMap,
        softwareBlueprint,
        engineeringBlueprint
      );

      tasks = generated.tasks;
      recommendation = generated.recommendation;

      // Save tasks in architecture_docs (storage column)
      if (archDoc) {
        await supabase
          .from("architecture_docs")
          .update({
            storage: { tasks, recommendation } as any,
            updated_at: new Date().toISOString(),
          })
          .eq("id", archDoc.id);
      } else {
        await supabase.from("architecture_docs").insert({
          project_id: id,
          storage: { tasks, recommendation } as any,
        });
      }
    }

    return NextResponse.json({ tasks, recommendation });
  } catch (err: any) {
    console.error("Error in GET /api/projects/[id]/tasks:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load project tasks." },
      { status: 500 }
    );
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

    // Load Blueprint & Build Map
    const { data: spec } = await supabase
      .from("product_specs")
      .select("*")
      .eq("project_id", id)
      .maybeSingle();

    let softwareBlueprint: SoftwareBlueprint;
    if (spec && spec.problem_statement && spec.problem_statement.startsWith("{")) {
      softwareBlueprint = JSON.parse(spec.problem_statement);
    } else {
      softwareBlueprint = await generateSoftwareBlueprint(
        id,
        project.name,
        project.product_type || "SaaS",
        project.raw_idea || project.description
      );
    }

    const { data: archDoc } = await supabase
      .from("architecture_docs")
      .select("*")
      .eq("project_id", id)
      .maybeSingle();

    let buildMap: BuildMap;
    if (archDoc && (archDoc.backend as any)?.stages) {
      buildMap = archDoc.backend as unknown as BuildMap;
    } else {
      buildMap = await generateBuildMap(id, softwareBlueprint);
    }

    const engineeringBlueprint: EngineeringBlueprint | null = archDoc?.frontend as any || null;

    const generated = await generateProjectTasks(
      id,
      project.name,
      project.product_type || "SaaS",
      buildMap,
      softwareBlueprint,
      engineeringBlueprint
    );

    if (archDoc) {
      await supabase
        .from("architecture_docs")
        .update({
          storage: { tasks: generated.tasks, recommendation: generated.recommendation } as any,
          updated_at: new Date().toISOString(),
        })
        .eq("id", archDoc.id);
    } else {
      await supabase.from("architecture_docs").insert({
        project_id: id,
        storage: { tasks: generated.tasks, recommendation: generated.recommendation } as any,
      });
    }

    return NextResponse.json({
      tasks: generated.tasks,
      recommendation: generated.recommendation,
      message: "Project tasks generated successfully.",
    });
  } catch (err: any) {
    console.error("Error in POST /api/projects/[id]/tasks:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate project tasks." },
      { status: 500 }
    );
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

    const body = await request.json();
    const { taskId, status, readiness } = body;

    const { data: archDoc } = await supabase
      .from("architecture_docs")
      .select("*")
      .eq("project_id", id)
      .maybeSingle();

    if (!archDoc || !(archDoc.storage as any)?.tasks) {
      return NextResponse.json({ error: "Task store not found." }, { status: 404 });
    }

    const taskStore = archDoc.storage as any;
    const tasks: AigenstraTask[] = taskStore.tasks || [];
    const idx = tasks.findIndex((t) => t.id === taskId);

    if (idx !== -1) {
      if (status) tasks[idx].status = status;
      if (readiness) tasks[idx].readiness = readiness;
      tasks[idx].updated_at = new Date().toISOString();
    }

    await supabase
      .from("architecture_docs")
      .update({
        storage: { ...taskStore, tasks },
        updated_at: new Date().toISOString(),
      })
      .eq("id", archDoc.id);

    return NextResponse.json({
      tasks,
      recommendation: taskStore.recommendation,
      message: "Task updated successfully.",
    });
  } catch (err: any) {
    console.error("Error in PATCH /api/projects/[id]/tasks:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update task." },
      { status: 500 }
    );
  }
}
