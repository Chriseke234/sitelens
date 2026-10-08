import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSoftwareBlueprint } from "@/lib/ai/blueprint-engine";
import { evaluateBlueprintHealth } from "@/lib/ai/blueprint-health";
import { SoftwareBlueprint } from "@/types";

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

    // 2. Fetch existing discovery QnAs
    const { data: qnas } = await supabase
      .from("discovery_qna")
      .select("*")
      .eq("project_id", id)
      .order("step_order", { ascending: true });

    // 3. Fetch existing product_specs to see if blueprint was already saved
    const { data: existingSpec } = await supabase
      .from("product_specs")
      .select("*")
      .eq("project_id", id)
      .maybeSingle();

    let blueprint: SoftwareBlueprint;

    if (existingSpec && existingSpec.problem_statement && existingSpec.problem_statement.startsWith("{")) {
      try {
        blueprint = JSON.parse(existingSpec.problem_statement) as SoftwareBlueprint;
        const health = evaluateBlueprintHealth(blueprint);
        blueprint.healthScore = health.score;
        blueprint.healthWarnings = health.issues.map((i) => i.message);
      } catch {
        blueprint = await generateSoftwareBlueprint(
          id,
          project.name,
          project.product_type || "SaaS",
          project.raw_idea || project.description,
          null,
          qnas || []
        );
      }
    } else {
      blueprint = await generateSoftwareBlueprint(
        id,
        project.name,
        project.product_type || "SaaS",
        project.raw_idea || project.description,
        null,
        qnas || []
      );

      // Save initial blueprint to product_specs
      if (existingSpec) {
        await supabase
          .from("product_specs")
          .update({
            problem_statement: JSON.stringify(blueprint),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSpec.id);
      } else {
        await supabase.from("product_specs").insert({
          project_id: id,
          problem_statement: JSON.stringify(blueprint),
          target_users: blueprint.overview.targetOutcome ? [blueprint.overview.targetOutcome] : [],
        });
      }
    }

    const healthReport = evaluateBlueprintHealth(blueprint);

    return NextResponse.json({
      blueprint,
      healthReport,
    });
  } catch (err: any) {
    console.error("Error in GET /api/projects/[id]/blueprint:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load software blueprint." },
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

    const body = await request.json();
    const { action, blueprint, itemUpdate } = body;

    // Fetch project
    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project workspace not found." }, { status: 404 });
    }

    // Action: Regenerate Blueprint
    if (action === "regenerate") {
      const { data: qnas } = await supabase
        .from("discovery_qna")
        .select("*")
        .eq("project_id", id)
        .order("step_order", { ascending: true });

      const newBlueprint = await generateSoftwareBlueprint(
        id,
        project.name,
        project.product_type || "SaaS",
        project.raw_idea || project.description,
        null,
        qnas || []
      );

      const health = evaluateBlueprintHealth(newBlueprint);
      newBlueprint.healthScore = health.score;
      newBlueprint.healthWarnings = health.issues.map((i) => i.message);

      // Save to Supabase
      const { data: existingSpec } = await supabase
        .from("product_specs")
        .select("id")
        .eq("project_id", id)
        .maybeSingle();

      if (existingSpec) {
        await supabase
          .from("product_specs")
          .update({
            problem_statement: JSON.stringify(newBlueprint),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSpec.id);
      } else {
        await supabase.from("product_specs").insert({
          project_id: id,
          problem_statement: JSON.stringify(newBlueprint),
        });
      }

      return NextResponse.json({
        blueprint: newBlueprint,
        healthReport: health,
        message: "Blueprint regenerated successfully.",
      });
    }

    // Action: Full Blueprint Update or Single Item Status Update
    let updatedBlueprint: SoftwareBlueprint = blueprint;

    if (!updatedBlueprint) {
      // Load current blueprint from DB
      const { data: existingSpec } = await supabase
        .from("product_specs")
        .select("*")
        .eq("project_id", id)
        .single();

      if (existingSpec && existingSpec.problem_statement) {
        updatedBlueprint = JSON.parse(existingSpec.problem_statement);
      }
    }

    if (!updatedBlueprint) {
      return NextResponse.json({ error: "No blueprint found to update." }, { status: 400 });
    }

    if (itemUpdate) {
      const { section, itemId, status, newValues } = itemUpdate;
      // Handle item update in specific section
      const sectionKey = section as keyof SoftwareBlueprint;
      if (Array.isArray(updatedBlueprint[sectionKey])) {
        const arr = updatedBlueprint[sectionKey] as any[];
        const idx = arr.findIndex((it: any) => it.id === itemId);
        if (idx !== -1) {
          arr[idx] = {
            ...arr[idx],
            ...(newValues || {}),
            status: status || arr[idx].status,
            source: "USER_CONFIRMED",
          };
        }
      } else if (sectionKey === "overview") {
        updatedBlueprint.overview = {
          ...updatedBlueprint.overview,
          ...(newValues || {}),
          status: status || updatedBlueprint.overview.status,
          source: "USER_CONFIRMED",
        };
      }
    }

    const health = evaluateBlueprintHealth(updatedBlueprint);
    updatedBlueprint.healthScore = health.score;
    updatedBlueprint.healthWarnings = health.issues.map((i) => i.message);
    updatedBlueprint.updated_at = new Date().toISOString();

    // Save to product_specs
    const { data: existingSpec } = await supabase
      .from("product_specs")
      .select("id")
      .eq("project_id", id)
      .maybeSingle();

    if (existingSpec) {
      await supabase
        .from("product_specs")
        .update({
          problem_statement: JSON.stringify(updatedBlueprint),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSpec.id);
    } else {
      await supabase.from("product_specs").insert({
        project_id: id,
        problem_statement: JSON.stringify(updatedBlueprint),
      });
    }

    return NextResponse.json({
      blueprint: updatedBlueprint,
      healthReport: health,
      message: "Blueprint updated successfully.",
    });
  } catch (err: any) {
    console.error("Error in POST /api/projects/[id]/blueprint:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update software blueprint." },
      { status: 500 }
    );
  }
}
