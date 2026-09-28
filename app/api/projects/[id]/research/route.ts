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
      .eq("project_id", id);

    const doc = await generateResearchDocument(
      project.name,
      project.description,
      (qnaList || []).map((q) => ({ question: q.question, answer: q.answer }))
    );

    // Upsert into research_documents
    const { data: savedDoc, error } = await supabase
      .from("research_documents")
      .upsert(
        {
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
        },
        { onConflict: "project_id" }
      )
      .select("*")
      .single();

    if (error) {
      console.error("Research upsert error:", error);
      return NextResponse.json({ error: "Failed to save research document." }, { status: 500 });
    }

    return NextResponse.json({ researchDoc: savedDoc });
  } catch (err) {
    console.error("Research POST error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}
