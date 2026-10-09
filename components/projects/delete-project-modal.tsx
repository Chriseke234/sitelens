"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";

interface DeleteProjectModalProps {
  projectId: string;
  projectName: string;
  variant?: "header" | "button";
  className?: string;
}

export function DeleteProjectModal({
  projectId,
  projectName,
  variant = "header",
  className = "",
}: DeleteProjectModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete project workspace.");
      }

      // Close modal and redirect to project list
      setIsOpen(false);
      router.push("/projects");
      router.refresh();
    } catch (err: any) {
      console.error("Delete project error:", err);
      setError(err.message || "Failed to delete workspace. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <>
      {variant === "header" ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          title="Delete this project workspace"
          className={`flex items-center gap-1.5 border-2 border-[#080808] bg-white px-3 py-1.5 font-mono text-[11px] font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808] transition-all hover:bg-[#FF4F9A] hover:text-white hover:translate-x-0.5 hover:translate-y-0.5 ${className}`}
        >
          <Trash2 className="h-3.5 w-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Delete Project</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`flex items-center justify-center gap-2 border-[2.5px] border-[#080808] bg-[#FF4F9A] px-4 py-2.5 font-mono text-xs font-black uppercase text-white shadow-[3px_3px_0px_#080808] transition-all hover:bg-[#e03a83] active:translate-y-0.5 ${className}`}
        >
          <Trash2 className="h-4 w-4 stroke-[2.5]" />
          <span>Delete Project Workspace</span>
        </button>
      )}

      {/* Accessible Neo-Brutalist Confirmation Dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-md border-[4px] border-[#080808] bg-[#F8F6EC] p-6 text-[#080808] shadow-[8px_8px_0px_#080808]">
            {/* Header */}
            <div className="flex items-center justify-between border-b-[3px] border-[#080808] pb-4">
              <div className="flex items-center gap-2 font-mono">
                <span className="border-2 border-[#080808] bg-[#FF4F9A] px-2 py-0.5 text-[11px] font-black uppercase text-white shadow-[1.5px_1.5px_0px_#080808]">
                  DANGER ZONE
                </span>
                <span className="text-sm font-black uppercase tracking-tight">
                  DELETE PROJECT
                </span>
              </div>
              <button
                type="button"
                onClick={() => !deleting && setIsOpen(false)}
                disabled={deleting}
                className="border-2 border-[#080808] bg-white p-1 shadow-[2px_2px_0px_#080808] hover:bg-[#FF4F9A] hover:text-white disabled:opacity-50"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="mt-5 space-y-3 font-mono">
              <p id="delete-dialog-title" className="text-sm font-black uppercase">
                Delete workspace &quot;{projectName}&quot;?
              </p>
              <p className="text-xs font-medium leading-relaxed text-[#080808]/80">
                This action is <strong>permanent</strong>. It will delete all software blueprints, answered discovery questions, agent prompts, and audit records for this project.
              </p>

              {error && (
                <div className="flex items-center gap-2 border-2 border-[#080808] bg-[#FF4F9A]/20 p-2.5 text-xs font-bold text-[#080808]">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-[#FF4F9A]" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t-2 border-[#080808] pt-4 font-mono">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={deleting}
                className="border-2 border-[#080808] bg-white px-4 py-2 text-xs font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808] hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 border-2 border-[#080808] bg-[#FF4F9A] px-4 py-2 text-xs font-black uppercase text-white shadow-[2px_2px_0px_#080808] hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>Delete Forever</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
