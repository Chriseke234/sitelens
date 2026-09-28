"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Settings,
  Trash2,
  Save,
  Loader2,
  ShieldAlert,
  Terminal,
  Rocket,
  SearchCheck,
} from "lucide-react";

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
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

  const handleDeleteProject = async () => {
    if (!confirm("Are you sure you want to delete this AI workspace? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/projects");
      }
    } catch (err) {
      console.error("Delete project error:", err);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
            <Settings className="h-3.5 w-3.5" />
            Workspace Settings
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Workspace Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Manage workspace metadata, coding environment preferences, and project deletion.
          </p>
        </div>
      </div>

      {project && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
              General Details
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-500">Project Name</label>
              <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{project.name}</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500">Product Description</label>
              <div className="mt-1 text-xs text-slate-700 dark:text-slate-300">{project.description}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500">Target Environment</label>
                <div className="mt-1 text-xs font-semibold text-slate-900 dark:text-white">{project.coding_environment}</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500">Current Stage</label>
                <div className="mt-1 text-xs font-semibold capitalize text-slate-900 dark:text-white">{project.stage.replace("_", " ")}</div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6 dark:border-rose-950/50 dark:bg-slate-900">
            <div className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-200 text-sm">
              <ShieldAlert className="h-5 w-5 text-rose-600" />
              Danger Zone
            </div>
            <p className="mt-1 text-xs text-rose-700 dark:text-rose-400">
              Deleting this AI workspace will permanently erase all associated discovery questions, research documents, user journeys, prompts, and audit findings.
            </p>

            <div className="mt-4">
              <button
                type="button"
                onClick={handleDeleteProject}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-rose-700 active:scale-95 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
