import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSecurityPlan } from "@/lib/ai/design-architecture";

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

    const { data: secPlan } = await supabase
      .from("security_plans")
      .select("*")
      .eq("project_id", id)
      .maybeSingle();

    return NextResponse.json({ secPlan });
  } catch (err) {
    console.error("Security Plan GET error:", err);
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

    const plan = await generateSecurityPlan(project.name, project.description);

    const { data: savedPlan, error } = await supabase
      .from("security_plans")
      .upsert(
        {
          project_id: id,
          authentication_rules: plan.authentication_rules,
          authorization_rules: plan.authorization_rules,
          database_security: plan.database_security,
          api_security: plan.api_security,
          input_validation: plan.input_validation,
          secret_management: plan.secret_management,
          threat_model: plan.threat_model,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "project_id" }
      )
      .select("*")
      .single();

    if (error) {
      console.error("Security plan upsert error:", error);
      return NextResponse.json({ error: "Failed to save security plan." }, { status: 500 });
    }

    return NextResponse.json({ secPlan: savedPlan });
  } catch (err) {
    console.error("Security Plan POST error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}
