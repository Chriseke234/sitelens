import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateResearchDocument } from "@/lib/ai/product-intelligence";

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

    const { data: researchDoc } = await supabase
      .from("research_documents")
      .select("*")
      .eq("project_id", id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({ researchDoc });
  } catch (err) {
    console.error("Research GET error:", err);
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

    const { data: qnaList } = await supabase
      .from("discovery_qna")
      .select("*")
      .eq("project_id", id)
      .order("step_order", { ascending: true });

    const doc = await generateResearchDocument(
      project.name,
      project.raw_idea || project.description,
      (qnaList || []).map((q) => ({ question: q.question, answer: q.answer })),
      project.product_type || "SaaS",
      {
        targetAudience: project.target_audience,
        problemStatement: project.problem_statement,
        goal: project.goal,
        techStack: project.tech_stack,
      }
    );

    const { data: existingDoc } = await supabase
      .from("research_documents")
      .select("id")
      .eq("project_id", id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let savedDoc = null;
    if (existingDoc) {
      const { data, error } = await supabase
        .from("research_documents")
        .update({
          market_context: doc.market_context,
          user_context: doc.user_context,
          competitor_analysis: doc.competitor_analysis,
          user_needs: doc.user_needs,
          risks: doc.risks,
          opportunities: doc.opportunities,
          assumptions: doc.assumptions,
          hypotheses: doc.hypotheses,
          sources: doc.sources,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingDoc.id)
        .select("*")
        .single();
      if (error) throw error;
      savedDoc = data;
    } else {
      const { data, error } = await supabase
        .from("research_documents")
        .insert({
          project_id: id,
          market_context: doc.market_context,
          user_context: doc.user_context,
          competitor_analysis: doc.competitor_analysis,
          user_needs: doc.user_needs,
          risks: doc.risks,
          opportunities: doc.opportunities,
          assumptions: doc.assumptions,
          hypotheses: doc.hypotheses,
          sources: doc.sources,
          updated_at: new Date().toISOString(),
        })
        .select("*")
        .single();
      if (error) throw error;
      savedDoc = data;
    }

    return NextResponse.json({ researchDoc: savedDoc });
  } catch (err: any) {
    console.error("Research POST error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to synthesize real-time product research." },
      { status: 500 }
    );
  }
}
