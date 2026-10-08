"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ProjectWorkspaceNav } from "@/components/projects/workspace-nav";
import { BlueprintView } from "@/components/projects/blueprint-view";
import { BuildMapView } from "@/components/projects/build-map-view";
import { SoftwareBlueprint, BlueprintHealthReport, BuildMap } from "@/types";
import {
  FileCode2,
  MapPin,
  Loader2,
  AlertCircle,
  RefreshCw,
  Layers,
} from "lucide-react";

export default function ProductBlueprintPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [activeTab, setActiveTab] = useState<"blueprint" | "buildMap">("blueprint");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("Your Project");
  const [blueprint, setBlueprint] = useState<SoftwareBlueprint | null>(null);
  const [healthReport, setHealthReport] = useState<BlueprintHealthReport | null>(null);
  const [buildMap, setBuildMap] = useState<BuildMap | null>(null);

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch project info & blueprint
      const blueprintRes = await fetch(`/api/projects/${projectId}/blueprint`);
      const blueprintData = await blueprintRes.json();

      if (!blueprintRes.ok) {
        throw new Error(blueprintData.error || "Failed to load software blueprint.");
      }

      setBlueprint(blueprintData.blueprint);
      setHealthReport(blueprintData.healthReport);
      if (blueprintData.blueprint?.overview?.name) {
        setProjectName(blueprintData.blueprint.overview.name);
      }

      // 2. Fetch build map
      const buildMapRes = await fetch(`/api/projects/${projectId}/build-map`);
      const buildMapData = await buildMapRes.json();
      if (buildMapRes.ok && buildMapData.buildMap) {
        setBuildMap(buildMapData.buildMap);
      }
    } catch (err: any) {
      console.error("Failed to load blueprint page data:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Workspace Stage Navigation */}
      <ProjectWorkspaceNav projectId={projectId} />

      {/* Subheader & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("blueprint")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "blueprint"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300"
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            Software Blueprint (13 Sections)
          </button>
          <button
            onClick={() => setActiveTab("buildMap")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "buildMap"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300"
            }`}
          >
            <MapPin className="w-4 h-4" />
            Build Map & Sequence
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm space-y-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Synthesizing Software Blueprint & Build Map
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Analyzing discovery insights, role hierarchies, user journeys, and data schemas...
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
              Unable to Load Blueprint
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
          </div>
          <button
            onClick={loadProjectData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-semibold hover:opacity-90 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Loading
          </button>
        </div>
      )}

      {/* Main Views */}
      {!loading && !error && blueprint && healthReport && (
        <>
          {activeTab === "blueprint" && (
            <BlueprintView
              projectId={projectId}
              projectName={projectName}
              initialBlueprint={blueprint}
              initialHealth={healthReport}
              onContinueToBuildMap={() => setActiveTab("buildMap")}
            />
          )}

          {activeTab === "buildMap" && buildMap && (
            <BuildMapView
              projectId={projectId}
              projectName={projectName}
              initialBuildMap={buildMap}
              onBackToBlueprint={() => setActiveTab("blueprint")}
            />
          )}
        </>
      )}
    </div>
  );
}
