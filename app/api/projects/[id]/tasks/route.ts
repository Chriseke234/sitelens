import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateProjectTasks } from "@/lib/ai/task-engine";
import { generateBuildMap } from "@/lib/ai/build-map-engine";
import { generateSoftwareBlueprint } from "@/lib/ai/blueprint-engine";
import { checkDiscoverySufficiency } from "@/lib/ai/product-understanding";
import {
  AigenstraTask,
  BuildMap,
  EngineeringBlueprint,
  SoftwareBlueprint,
  TaskRecommendation,
} from "@/types";

function hasLegacyFictionalTaskData(tasks?: AigenstraTask[]): boolean {
  if (!tasks || tasks.length === 0) return true;
  return tasks.some(
    (t) =>
      t.title.includes("CoreResource") ||
      t.title.includes("WorkspaceItem") ||
      t.title.includes("Resource Creation") ||
      t.affected_entities?.includes("CoreResource") ||
      t.affected_entities?.includes("WorkspaceItem") ||
      t.change_boundaries?.mustChange?.includes(
        "app/(dashboard)/projects/[id]/overview/page.tsx"
      )
  );
}

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
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    // 1. Fetch project
    const { data: project, error: projErr } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (projErr || !project) {
      return NextResponse.json(
        { error: "Project workspace not found." },
        { status: 404 }
      );
    }

    // 2. Fetch discovery Q&A and check strict completion gate
    const { data: qnas } = await supabase
      .from("discovery_qna")
      .select("*")
      .eq("project_id", id)
      .order("step_order", { ascending: true });

    const sufficiency = checkDiscoverySufficiency(qnas || []);

    // STRICT GATING: Never expose or auto-generate tasks before Process 1 (Idea & Architecture) is complete
    if (!sufficiency.isSufficient) {
      return NextResponse.json({
        tasks: [],
        recommendation: null,
        blueprint: null,
        isDiscoveryComplete: false,
      });
    }

    // 3. Fetch architecture_docs, product_specs, and research_documents
    const [archRes, specRes, researchRes] = await Promise.all([
      supabase
        .from("architecture_docs")
        .select("*")
        .eq("project_id", id)
        .maybeSingle(),
      supabase
        .from("product_specs")
        .select("*")
        .eq("project_id", id)
        .maybeSingle(),
      supabase
        .from("research_documents")
        .select("*")
        .eq("project_id", id)
        .maybeSingle(),
    ]);

    const archDoc = archRes.data;
    const spec = specRes.data;
    const researchDoc = researchRes.data;

    const projectDetails = {
      problemStatement: project.problem_statement,
      targetAudience: project.target_audience,
      goal: project.goal,
      techStack: project.tech_stack,
      codingEnvironment: project.coding_environment,
    };

    const storedTasks = (archDoc?.storage as any)?.tasks as
      | AigenstraTask[]
      | undefined;

    let softwareBlueprint: SoftwareBlueprint | null = null;
    if (
      spec &&
      spec.problem_statement &&
      spec.problem_statement.startsWith("{")
    ) {
      try {
        const parsed = JSON.parse(spec.problem_statement) as SoftwareBlueprint;
        const raw = spec.problem_statement;
        if (
          !raw.includes("CoreResource") &&
          !raw.includes("WorkspaceItem") &&
          !raw.includes("Standard Item Lifecycle")
        ) {
          softwareBlueprint = parsed;
        }
      } catch {
        softwareBlueprint = null;
      }
    }

    if (
      storedTasks &&
      storedTasks.length > 0 &&
      !hasLegacyFictionalTaskData(storedTasks) &&
      softwareBlueprint
    ) {
      return NextResponse.json({
        tasks: storedTasks,
        recommendation: (archDoc?.storage as any)?.recommendation || null,
        blueprint: softwareBlueprint,
        isDiscoveryComplete: true,
      });
    }

    // Discovery is complete, synthesize real-time Blueprint, Build Map, and Tasks
    if (!softwareBlueprint) {
      softwareBlueprint = await generateSoftwareBlueprint(
        id,
        project.name,
        project.product_type || "SaaS",
        project.raw_idea || project.description,
        researchDoc,
        qnas || [],
        null,
        projectDetails
      );

      if (spec) {
        await supabase
          .from("product_specs")
          .update({
            problem_statement: JSON.stringify(softwareBlueprint),
            target_users: softwareBlueprint.overview.targetOutcome
              ? [softwareBlueprint.overview.targetOutcome]
              : [],
            updated_at: new Date().toISOString(),
          })
          .eq("id", spec.id);
      } else {
        await supabase.from("product_specs").insert({
          project_id: id,
          problem_statement: JSON.stringify(softwareBlueprint),
          target_users: softwareBlueprint.overview.targetOutcome
            ? [softwareBlueprint.overview.targetOutcome]
            : [],
        });
      }
    }

    const buildMap: BuildMap = await generateBuildMap(id, softwareBlueprint);
    const engineeringBlueprint: EngineeringBlueprint | null =
      (archDoc?.frontend as any) || null;

    const generated = await generateProjectTasks(
      id,
      project.name,
      project.product_type || "SaaS",
      buildMap,
      softwareBlueprint,
      engineeringBlueprint,
      qnas || [],
      researchDoc
    );

    if (archDoc) {
      await supabase
        .from("architecture_docs")
        .update({
          backend: buildMap as any,
          storage: {
            tasks: generated.tasks,
            recommendation: generated.recommendation,
          } as any,
          updated_at: new Date().toISOString(),
        })
        .eq("id", archDoc.id);
    } else {
      await supabase.from("architecture_docs").insert({
        project_id: id,
        backend: buildMap as any,
        storage: {
          tasks: generated.tasks,
          recommendation: generated.recommendation,
        } as any,
      });
    }

    return NextResponse.json({
      tasks: generated.tasks,
      recommendation: generated.recommendation,
      blueprint: softwareBlueprint,
      buildMap,
      isDiscoveryComplete: true,
    });
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
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: "Project workspace not found." },
        { status: 404 }
      );
    }

    const [qnaRes, researchRes, specRes, archRes] = await Promise.all([
      supabase
        .from("discovery_qna")
        .select("*")
        .eq("project_id", id)
        .order("step_order", { ascending: true }),
      supabase
        .from("research_documents")
        .select("*")
        .eq("project_id", id)
        .maybeSingle(),
      supabase
        .from("product_specs")
        .select("*")
        .eq("project_id", id)
        .maybeSingle(),
      supabase
        .from("architecture_docs")
        .select("*")
        .eq("project_id", id)
        .maybeSingle(),
    ]);

    const qnas = qnaRes.data || [];
    const sufficiency = checkDiscoverySufficiency(qnas);

    if (!sufficiency.isSufficient) {
      return NextResponse.json(
        {
          error:
            "Please complete all discovery questions in 1. Idea & Architecture before generating tasks and prompts.",
          isDiscoveryComplete: false,
        },
        { status: 400 }
      );
    }

    const researchDoc = researchRes.data;
    const spec = specRes.data;
    const archDoc = archRes.data;

    const projectDetails = {
      problemStatement: project.problem_statement,
      targetAudience: project.target_audience,
      goal: project.goal,
      techStack: project.tech_stack,
      codingEnvironment: project.coding_environment,
    };

    // Synthesize fresh Software Blueprint from confirmed answers + research
    const softwareBlueprint = await generateSoftwareBlueprint(
      id,
      project.name,
      project.product_type || "SaaS",
      project.raw_idea || project.description,
      researchDoc,
      qnas,
      null,
      projectDetails
    );

    if (spec) {
      await supabase
        .from("product_specs")
        .update({
          problem_statement: JSON.stringify(softwareBlueprint),
          target_users: softwareBlueprint.overview.targetOutcome
            ? [softwareBlueprint.overview.targetOutcome]
            : [],
          updated_at: new Date().toISOString(),
        })
        .eq("id", spec.id);
    } else {
      await supabase.from("product_specs").insert({
        project_id: id,
        problem_statement: JSON.stringify(softwareBlueprint),
        target_users: softwareBlueprint.overview.targetOutcome
          ? [softwareBlueprint.overview.targetOutcome]
          : [],
      });
    }

    const buildMap: BuildMap = await generateBuildMap(id, softwareBlueprint);
    const engineeringBlueprint: EngineeringBlueprint | null =
      (archDoc?.frontend as any) || null;

    const generated = await generateProjectTasks(
      id,
      project.name,
      project.product_type || "SaaS",
      buildMap,
      softwareBlueprint,
      engineeringBlueprint,
      qnas,
      researchDoc
    );

    if (archDoc) {
      await supabase
        .from("architecture_docs")
        .update({
          backend: buildMap as any,
          storage: {
            tasks: generated.tasks,
            recommendation: generated.recommendation,
          } as any,
          updated_at: new Date().toISOString(),
        })
        .eq("id", archDoc.id);
    } else {
      await supabase.from("architecture_docs").insert({
        project_id: id,
        backend: buildMap as any,
        storage: {
          tasks: generated.tasks,
          recommendation: generated.recommendation,
        } as any,
      });
    }

    return NextResponse.json({
      tasks: generated.tasks,
      recommendation: generated.recommendation,
      blueprint: softwareBlueprint,
      buildMap,
      isDiscoveryComplete: true,
      message: "Project blueprint, build map, and tasks synthesized in real time.",
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
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { taskId, status, readiness } = body;

    const { data: archDoc } = await supabase
      .from("architecture_docs")
      .select("*")
      .eq("project_id", id)
      .maybeSingle();

    if (!archDoc || !(archDoc.storage as any)?.tasks) {
      return NextResponse.json(
        { error: "Task store not found." },
        { status: 404 }
      );
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
