"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ProjectWorkspaceNav } from "@/components/projects/workspace-nav";
import { EngineeringView } from "@/components/projects/engineering-view";
import { EngineeringBlueprint, EngineeringReadinessReport } from "@/types";
import {
  Cpu,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function ArchitecturePage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("Your Project");
  const [blueprint, setBlueprint] = useState<EngineeringBlueprint | null>(null);
  const [readiness, setReadiness] = useState<EngineeringReadinessReport | null>(null);

  useEffect(() => {
    if (projectId) {
      loadArchitectureData();
    }
  }, [projectId]);

  const loadArchitectureData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/architecture`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load technical architecture.");
      }

      setBlueprint(data.engineeringBlueprint);
      setReadiness(data.readiness);
      if (data.engineeringBlueprint?.domains?.PRODUCT_ARCHITECTURE?.[0]?.title) {
        // Successful load
      }
    } catch (err: any) {
      console.error("Failed to load engineering intelligence:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Workspace Stage Navigation */}
      <ProjectWorkspaceNav projectId={projectId} />

      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm space-y-4">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Synthesizing Engineering Intelligence & Technical Architecture
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Reasoning across UX flows, database relations, API contracts, security policies, and performance bottlenecks...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 rounded-2xl p-8 text-center shadow-sm space-y-4">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Unable to Load Engineering Architecture
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
          </div>
          <button
            onClick={loadArchitectureData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-semibold hover:opacity-90 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Loading
          </button>
        </div>
      )}

      {/* Main Engineering View */}
      {!loading && !error && blueprint && readiness && (
        <EngineeringView
          projectId={projectId}
          projectName={projectName}
          initialBlueprint={blueprint}
          initialReadiness={readiness}
          onRefresh={loadArchitectureData}
        />
      )}
    </div>
  );
}
