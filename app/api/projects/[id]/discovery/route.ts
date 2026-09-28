import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateDiscoveryQuestions } from "@/lib/ai/product-intelligence";

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

    const { data: qnaList } = await supabase
      .from("discovery_qna")
      .select("*")
      .eq("project_id", id)
      .order("step_order", { ascending: true });

    return NextResponse.json({ qnaList: qnaList || [] });
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
    const { qnaId, answer, action } = body;

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

    // If requested to generate dynamic follow-up questions
    if (action === "generate_more") {
      const { data: existingQna } = await supabase
        .from("discovery_qna")
        .select("*")
        .eq("project_id", id)
        .order("step_order", { ascending: true });

      const questions = await generateDiscoveryQuestions(
        project.name,
        project.description,
        (existingQna || []).map((q) => ({ question: q.question, answer: q.answer }))
      );

      const startOrder = (existingQna?.length || 0) + 1;
      const newItems = questions.map((qText, idx) => ({
        project_id: id,
        question: qText,
        step_order: startOrder + idx,
      }));

      await supabase.from("discovery_qna").insert(newItems);
    }

    const { data: updatedList } = await supabase
      .from("discovery_qna")
      .select("*")
      .eq("project_id", id)
      .order("step_order", { ascending: true });

    return NextResponse.json({ qnaList: updatedList || [] });
  } catch (err) {
    console.error("Discovery POST error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}
