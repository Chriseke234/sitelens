import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loadLatestAuditSnapshot } from "@/lib/audit/store";
import { getActiveSnapshot } from "@/lib/repository/store";
import { buildFixPromptForFinding } from "@/lib/audit/fix-prompt";
import { CodingAgentProfile, SoftwareBlueprint, EngineeringBlueprint } from "@/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; findingId: string }> }
) {
  try {
    const { id, findingId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const targetAgent: CodingAgentProfile = body?.targetAgent || "google_antigravity";

    // 1. Find finding
    const audit = await loadLatestAuditSnapshot(id);
    const finding = audit?.findings.find((f) => f.id === findingId || f.findingCode === findingId);

    if (!finding) {
      return NextResponse.json({ error: "Audit finding not found." }, { status: 404 });
    }

    // 2. Load repo snapshot & blueprints
    const { snapshot } = await getActiveSnapshot(id);

    const { data: spec } = await supabase
      .from("product_specs")
      .select("problem_statement")
      .eq("project_id", id)
      .maybeSingle();

    let blueprint: SoftwareBlueprint | null = null;
    if (spec?.problem_statement?.startsWith("{")) {
      try {
        blueprint = JSON.parse(spec.problem_statement);
      } catch {}
    }

    const { data: archDoc } = await supabase
      .from("architecture_docs")
      .select("frontend")
      .eq("project_id", id)
      .maybeSingle();

    const engineeringBlueprint = archDoc?.frontend as EngineeringBlueprint | null;

    // 3. Build targeted prompt
    const { promptText, fixTask } = buildFixPromptForFinding({
      projectId: id,
      finding,
      targetAgent,
      blueprint,
      engineeringBlueprint,
      snapshot,
    });

    return NextResponse.json({ promptText, fixTask });
  } catch (err) {
    console.error("Fix prompt compilation error:", err);
    return NextResponse.json({ error: "Failed to compile fix prompt." }, { status: 500 });
  }
}
