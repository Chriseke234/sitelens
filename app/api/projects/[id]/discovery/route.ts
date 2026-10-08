import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAdaptiveDiscoveryQuestions } from "@/lib/ai/product-intelligence";
import {
  synthesizeIdeaUnderstanding,
  checkDiscoverySufficiency,
  generateProductSummary,
} from "@/lib/ai/product-understanding";
import { ProductAssumption } from "@/types";

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

    // Fetch existing QnA
    let { data: qnaList } = await supabase
      .from("discovery_qna")
      .select("*")
      .eq("project_id", id)
      .order("step_order", { ascending: true });

    // If no questions yet, generate initial prioritized set
    if (!qnaList || qnaList.length === 0) {
      const questions = await generateAdaptiveDiscoveryQuestions(
        project.name,
        project.raw_idea || project.description,
        []
      );

      const newItems = questions.map((q, idx) => ({
        project_id: id,
        question: q.question,
        category: q.priority,
        step_order: idx + 1,
      }));

      const { data: inserted } = await supabase
        .from("discovery_qna")
        .insert(newItems)
        .select();

      qnaList = inserted || [];
    }

    // Fetch decisions / provisional assumptions
    const { data: decisions } = await supabase
      .from("agent_decisions")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false });

    const assumptions: ProductAssumption[] = (decisions || []).map((d) => ({
      id: d.id,
      statement: d.decision,
      reason: d.reason || "Determined during product discovery",
      source: d.status === "provisional" ? "ai_recommendation" : "user_input",
      status: (d.status === "provisional" ? "PROVISIONAL" : "CONFIRMED") as ProductAssumption["status"],
      confidence: "CONFIRMED",
      relatedArea: d.topic,
    }));

    const sufficiency = checkDiscoverySufficiency(qnaList || []);

    return NextResponse.json({
      project,
      qnaList: qnaList || [],
      sufficiency,
      assumptions,
    });
  } catch (err) {
    console.error("Discovery GET error:", err);
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

    const body = await request.json().catch(() => ({}));
    const { qnaId, answer, action, assumption, statement, reason } = body;

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

    // Update answer if provided
    if (qnaId && typeof answer === "string") {
      await supabase
        .from("discovery_qna")
        .update({ answer: answer.trim() })
        .eq("id", qnaId)
        .eq("project_id", id);
    }

    // If user selected "I don't know", record assumption in decisions
    if (action === "apply_default_assumption" && assumption) {
      await supabase.from("agent_decisions").insert({
        project_id: id,
        decision_number: Date.now() % 100000,
        topic: `Provisional Assumption: ${assumption.slice(0, 60)}...`,
        problem: "User selected 'I don't know' during discovery.",
        decision: statement || assumption,
        reason: reason || "Applied sensible beginner default to prevent workflow blockage. Can be changed at any time.",
        status: "provisional",
      });
    }

    // If user confirmed summary and requested to advance stage to planning
    if (action === "advance_to_planning") {
      await supabase
        .from("projects")
        .update({ stage: "planning" })
        .eq("id", id);

      // Generate and save initial product summary/spec if not present
      const { data: existingQna } = await supabase
        .from("discovery_qna")
        .select("*")
        .eq("project_id", id)
        .order("step_order", { ascending: true });

      const summary = await generateProductSummary(
        project.name,
        project.raw_idea || project.description,
        existingQna || []
      );

      // Upsert into product_specs
      const { data: existingSpec } = await supabase
        .from("product_specs")
        .select("id")
        .eq("project_id", id)
        .limit(1);

      if (!existingSpec || existingSpec.length === 0) {
        await supabase.from("product_specs").insert({
          project_id: id,
          problem_statement: summary.whatBuilding,
          target_users: summary.whoFor,
          goals: [summary.mainExperience],
          functional_reqs: summary.coreCapabilities,
          mvp_scope: summary.coreCapabilities,
        });
      }

      return NextResponse.json({ success: true, stage: "planning", summary });
    }

    // If requested to generate summary on-demand
    if (action === "generate_summary") {
      const { data: existingQna } = await supabase
        .from("discovery_qna")
        .select("*")
        .eq("project_id", id)
        .order("step_order", { ascending: true });

      const summary = await generateProductSummary(
        project.name,
        project.raw_idea || project.description,
        existingQna || []
      );

      return NextResponse.json({ summary });
    }

    // If requested to generate dynamic follow-up questions
    if (action === "generate_more") {
      const { data: existingQna } = await supabase
        .from("discovery_qna")
        .select("*")
        .eq("project_id", id)
        .order("step_order", { ascending: true });

      const adaptiveQuestions = await generateAdaptiveDiscoveryQuestions(
        project.name,
        project.description,
        (existingQna || []).map((q) => ({ question: q.question, answer: q.answer }))
      );

      const startOrder = (existingQna?.length || 0) + 1;
      const newItems = adaptiveQuestions.map((q, idx) => ({
        project_id: id,
        question: q.question,
        category: q.priority,
        step_order: startOrder + idx,
      }));

      await supabase.from("discovery_qna").insert(newItems);
    }

    const { data: updatedList } = await supabase
      .from("discovery_qna")
      .select("*")
      .eq("project_id", id)
      .order("step_order", { ascending: true });

    const sufficiency = checkDiscoverySufficiency(updatedList || []);

    return NextResponse.json({
      qnaList: updatedList || [],
      sufficiency,
    });
  } catch (err) {
    console.error("Discovery POST error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}
