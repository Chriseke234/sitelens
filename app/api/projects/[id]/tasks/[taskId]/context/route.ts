import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateTaskContextPack } from "@/lib/ai/context-engine";
import { generateSoftwareBlueprint } from "@/lib/ai/blueprint-engine";
import { getActiveSnapshot } from "@/lib/repository/store";
import { retrieveTaskRepositoryContext } from "@/lib/repository/retrieval";
import {
  AigenstraTask,
  ContextPack,
  EngineeringBlueprint,
  SoftwareBlueprint,
} from "@/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { id, taskId } = await params;
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

    const tasks: AigenstraTask[] = (archDoc?.storage as any)?.tasks || [];
    const task = tasks.find((t) => t.id === taskId);

    if (!task) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    // Check if context pack is stored
    const contextPacks: Record<string, ContextPack> = (archDoc?.integrations as any)?.context_packs || {};
    let contextPack = contextPacks[taskId];

    if (!contextPack) {
      // Load Software Blueprint
      const { data: spec } = await supabase
        .from("product_specs")
        .select("*")
        .eq("project_id", id)
        .maybeSingle();

      let softwareBlueprint: SoftwareBlueprint;
      if (spec && spec.problem_statement && spec.problem_statement.startsWith("{")) {
        softwareBlueprint = JSON.parse(spec.problem_statement);
      } else {
        const { data: project } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();

        softwareBlueprint = await generateSoftwareBlueprint(
          id,
          project?.name || "Project",
          project?.product_type || "SaaS",
          project?.raw_idea || project?.description || ""
        );
      }

      const engineeringBlueprint: EngineeringBlueprint | null = archDoc?.frontend as any || null;

      // Check for active repository context
      let repoContext = null;
      try {
        const { snapshot, files, symbols, chunks, overrides } = await getActiveSnapshot(id);
        if (snapshot) {
          repoContext = retrieveTaskRepositoryContext(task, snapshot, files, symbols, chunks, overrides);
        }
      } catch (repoErr) {
        console.warn("Could not retrieve repository context:", repoErr);
      }

      contextPack = await generateTaskContextPack(task, softwareBlueprint, engineeringBlueprint, repoContext);
      if (repoContext) {
        contextPack.repository = repoContext;
        contextPack.snapshotId = repoContext.snapshotId;
      }

      // Save context pack
      contextPacks[taskId] = contextPack;
      if (archDoc) {
        await supabase
          .from("architecture_docs")
          .update({
            integrations: { ...(archDoc.integrations as any || {}), context_packs: contextPacks } as any,
            updated_at: new Date().toISOString(),
          })
          .eq("id", archDoc.id);
      }
    }

    return NextResponse.json({ contextPack });
  } catch (err: any) {
    console.error("Error in GET /api/projects/[id]/tasks/[taskId]/context:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load task context pack." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { id, taskId } = await params;
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

    const tasks: AigenstraTask[] = (archDoc?.storage as any)?.tasks || [];
    const task = tasks.find((t) => t.id === taskId);

    if (!task) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    // Load Software Blueprint
    const { data: spec } = await supabase
      .from("product_specs")
      .select("*")
      .eq("project_id", id)
      .maybeSingle();

    let softwareBlueprint: SoftwareBlueprint;
    if (spec && spec.problem_statement && spec.problem_statement.startsWith("{")) {
      softwareBlueprint = JSON.parse(spec.problem_statement);
    } else {
      const { data: project } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      softwareBlueprint = await generateSoftwareBlueprint(
        id,
        project?.name || "Project",
        project?.product_type || "SaaS",
        project?.raw_idea || project?.description || ""
      );
    }

    const engineeringBlueprint: EngineeringBlueprint | null = archDoc?.frontend as any || null;

    // Check for active repository context
    let repoContext = null;
    try {
      const { snapshot, files, symbols, chunks, overrides } = await getActiveSnapshot(id);
      if (snapshot) {
        repoContext = retrieveTaskRepositoryContext(task, snapshot, files, symbols, chunks, overrides);
      }
    } catch (repoErr) {
      console.warn("Could not retrieve repository context:", repoErr);
    }

    const newContextPack = await generateTaskContextPack(task, softwareBlueprint, engineeringBlueprint, repoContext);
    if (repoContext) {
      newContextPack.repository = repoContext;
      newContextPack.snapshotId = repoContext.snapshotId;
    }

    const contextPacks: Record<string, ContextPack> = (archDoc?.integrations as any)?.context_packs || {};
    contextPacks[taskId] = newContextPack;

    // Advance task readiness to READY_FOR_PROMPT
    const taskIdx = tasks.findIndex((t) => t.id === taskId);
    if (taskIdx !== -1) {
      tasks[taskIdx].readiness = "READY_FOR_PROMPT";
    }

    if (archDoc) {
      await supabase
        .from("architecture_docs")
        .update({
          integrations: { ...(archDoc.integrations as any || {}), context_packs: contextPacks } as any,
          storage: { ...(archDoc.storage as any || {}), tasks },
          updated_at: new Date().toISOString(),
        })
        .eq("id", archDoc.id);
    }

    return NextResponse.json({
      contextPack: newContextPack,
      task: tasks[taskIdx],
      message: "Context Pack generated and locked for task.",
    });
  } catch (err: any) {
    console.error("Error in POST /api/projects/[id]/tasks/[taskId]/context:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate context pack." },
      { status: 500 }
    );
  }
}
