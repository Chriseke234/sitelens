import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveSnapshot } from "@/lib/repository/store";
import { runProjectAuditPipeline } from "@/lib/audit/pipeline";
import { persistAuditSnapshot, loadLatestAuditSnapshot } from "@/lib/audit/store";
import { SoftwareBlueprint, EngineeringBlueprint, AuditScope } from "@/types";

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

    const audit = await loadLatestAuditSnapshot(id);

    return NextResponse.json({
      audit,
      findings: audit?.findings || [],
    });
  } catch (err) {
    console.error("Project Audit GET error:", err);
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
    const scope: AuditScope = body?.scope || "FULL";

    // 1. Load active repository snapshot & code artifacts
    const { snapshot, files, symbols, chunks } = await getActiveSnapshot(id);

    if (!snapshot) {
      return NextResponse.json(
        {
          error:
            "No connected repository snapshot found. Please connect your project folder or repository on the Project Intelligence page first.",
        },
        { status: 400 }
      );
    }

    // 2. Load Software Blueprint
    let blueprint: SoftwareBlueprint | null = null;
    const { data: spec } = await supabase
      .from("product_specs")
      .select("problem_statement")
      .eq("project_id", id)
      .maybeSingle();

    if (spec?.problem_statement && spec.problem_statement.startsWith("{")) {
      try {
        blueprint = JSON.parse(spec.problem_statement);
      } catch (err) {
        console.warn("Could not parse Software Blueprint:", err);
      }
    }

    // 3. Load Engineering Blueprint
    let engineeringBlueprint: EngineeringBlueprint | null = null;
    const { data: archDoc } = await supabase
      .from("architecture_docs")
      .select("frontend")
      .eq("project_id", id)
      .maybeSingle();

    if (archDoc?.frontend) {
      engineeringBlueprint = archDoc.frontend as EngineeringBlueprint;
    }

    // 4. Run Audit Pipeline (Deterministic First + Targeted Semantic)
    const audit = await runProjectAuditPipeline({
      projectId: id,
      scope,
      blueprint,
      engineeringBlueprint,
      snapshot,
      files,
      symbols,
      chunks,
    });

    // 5. Persist audit snapshot
    await persistAuditSnapshot(audit);

    return NextResponse.json({
      audit,
      findings: audit.findings,
      coverage: audit.coverage,
      summary: audit.summary,
    });
  } catch (err) {
    console.error("Run project audit error:", err);
    return NextResponse.json(
      { error: "Failed to run audit analysis." },
      { status: 500 }
    );
  }
}
