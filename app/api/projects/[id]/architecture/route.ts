import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEngineeringBlueprint } from "@/lib/ai/engineering-intelligence";
import { generateSoftwareBlueprint } from "@/lib/ai/blueprint-engine";
import { evaluateEngineeringReadiness } from "@/lib/ai/engineering-readiness";
import { EngineeringBlueprint, SoftwareBlueprint, TechnicalRecommendation } from "@/types";

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

    // 2. Fetch architecture_docs
    const { data: archDoc } = await supabase
      .from("architecture_docs")
      .select("*")
      .eq("project_id", id)
      .maybeSingle();

    let engineeringBlueprint: EngineeringBlueprint;

    if (archDoc && archDoc.frontend && (archDoc.frontend as any).domains) {
      engineeringBlueprint = archDoc.frontend as unknown as EngineeringBlueprint;
      engineeringBlueprint.readiness = evaluateEngineeringReadiness(
        engineeringBlueprint,
        engineeringBlueprint.recommendations || []
      );
    } else {
      // Load Software Blueprint first
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
            project.raw_idea || project.description
          );
        }
      } else {
        softwareBlueprint = await generateSoftwareBlueprint(
          id,
          project.name,
          project.product_type || "SaaS",
          project.raw_idea || project.description
        );
      }

      engineeringBlueprint = await generateEngineeringBlueprint(
        id,
        project.name,
        project.product_type || "SaaS",
        softwareBlueprint
      );

      // Save to architecture_docs (storing in frontend column)
      if (archDoc) {
        await supabase
          .from("architecture_docs")
          .update({
            frontend: engineeringBlueprint as any,
            updated_at: new Date().toISOString(),
          })
          .eq("id", archDoc.id);
      } else {
        await supabase.from("architecture_docs").insert({
          project_id: id,
          frontend: engineeringBlueprint as any,
        });
      }
    }

    return NextResponse.json({
      engineeringBlueprint,
      readiness: engineeringBlueprint.readiness,
    });
  } catch (err: any) {
    console.error("Error in GET /api/projects/[id]/architecture:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load technical architecture." },
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

    // Load Software Blueprint
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
          project.raw_idea || project.description
        );
      }
    } else {
      softwareBlueprint = await generateSoftwareBlueprint(
        id,
        project.name,
        project.product_type || "SaaS",
        project.raw_idea || project.description
      );
    }

    const newEngineeringBlueprint = await generateEngineeringBlueprint(
      id,
      project.name,
      project.product_type || "SaaS",
      softwareBlueprint
    );

    const { data: archDoc } = await supabase
      .from("architecture_docs")
      .select("id")
      .eq("project_id", id)
      .maybeSingle();

    if (archDoc) {
      await supabase
        .from("architecture_docs")
        .update({
          frontend: newEngineeringBlueprint as any,
          updated_at: new Date().toISOString(),
        })
        .eq("id", archDoc.id);
    } else {
      await supabase.from("architecture_docs").insert({
        project_id: id,
        frontend: newEngineeringBlueprint as any,
      });
    }

    return NextResponse.json({
      engineeringBlueprint: newEngineeringBlueprint,
      readiness: newEngineeringBlueprint.readiness,
      message: "Engineering intelligence re-synthesized successfully.",
    });
  } catch (err: any) {
    console.error("Error in POST /api/projects/[id]/architecture:", err);
    return NextResponse.json(
      { error: err.message || "Failed to re-synthesize technical architecture." },
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
    const { recommendationId, decision, selectedOption } = body as {
      recommendationId: string;
      decision: "USER_CONFIRMED" | "UNDECIDED" | "DEFERRED";
      selectedOption?: string;
    };

    const { data: archDoc } = await supabase
      .from("architecture_docs")
      .select("*")
      .eq("project_id", id)
      .maybeSingle();

    if (!archDoc || !(archDoc.frontend as any)?.domains) {
      return NextResponse.json({ error: "Engineering blueprint not found." }, { status: 404 });
    }

    const blueprint = archDoc.frontend as unknown as EngineeringBlueprint;
    const recIdx = blueprint.recommendations?.findIndex((r) => r.id === recommendationId);

    if (recIdx !== undefined && recIdx !== -1) {
      blueprint.recommendations[recIdx].status = decision;
      if (selectedOption) {
        blueprint.recommendations[recIdx].selectedOption = selectedOption;
      }
    }

    blueprint.readiness = evaluateEngineeringReadiness(blueprint, blueprint.recommendations || []);
    blueprint.updated_at = new Date().toISOString();

    await supabase
      .from("architecture_docs")
      .update({
        frontend: blueprint as any,
        updated_at: new Date().toISOString(),
      })
      .eq("id", archDoc.id);

    return NextResponse.json({
      engineeringBlueprint: blueprint,
      readiness: blueprint.readiness,
      message: "Decision recorded successfully.",
    });
  } catch (err: any) {
    console.error("Error in PATCH /api/projects/[id]/architecture:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update decision." },
      { status: 500 }
    );
  }
}
