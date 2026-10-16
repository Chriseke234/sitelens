import React from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UnifiedStudioView } from "@/components/projects/unified-studio-view";
import { checkDiscoverySufficiency } from "@/lib/ai/product-understanding";
import { Project, AigenstraTask, SoftwareBlueprint } from "@/types";

export const metadata = {
  title: "AI Product Studio | Aigenstra",
  description:
    "Two-process real-time AI Product Studio: 1. Idea & Architecture, 2. Agent Prompts & Wireframe.",
};

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: projectData, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !projectData) {
    notFound();
  }

  const project = projectData as Project;

  // Check discovery sufficiency before exposing any tasks or blueprint
  const [qnaRes, archRes, specRes] = await Promise.all([
    supabase
      .from("discovery_qna")
      .select("*")
      .eq("project_id", id)
      .order("step_order", { ascending: true }),
    supabase
      .from("architecture_docs")
      .select("storage")
      .eq("project_id", id)
      .maybeSingle(),
    supabase
      .from("product_specs")
      .select("problem_statement")
      .eq("project_id", id)
      .maybeSingle(),
  ]);

  const qnas = qnaRes.data || [];
  const sufficiency = checkDiscoverySufficiency(qnas);

  const storedTasks = sufficiency.isSufficient
    ? ((archRes.data?.storage as any)?.tasks as AigenstraTask[] | undefined) || []
    : [];

  let storedBlueprint: SoftwareBlueprint | null = null;
  if (
    sufficiency.isSufficient &&
    specRes.data?.problem_statement &&
    specRes.data.problem_statement.startsWith("{")
  ) {
    try {
      storedBlueprint = JSON.parse(specRes.data.problem_statement);
    } catch {
      storedBlueprint = null;
    }
  }

  return (
    <UnifiedStudioView
      project={project}
      initialTasks={storedTasks}
      initialBlueprint={storedBlueprint}
      initialIsDiscoveryComplete={sufficiency.isSufficient}
    />
  );
}
