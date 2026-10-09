"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ReadinessDashboardView } from "@/components/projects/readiness-dashboard-view";

export default function ReadinessPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState("Project Workspace");

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.project?.name) setProjectName(data.project.name);
        }
      } catch (err) {
        console.error("Failed to fetch project name:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center border-[3px] border-[#080808] bg-white shadow-[6px_6px_0px_#080808]">
        <Loader2 className="h-8 w-8 animate-spin text-[#080808]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Stage Header Banner */}
      <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[5px_5px_0px_#080808]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 border-2 border-[#080808] bg-[#B7FF6A] px-2.5 py-0.5 text-[11px] font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808]">
              <span>STAGE 05 · SHIP & READINESS</span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#080808]">
              Ship Readiness & Verification
            </h1>
            <p className="text-xs font-medium text-[#080808]/75">
              Comprehensive release checklist, architecture sign-off, and final build verification before shipping to users.
            </p>
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <ReadinessDashboardView
          projectId={projectId}
          projectName={projectName}
        />
      </div>
    </div>
  );
}
