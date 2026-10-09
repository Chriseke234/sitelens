import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectWorkspaceNav } from "@/components/projects/workspace-nav";
import { DeleteProjectModal } from "@/components/projects/delete-project-modal";
import { Sparkles, Terminal, Rocket, SearchCheck } from "lucide-react";
import { Project } from "@/types";

export default async function ProjectWorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
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
  const isBuildMode = project.mode === "build";

  return (
    <div className="space-y-6 py-2">
      {/* Workspace Header in Bento Neo-Brutalist Card */}
      <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[6px_6px_0px_#080808]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 border-2 border-[#080808] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_#080808] ${
                  isBuildMode
                    ? "bg-[#FFE500] text-[#080808]"
                    : "bg-[#B7FF6A] text-[#080808]"
                }`}
              >
                {isBuildMode ? (
                  <Rocket className="h-3 w-3 stroke-[2.5]" />
                ) : (
                  <SearchCheck className="h-3 w-3 stroke-[2.5]" />
                )}
                {isBuildMode ? "MODE A — BUILD" : "MODE B — AUDIT"}
              </span>

              <span className="inline-flex items-center gap-1 border-2 border-[#080808] bg-white px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-[#080808] shadow-[1.5px_1.5px_0px_#080808]">
                <Terminal className="h-3 w-3 stroke-[2.5]" />
                {project.coding_environment}
              </span>

              <span className="capitalize font-mono text-[10px] font-bold uppercase text-[#080808]/70 border border-[#080808] bg-[#F8F6EC] px-2 py-0.5">
                Stage: {project.stage.replace("_", " ")}
              </span>
            </div>

            <h1 className="font-mono text-2xl font-black uppercase tracking-tight text-[#080808] sm:text-3xl">
              {project.name}
            </h1>
            <p className="font-mono text-xs font-medium text-[#080808]/80 line-clamp-2 max-w-2xl">
              {project.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="border-2 border-[#080808] bg-[#F8F6EC] p-3 text-right shadow-[3px_3px_0px_#080808]">
              <div className="font-mono text-[10px] font-bold uppercase text-[#080808]/60">Target Goal</div>
              <div className="font-mono text-xs font-black uppercase text-[#080808] line-clamp-1 max-w-[200px]">
                {project.goal}
              </div>
            </div>

            <DeleteProjectModal
              projectId={id}
              projectName={project.name}
              variant="header"
            />
          </div>
        </div>

        {/* Workspace Tab Navigation */}
        <div className="mt-6 border-t-2 border-[#080808] pt-4">
          <ProjectWorkspaceNav projectId={id} />
        </div>
      </div>

      {/* Workspace Tab Content */}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
