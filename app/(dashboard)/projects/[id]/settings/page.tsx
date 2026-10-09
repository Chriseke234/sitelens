"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Settings,
  Trash2,
  Loader2,
  ShieldAlert,
  Terminal,
  Rocket,
  SearchCheck,
  FileText,
  Layers,
} from "lucide-react";
import { DeleteProjectModal } from "@/components/projects/delete-project-modal";

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any | null>(null);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const data = await res.json();
      if (res.ok && data.project) {
        setProject(data.project);
      }
    } catch (err) {
      console.error("Failed to load project:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center border-[3px] border-[#080808] bg-white shadow-[6px_6px_0px_#080808]">
        <Loader2 className="h-8 w-8 animate-spin text-[#080808]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[6px_6px_0px_#080808]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 border-2 border-[#080808] bg-[#FFE500] px-2.5 py-0.5 text-[11px] font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808]">
            <Settings className="h-3.5 w-3.5 stroke-[2.5]" />
            WORKSPACE SETTINGS
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#080808] sm:text-3xl">
            Workspace Configuration
          </h1>
          <p className="text-xs font-medium text-[#080808]/75">
            Manage project parameters, coding environment preferences, and project deletion.
          </p>
        </div>
      </div>

      {project && (
        <div className="space-y-6">
          {/* General Details Bento Card */}
          <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[6px_6px_0px_#080808] space-y-5">
            <div className="flex items-center justify-between border-b-2 border-[#080808] pb-3">
              <span className="text-sm font-black uppercase text-[#080808]">
                General Metadata
              </span>
              <span className="border border-[#080808] bg-[#B7FF6A] px-2 py-0.5 text-[10px] font-black uppercase">
                Active Baseline
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="border-2 border-[#080808] bg-[#F8F6EC] p-3 shadow-[2px_2px_0px_#080808]">
                <label className="block text-[10px] font-black uppercase text-[#080808]/60">
                  Project Workspace Name
                </label>
                <div className="mt-1 text-sm font-black uppercase text-[#080808]">
                  {project.name}
                </div>
              </div>

              <div className="border-2 border-[#080808] bg-[#F8F6EC] p-3 shadow-[2px_2px_0px_#080808]">
                <label className="block text-[10px] font-black uppercase text-[#080808]/60">
                  Product Type
                </label>
                <div className="mt-1 text-sm font-black uppercase text-[#080808]">
                  {project.product_type || "SaaS"}
                </div>
              </div>
            </div>

            <div className="border-2 border-[#080808] bg-[#F8F6EC] p-3 shadow-[2px_2px_0px_#080808]">
              <label className="block text-[10px] font-black uppercase text-[#080808]/60">
                Core Concept / Description
              </label>
              <div className="mt-1 text-xs font-bold leading-relaxed text-[#080808]">
                {project.description || project.raw_idea || "No description provided."}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="border-2 border-[#080808] bg-[#F8F6EC] p-3 shadow-[2px_2px_0px_#080808]">
                <label className="block text-[10px] font-black uppercase text-[#080808]/60">
                  Target Agent
                </label>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-black uppercase text-[#080808]">
                  <Terminal className="h-3.5 w-3.5" />
                  <span>{project.coding_environment}</span>
                </div>
              </div>

              <div className="border-2 border-[#080808] bg-[#F8F6EC] p-3 shadow-[2px_2px_0px_#080808]">
                <label className="block text-[10px] font-black uppercase text-[#080808]/60">
                  Workspace Mode
                </label>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-black uppercase text-[#080808]">
                  {project.mode === "build" ? (
                    <Rocket className="h-3.5 w-3.5 text-[#080808]" />
                  ) : (
                    <SearchCheck className="h-3.5 w-3.5 text-[#080808]" />
                  )}
                  <span>{project.mode === "build" ? "Mode A: Build" : "Mode B: Audit"}</span>
                </div>
              </div>

              <div className="border-2 border-[#080808] bg-[#F8F6EC] p-3 shadow-[2px_2px_0px_#080808]">
                <label className="block text-[10px] font-black uppercase text-[#080808]/60">
                  Current Stage
                </label>
                <div className="mt-1 text-xs font-black uppercase text-[#080808]">
                  {project.stage?.replace("_", " ")}
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone: Neo-Brutalist Card */}
          <div className="border-[3px] border-[#080808] bg-[#F8F6EC] p-6 shadow-[6px_6px_0px_#080808] space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-[#080808] pb-3">
              <span className="border border-[#080808] bg-[#FF4F9A] px-2 py-0.5 text-[11px] font-black uppercase text-white shadow-[1.5px_1.5px_0px_#080808]">
                DANGER ZONE
              </span>
              <span className="text-sm font-black uppercase text-[#080808]">
                Permanent Deletion
              </span>
            </div>

            <p className="text-xs font-medium leading-relaxed text-[#080808]/85 max-w-2xl">
              Permanently removes this project workspace along with all generated blueprints, discovery question-and-answers, task backlogs, agent prompt studios, and verification audits.
            </p>

            <div className="pt-2">
              <DeleteProjectModal
                projectId={projectId}
                projectName={project.name}
                variant="button"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
