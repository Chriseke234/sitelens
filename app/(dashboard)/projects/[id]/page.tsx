import React from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UnifiedStudioView } from "@/components/projects/unified-studio-view";
import { Project, AigenstraTask } from "@/types";

export const metadata = {
  title: "AI Product Studio | Aigenstra",
  description: "Unified AI Copilot and Prompt Studio inspired by Cursor and ChatGPT.",
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

  // Fetch tasks if available
  const { data: archDoc } = await supabase
    .from("architecture_docs")
    .select("storage")
    .eq("project_id", id)
    .maybeSingle();

  const storedTasks = (archDoc?.storage as any)?.tasks as AigenstraTask[] | undefined;

  return (
    <UnifiedStudioView
      project={project}
      initialTasks={storedTasks || []}
    />
  );
}
