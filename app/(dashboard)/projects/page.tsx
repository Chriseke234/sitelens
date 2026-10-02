import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  FolderKanban,
  Plus,
  Rocket,
  SearchCheck,
  ArrowRight,
  Terminal,
  Sparkles,
  Calendar,
} from "lucide-react";
import { Project } from "@/types";

export const metadata = {
  title: "AI Workspaces | Aigenstra",
  description: "View and manage your AI product engineering workspaces.",
};

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let projects: Project[] = [];
  if (user) {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    projects = (data as Project[]) || [];
  }

  return (
    <div className="space-y-8 py-4">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <Sparkles className="h-3.5 w-3.5" />
            AI Product Engineering Hub
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            AI Workspaces
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Collaborate with your multidisciplinary AI product engineering team to plan, build, and audit your products.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/templates"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 btn-interactive"
          >
            <span>Browse Templates</span>
          </Link>

          <Link
            href="/projects/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 active:scale-95 btn-interactive"
          >
            <Plus className="h-4 w-4" />
            <span>New Workspace</span>
          </Link>
        </div>
      </div>

      {/* Projects List or Empty State */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <FolderKanban className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            No AI Workspaces Yet
          </h2>
          <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
            Start a new workspace to move your idea from discovery, user journeys, and technical architecture to structured build prompts and audits.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 btn-interactive"
            >
              <Plus className="h-4 w-4" />
              <span>Create Blank Workspace</span>
            </Link>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 btn-interactive"
            >
              <span>Explore Starter Templates</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const isBuildMode = project.mode === "build";
            return (
              <div
                key={project.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
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

                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                      <Terminal className="h-3 w-3" />
                      {project.coding_environment}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {project.name}
                  </h3>

                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {project.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(project.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">
                      {project.stage.replace("_", " ")}
                    </span>
                  </div>

                  <Link
                    href={`/projects/${project.id}/overview`}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-900 transition-all group-hover:bg-blue-600 group-hover:text-white dark:bg-slate-800 dark:text-slate-100"
                  >
                    Open Workspace
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
