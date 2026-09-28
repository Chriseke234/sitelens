import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectWorkspaceNav } from "@/components/projects/workspace-nav";
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
      {/* Workspace Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  isBuildMode
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                    : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                }`}
              >
                {isBuildMode ? (
                  <Rocket className="h-3 w-3" />
                ) : (
                  <SearchCheck className="h-3 w-3" />
                )}
                {isBuildMode ? "MODE A — BUILD" : "MODE B — AUDIT"}
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Terminal className="h-3 w-3" />
                {project.coding_environment}
              </span>

              <span className="capitalize text-xs font-semibold text-slate-500">
                Stage: {project.stage.replace("_", " ")}
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              {project.name}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {project.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-right dark:border-slate-800 dark:bg-slate-950">
              <div className="text-xs font-medium text-slate-500">Target Goal</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 max-w-[200px]">
                {project.goal}
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Tab Navigation */}
        <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800/80">
          <ProjectWorkspaceNav projectId={id} />
        </div>
      </div>

      {/* Workspace Tab Content */}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
