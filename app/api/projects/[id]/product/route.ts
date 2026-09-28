import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateProductSpecDocument } from "@/lib/ai/product-intelligence";

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

    const { data: specDoc } = await supabase
      .from("product_specs")
      .select("*")
      .eq("project_id", id)
      .maybeSingle();

    return NextResponse.json({ specDoc });
  } catch (err) {
    console.error("Product Spec GET error:", err);
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

    const doc = await generateProductSpecDocument(project.name, project.description);

    const { data: savedDoc, error } = await supabase
      .from("product_specs")
      .upsert(
        {
          project_id: id,
          problem_statement: doc.problem_statement,
          target_users: doc.target_users,
          goals: doc.goals,
          non_goals: doc.non_goals,
          user_stories: doc.user_stories,
          functional_reqs: doc.functional_reqs,
          non_functional_reqs: doc.non_functional_reqs,
          business_rules: doc.business_rules,
          acceptance_criteria: doc.acceptance_criteria,
          edge_cases: doc.edge_cases,
          mvp_scope: doc.mvp_scope,
          future_scope: doc.future_scope,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "project_id" }
      )
      .select("*")
      .single();

    if (error) {
      console.error("Product Spec upsert error:", error);
      return NextResponse.json({ error: "Failed to save product spec document." }, { status: 500 });
    }

    return NextResponse.json({ specDoc: savedDoc });
  } catch (err) {
    console.error("Product Spec POST error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}
