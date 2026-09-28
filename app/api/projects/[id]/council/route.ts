import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runAgentCouncilDiscussion } from "@/lib/ai/agent-council";

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

    const { data: discussions } = await supabase
      .from("agent_discussions")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ discussions: discussions || [] });
  } catch (err) {
    console.error("Council GET error:", err);
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
    const topic = body?.topic || "Guest checkout authentication & data ownership model";

    const councilResult = await runAgentCouncilDiscussion(
      project.name,
      project.description,
      topic
    );

    // Save discussion
    const { data: discussionRecord } = await supabase
      .from("agent_discussions")
      .insert({
        project_id: id,
        topic: councilResult.topic,
        status: "resolved",
        agent_messages: councilResult.agentMessages,
      })
      .select("*")
      .single();

    // Fetch highest existing decision_number
    const { data: existingDecisions } = await supabase
      .from("agent_decisions")
      .select("decision_number")
      .eq("project_id", id)
      .order("decision_number", { ascending: false })
      .limit(1);

    const nextDecNum = (existingDecisions?.[0]?.decision_number || 0) + 1;

    // Save decision log entry
    const { data: decisionRecord } = await supabase
      .from("agent_decisions")
      .insert({
        project_id: id,
        discussion_id: discussionRecord?.id || null,
        decision_number: nextDecNum,
        topic: councilResult.decision.topic,
        problem: councilResult.decision.problem,
        decision: councilResult.decision.decision,
        reason: councilResult.decision.reason,
        agent_contributions: councilResult.decision.agentContributions,
        alternatives_considered: councilResult.decision.alternativesConsidered,
        impacted_areas: councilResult.decision.impactedAreas,
        status: councilResult.decision.status,
      })
      .select("*")
      .single();

    return NextResponse.json({
      discussion: discussionRecord,
      decision: decisionRecord,
    });
  } catch (err) {
    console.error("Council POST error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}
