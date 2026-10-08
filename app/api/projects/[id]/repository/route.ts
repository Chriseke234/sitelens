import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveSnapshot, persistSnapshot } from "@/lib/repository/store";
import { runRepositoryAnalysisPipeline } from "@/lib/repository/pipeline";
import { ConnectionSourceType } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    // Verify project ownership
    const { data: project } = await supabase
      .from("projects")
      .select("id, name")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project workspace not found." }, { status: 404 });
    }

    const { snapshot, files } = await getActiveSnapshot(projectId);

    return NextResponse.json({
      snapshot,
      fileCount: files.length,
      isConfigured: Boolean(snapshot),
    });
  } catch (err: any) {
    console.error("GET /api/projects/[id]/repository error:", err);
    return NextResponse.json({ error: err.message || "Failed to load repository." }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    // Verify project ownership
    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project workspace not found." }, { status: 404 });
    }

    const body = await request.json();
    const sourceType: ConnectionSourceType = body.sourceType || "UPLOAD_FOLDER";
    const files = body.files || [];
    const packageJsonContent = body.packageJsonContent;

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: "No files supplied for repository analysis." }, { status: 400 });
    }

    // Fetch existing blueprints to perform drift analysis
    const [specRes, archRes] = await Promise.all([
      supabase.from("product_specs").select("*").eq("project_id", projectId).maybeSingle(),
      supabase.from("architecture_docs").select("*").eq("project_id", projectId).maybeSingle(),
    ]);

    let softwareBlueprint = null;
    if (specRes.data?.problem_statement?.startsWith("{")) {
      try {
        softwareBlueprint = JSON.parse(specRes.data.problem_statement);
      } catch {}
    }
    const engineeringBlueprint = (archRes.data?.frontend as any) || null;

    // Run static deterministic analysis
    const pipelineResult = runRepositoryAnalysisPipeline({
      projectId,
      projectName: project.name,
      sourceType,
      sourceReference: body.sourceReference || "Direct Browser Ingest",
      branch: body.branch,
      revision: body.revision,
      files,
      packageJsonContent,
      softwareBlueprint,
      engineeringBlueprint,
    });

    // Persist snapshot and records
    await persistSnapshot(
      pipelineResult.snapshot,
      pipelineResult.files,
      pipelineResult.symbols,
      pipelineResult.chunks
    );

    return NextResponse.json({
      success: true,
      snapshot: pipelineResult.snapshot,
      manifest: pipelineResult.snapshot.manifest,
      message: "Repository structure analyzed and locked successfully.",
    });
  } catch (err: any) {
    console.error("POST /api/projects/[id]/repository error:", err);
    return NextResponse.json({ error: err.message || "Failed to analyze repository." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project workspace not found." }, { status: 404 });
    }

    const { disconnectRepository } = await import("@/lib/repository/store");
    await disconnectRepository(projectId);

    return NextResponse.json({
      success: true,
      message: "Project disconnected. Repository synchronization and context disabled.",
    });
  } catch (err: any) {
    console.error("DELETE /api/projects/[id]/repository error:", err);
    return NextResponse.json({ error: err.message || "Failed to disconnect repository." }, { status: 500 });
  }
}

