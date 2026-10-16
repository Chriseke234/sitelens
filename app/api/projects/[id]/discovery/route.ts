import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generateAdaptiveDiscoveryQuestions,
  generateResearchDocument,
} from "@/lib/ai/product-intelligence";
import {
  checkDiscoverySufficiency,
  generateProductSummary,
} from "@/lib/ai/product-understanding";
import { DiscoveryQnA, ProductAssumption } from "@/types";

const LEGACY_FICTIONAL_QUESTIONS = [
  "will customers need accounts to log in and track their orders or saved items?",
  "will different types of people have different levels of access (e.g. customers vs staff vs admins)?",
  "will you accept online payments directly inside the application?",
  "do users need automated notifications (e.g. email or sms updates when status changes)?",
];

function isLegacyFictionalResearch(doc: any): boolean {
  if (!doc) return true;
  const serialized = JSON.stringify(doc);
  return (
    serialized.includes("Aigenstra Service Benchmarks") ||
    serialized.includes("Average user repeats orders twice per month") ||
    serialized.includes("Legacy Alternatives")
  );
}

function enrichQnaWithMeta(
  qnaList: DiscoveryQnA[],
  researchDoc: any
): DiscoveryQnA[] {
  const sources = Array.isArray(researchDoc?.sources) ? researchDoc.sources : [];
  const metaEntry = sources.find((s: any) => s?.title === "__QNA_META__");
  let metaMap: Record<
    string,
    {
      whyItMatters?: string;
      suggestedOptions?: string[];
      defaultRecommendation?: string;
    }
  > = {};

  if (metaEntry?.notes) {
    try {
      metaMap = JSON.parse(metaEntry.notes);
    } catch {
      metaMap = {};
    }
  }

  return qnaList.map((q) => {
    const meta = metaMap[String(q.step_order)] || metaMap[q.question] || {};
    return {
      ...q,
      why_it_matters: q.why_it_matters || meta.whyItMatters,
      suggested_options: q.suggested_options || meta.suggestedOptions,
      default_recommendation:
        q.default_recommendation || meta.defaultRecommendation,
    };
  });
}

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
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    // 1. Fetch project
    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: "Project workspace not found." },
        { status: 404 }
      );
    }

    // 2. STEP 1 — Run or Load Real-Time Product & Domain Research BEFORE Discovery Questions
    let { data: researchDoc } = await supabase
      .from("research_documents")
      .select("*")
      .eq("project_id", id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!researchDoc || isLegacyFictionalResearch(researchDoc)) {
      const generatedResearch = await generateResearchDocument(
        project.name,
        project.raw_idea || project.description,
        [],
        project.product_type || "SaaS",
        {
          targetAudience: project.target_audience,
          problemStatement: project.problem_statement,
          goal: project.goal,
          techStack: project.tech_stack,
        }
      );

      if (researchDoc?.id) {
        const { data: updatedDoc } = await supabase
          .from("research_documents")
          .update({
            market_context: generatedResearch.market_context,
            user_context: generatedResearch.user_context,
            competitor_analysis: generatedResearch.competitor_analysis,
            user_needs: generatedResearch.user_needs,
            risks: generatedResearch.risks,
            opportunities: generatedResearch.opportunities,
            assumptions: generatedResearch.assumptions,
            hypotheses: generatedResearch.hypotheses,
            sources: generatedResearch.sources,
            updated_at: new Date().toISOString(),
          })
          .eq("id", researchDoc.id)
          .select("*")
          .single();
        researchDoc = updatedDoc || generatedResearch;
      } else {
        const { data: insertedDoc } = await supabase
          .from("research_documents")
          .insert({
            project_id: id,
            market_context: generatedResearch.market_context,
            user_context: generatedResearch.user_context,
            competitor_analysis: generatedResearch.competitor_analysis,
            user_needs: generatedResearch.user_needs,
            risks: generatedResearch.risks,
            opportunities: generatedResearch.opportunities,
            assumptions: generatedResearch.assumptions,
            hypotheses: generatedResearch.hypotheses,
            sources: generatedResearch.sources,
            updated_at: new Date().toISOString(),
          })
          .select("*")
          .single();
        researchDoc = insertedDoc || generatedResearch;
      }
    }

    // 3. STEP 2 — Fetch or Synthesize Product-Tailored Discovery Questions Grounded in Research
    let { data: qnaList } = await supabase
      .from("discovery_qna")
      .select("*")
      .eq("project_id", id)
      .order("step_order", { ascending: true });

    const hasLegacyUnansweredQuestions =
      qnaList &&
      qnaList.length > 0 &&
      qnaList.every((q) => !q.answer || !q.answer.trim()) &&
      qnaList.some((q) =>
        LEGACY_FICTIONAL_QUESTIONS.includes(q.question.trim().toLowerCase())
      );

    if (hasLegacyUnansweredQuestions) {
      await supabase.from("discovery_qna").delete().eq("project_id", id);
      qnaList = [];
    }

    if (!qnaList || qnaList.length === 0) {
      const questions = await generateAdaptiveDiscoveryQuestions(
        project.name,
        project.raw_idea || project.description,
        [],
        project.product_type || "SaaS",
        researchDoc
      );

      const metaMap: Record<
        string,
        {
          whyItMatters?: string;
          suggestedOptions?: string[];
          defaultRecommendation?: string;
        }
      > = {};

      const newItems = questions.map((q, idx) => {
        const stepOrder = idx + 1;
        metaMap[String(stepOrder)] = {
          whyItMatters: q.whyItMatters,
          suggestedOptions: q.suggestedOptions,
          defaultRecommendation: q.defaultRecommendation,
        };
        metaMap[q.question] = metaMap[String(stepOrder)];
        return {
          project_id: id,
          question: q.question,
          category: q.priority,
          step_order: stepOrder,
        };
      });

      const { data: inserted } = await supabase
        .from("discovery_qna")
        .insert(newItems)
        .select();

      qnaList = inserted || [];

      // Persist question metadata inside research_documents.sources so options/rationale persist
      if (researchDoc?.id) {
        const cleanSources = (
          Array.isArray(researchDoc.sources) ? researchDoc.sources : []
        ).filter((s: any) => s?.title !== "__QNA_META__");
        const updatedSources = [
          ...cleanSources,
          { title: "__QNA_META__", notes: JSON.stringify(metaMap) },
        ];
        const { data: updatedDoc } = await supabase
          .from("research_documents")
          .update({ sources: updatedSources })
          .eq("id", researchDoc.id)
          .select("*")
          .single();
        if (updatedDoc) {
          researchDoc = updatedDoc;
        }
      }
    }

    const enrichedQnaList = enrichQnaWithMeta(
      (qnaList || []) as DiscoveryQnA[],
      researchDoc
    );

    // 4. Fetch decisions / assumptions
    const { data: decisions } = await supabase
      .from("agent_decisions")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false });

    const assumptions: ProductAssumption[] = (decisions || []).map((d) => ({
      id: d.id,
      statement: d.decision,
      reason: d.reason || "Confirmed during product discovery",
      source: d.status === "provisional" ? "ai_recommendation" : "user_input",
      status: (d.status === "provisional"
        ? "PROVISIONAL"
        : "CONFIRMED") as ProductAssumption["status"],
      confidence: "CONFIRMED",
      relatedArea: d.topic,
    }));

    const sufficiency = checkDiscoverySufficiency(enrichedQnaList);
    const visibleResearchSources = (
      Array.isArray(researchDoc?.sources) ? researchDoc.sources : []
    ).filter((s: any) => s?.title !== "__QNA_META__");

    return NextResponse.json({
      project,
      researchDoc: researchDoc
        ? { ...researchDoc, sources: visibleResearchSources }
        : null,
      qnaList: enrichedQnaList,
      sufficiency,
      isDiscoveryComplete: sufficiency.isSufficient,
      assumptions,
    });
  } catch (err: any) {
    console.error("Discovery GET error:", err);
    return NextResponse.json(
      {
        error:
          err.message ||
          "Failed to run real-time research and discovery questions.",
      },
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
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
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
      return NextResponse.json(
        { error: "Project workspace not found." },
        { status: 404 }
      );
    }

    const { data: researchDoc } = await supabase
      .from("research_documents")
      .select("*")
      .eq("project_id", id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Update answer if provided
    if (qnaId && typeof answer === "string") {
      await supabase
        .from("discovery_qna")
        .update({ answer: answer.trim() })
        .eq("id", qnaId)
        .eq("project_id", id);
    }

    // If user selected recommended default assumption, record in agent_decisions
    if (action === "apply_default_assumption" && assumption) {
      await supabase.from("agent_decisions").insert({
        project_id: id,
        decision_number: Date.now() % 100000,
        topic: `Architectural Decision: ${assumption.slice(0, 60)}`,
        problem: "User selected research-backed architectural recommendation.",
        decision: statement || assumption,
        reason:
          reason ||
          "Research-backed recommendation selected during Idea & Architecture discovery.",
        status: "accepted",
      });
    }

    // If user confirmed summary and requested to advance stage to planning
    if (action === "advance_to_planning") {
      await supabase
        .from("projects")
        .update({ stage: "planning" })
        .eq("id", id);

      const { data: existingQna } = await supabase
        .from("discovery_qna")
        .select("*")
        .eq("project_id", id)
        .order("step_order", { ascending: true });

      const summary = await generateProductSummary(
        project.name,
        project.raw_idea || project.description,
        existingQna || [],
        [],
        project.product_type || "SaaS"
      );

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

      return NextResponse.json({
        success: true,
        stage: "planning",
        summary,
      });
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
        existingQna || [],
        [],
        project.product_type || "SaaS"
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
        project.raw_idea || project.description,
        (existingQna || []).map((q) => ({
          question: q.question,
          answer: q.answer,
        })),
        project.product_type || "SaaS",
        researchDoc
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

    const enrichedUpdatedList = enrichQnaWithMeta(
      (updatedList || []) as DiscoveryQnA[],
      researchDoc
    );
    const sufficiency = checkDiscoverySufficiency(enrichedUpdatedList);

    return NextResponse.json({
      qnaList: enrichedUpdatedList,
      sufficiency,
      isDiscoveryComplete: sufficiency.isSufficient,
    });
  } catch (err: any) {
    console.error("Discovery POST error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
