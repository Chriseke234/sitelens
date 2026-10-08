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
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <ReadinessDashboardView
        projectId={projectId}
        projectName={projectName}
      />
    </div>
  );
}
