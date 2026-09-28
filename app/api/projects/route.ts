import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to view project workspaces." },
        { status: 401 }
      );
    }

    const { data: projects, error } = await supabase
      .from("projects")
      .select("*, project_stages(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
      return NextResponse.json({ error: "Failed to fetch projects." }, { status: 500 });
    }

    return NextResponse.json({ projects: projects || [] });
  } catch (err) {
    console.error("Projects GET API Error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to create a project workspace." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      name,
      description,
      product_type,
      target_audience,
      problem_statement,
      raw_idea,
      stage,
      coding_environment,
      tech_stack,
      goal,
      mode,
      repo_url,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Project name is required." }, { status: 400 });
    }

    if (!description || typeof description !== "string" || !description.trim()) {
      return NextResponse.json({ error: "Project description is required." }, { status: 400 });
    }

    const validStages = ["idea", "researching", "planning", "designing", "building", "almost_finished", "launched"];
    const validEnvironments = ["Antigravity", "Cursor", "Claude Code", "Replit", "Lovable", "v0", "Other"];
    const validModes = ["build", "audit"];

    const selectedStage = validStages.includes(stage) ? stage : "idea";
    const selectedEnvironment = validEnvironments.includes(coding_environment) ? coding_environment : "Cursor";
    const selectedMode = validModes.includes(mode) ? mode : "build";

    const { data: newProject, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description.trim(),
        product_type: product_type || "SaaS",
        target_audience: target_audience ? String(target_audience).trim() : null,
        problem_statement: problem_statement ? String(problem_statement).trim() : null,
        raw_idea: raw_idea ? String(raw_idea).trim() : null,
        stage: selectedStage,
        coding_environment: selectedEnvironment,
        tech_stack: tech_stack ? String(tech_stack).trim() : null,
        goal: (goal || description).trim(),
        mode: selectedMode,
        repo_url: repo_url ? String(repo_url).trim() : null,
      })
      .select("*")
      .single();

    if (error || !newProject) {
      console.error("Error creating project:", error);
      return NextResponse.json({ error: "Failed to create project workspace." }, { status: 500 });
    }

    // Initialize initial project stages for progress calculation
    const initialStages = [
      { project_id: newProject.id, stage_name: "discovery", status: "in_progress", progress_pct: 20 },
      { project_id: newProject.id, stage_name: "research", status: "not_started", progress_pct: 0 },
      { project_id: newProject.id, stage_name: "user_journey", status: "not_started", progress_pct: 0 },
      { project_id: newProject.id, stage_name: "requirements", status: "not_started", progress_pct: 0 },
      { project_id: newProject.id, stage_name: "architecture", status: "not_started", progress_pct: 0 },
      { project_id: newProject.id, stage_name: "security", status: "not_started", progress_pct: 0 },
      { project_id: newProject.id, stage_name: "agent_council", status: "not_started", progress_pct: 0 },
      { project_id: newProject.id, stage_name: "prompts", status: "not_started", progress_pct: 0 },
      { project_id: newProject.id, stage_name: "audit", status: "not_started", progress_pct: 0 },
    ];

    await supabase.from("project_stages").insert(initialStages);

    // Initialize initial discovery Q&A questions for the project workspace
    const initialQuestions = [
      { project_id: newProject.id, question: `Who is the primary customer for ${newProject.name}?`, step_order: 1 },
      { project_id: newProject.id, question: "What current pain point makes their workflow or experience difficult?", step_order: 2 },
      { project_id: newProject.id, question: "How do existing alternative solutions fail to solve this problem?", step_order: 3 },
      { project_id: newProject.id, question: "What key action must a user complete to get value from your app?", step_order: 4 },
      { project_id: newProject.id, question: "What is your main business goal or success metric for this launch?", step_order: 5 },
    ];

    await supabase.from("discovery_qna").insert(initialQuestions);

    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (err) {
    console.error("Projects POST API Error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}
