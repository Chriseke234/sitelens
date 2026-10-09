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
    <div className="space-y-8 py-2">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b-[3px] border-[#080808] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 border-2 border-[#080808] bg-[#FFE500] px-3 py-0.5 font-mono text-[10px] font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808]">
            AI PRODUCT ENGINEERING HUB
          </div>
          <h1 className="mt-3 font-mono text-3xl font-black uppercase tracking-tight text-[#080808] sm:text-4xl">
            AI Workspaces
          </h1>
          <p className="mt-1 font-mono text-xs font-bold text-[#080808]/70">
            Collaborate with your multidisciplinary AI product engineering team to plan, build, and audit your products.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/projects/new"
            className="inline-flex items-center justify-center gap-2 border-2 border-[#080808] bg-[#FFE500] px-5 py-2.5 font-mono text-xs font-black uppercase tracking-wider text-[#080808] shadow-[4px_4px_0px_#080808] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#080808] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>New Workspace</span>
          </Link>
        </div>
      </div>

      {/* Projects List or Empty State */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#080808] bg-[#F8F6EC]/80 p-12 text-center shadow-[6px_6px_0px_#080808]">
          <div className="flex h-16 w-16 items-center justify-center border-2 border-[#080808] bg-[#FFE500] text-[#080808] shadow-[3px_3px_0px_#080808]">
            <FolderKanban className="h-8 w-8 stroke-[2.5]" />
          </div>
          <h2 className="mt-4 font-mono text-xl font-black uppercase text-[#080808]">
            No AI Workspaces Yet
          </h2>
          <p className="mt-2 max-w-md font-mono text-xs font-bold leading-relaxed text-[#080808]/70">
            Start a new workspace to move your idea from discovery, user journeys, and technical architecture to structured build prompts and audits.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 border-2 border-[#080808] bg-[#FFE500] px-6 py-3 font-mono text-xs font-black uppercase text-[#080808] shadow-[4px_4px_0px_#080808] hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Start New Workspace</span>
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
                className="group flex flex-col justify-between border-[3px] border-[#080808] bg-white p-6 shadow-[6px_6px_0px_#080808] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[8px_8px_0px_#080808]"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b-2 border-[#080808]">
                    <span
                      className={`inline-flex items-center gap-1.5 border border-[#080808] px-2 py-0.5 font-mono text-[10px] font-black uppercase shadow-[1px_1px_0px_#080808] ${
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

                    <span className="inline-flex items-center gap-1 border border-[#080808] bg-[#F8F6EC] px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-[#080808]">
                      <Terminal className="h-3 w-3 stroke-[2.5]" />
                      {project.coding_environment}
                    </span>
                  </div>

                  <h3 className="mt-4 font-mono text-xl font-black uppercase text-[#080808] group-hover:text-[#FF4F9A] transition-colors">
                    {project.name}
                  </h3>

                  <p className="mt-2 font-mono text-xs font-medium text-[#080808]/80 line-clamp-2">
                    {project.description}
                  </p>
                </div>

                <div className="mt-6 border-t-2 border-[#080808] pt-4">
                  <div className="flex items-center justify-between font-mono text-[11px] font-bold text-[#080808]/70">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 stroke-[2]" />
                      {new Date(project.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="capitalize font-black text-[#080808]">
                      {project.stage.replace("_", " ")}
                    </span>
                  </div>

                  <Link
                    href={`/projects/${project.id}/overview`}
                    className="mt-4 flex w-full items-center justify-center gap-2 border-2 border-[#080808] bg-[#FFE500] py-2.5 font-mono text-xs font-black uppercase tracking-wider text-[#080808] shadow-[3px_3px_0px_#080808] transition-all group-hover:bg-[#080808] group-hover:text-white group-hover:shadow-[2px_2px_0px_#FFE500]"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
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
