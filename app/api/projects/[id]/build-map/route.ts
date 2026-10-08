import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateBuildMap } from "@/lib/ai/build-map-engine";
import { generateSoftwareBlueprint } from "@/lib/ai/blueprint-engine";
import { BuildMap, BuildStageStatus, SoftwareBlueprint } from "@/types";

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

    // 2. Fetch architecture_docs to see if build map exists
    const { data: archDoc } = await supabase
      .from("architecture_docs")
      .select("*")
      .eq("project_id", id)
      .maybeSingle();

    let buildMap: BuildMap;

    if (archDoc && archDoc.backend && (archDoc.backend as any).stages) {
      buildMap = archDoc.backend as unknown as BuildMap;
    } else {
      // Load blueprint to generate build map
      let blueprint: SoftwareBlueprint;
      const { data: spec } = await supabase
        .from("product_specs")
        .select("*")
        .eq("project_id", id)
        .maybeSingle();

      if (spec && spec.problem_statement && spec.problem_statement.startsWith("{")) {
        try {
          blueprint = JSON.parse(spec.problem_statement);
        } catch {
          blueprint = await generateSoftwareBlueprint(
            id,
            project.name,
            project.product_type || "SaaS",
            project.raw_idea || project.description
          );
        }
      } else {
        blueprint = await generateSoftwareBlueprint(
          id,
          project.name,
          project.product_type || "SaaS",
          project.raw_idea || project.description
        );
      }

      buildMap = await generateBuildMap(id, blueprint);

      // Save build map
      if (archDoc) {
        await supabase
          .from("architecture_docs")
          .update({
            backend: buildMap as any,
            updated_at: new Date().toISOString(),
          })
          .eq("id", archDoc.id);
      } else {
        await supabase.from("architecture_docs").insert({
          project_id: id,
          backend: buildMap as any,
        });
      }
    }

    return NextResponse.json({ buildMap });
  } catch (err: any) {
    console.error("Error in GET /api/projects/[id]/build-map:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load build map." },
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
    const { stageId, status } = body as { stageId: string; status: BuildStageStatus };

    // Fetch existing architecture_docs
    const { data: archDoc } = await supabase
      .from("architecture_docs")
      .select("*")
      .eq("project_id", id)
      .maybeSingle();

    if (!archDoc || !(archDoc.backend as any)?.stages) {
      return NextResponse.json({ error: "Build map not found." }, { status: 404 });
    }

    const buildMap = archDoc.backend as unknown as BuildMap;
    const stageIdx = buildMap.stages.findIndex((s) => s.id === stageId);

    if (stageIdx === -1) {
      return NextResponse.json({ error: "Stage not found." }, { status: 404 });
    }

    buildMap.stages[stageIdx].status = status;
    buildMap.completedStages = buildMap.stages.filter((s) => s.status === "COMPLETED").length;
    buildMap.updated_at = new Date().toISOString();

    // Auto-advance next stage to READY if previous is COMPLETED
    if (status === "COMPLETED" && stageIdx + 1 < buildMap.stages.length) {
      if (buildMap.stages[stageIdx + 1].status === "NOT_STARTED") {
        buildMap.stages[stageIdx + 1].status = "READY";
      }
      buildMap.currentStageNumber = Math.max(buildMap.currentStageNumber, stageIdx + 2);
    }

    await supabase
      .from("architecture_docs")
      .update({
        backend: buildMap as any,
        updated_at: new Date().toISOString(),
      })
      .eq("id", archDoc.id);

    return NextResponse.json({
      buildMap,
      message: "Stage updated successfully.",
    });
  } catch (err: any) {
    console.error("Error in PATCH /api/projects/[id]/build-map:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update build stage." },
      { status: 500 }
    );
  }
}
