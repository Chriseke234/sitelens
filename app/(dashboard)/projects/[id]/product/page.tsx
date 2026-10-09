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
    <div className="space-y-6 font-mono">
      {/* Stage Subheader & Bento Tabs */}
      <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[5px_5px_0px_#080808]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 border-2 border-[#080808] bg-[#B7FF6A] px-2.5 py-0.5 text-[11px] font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808]">
              <FileCode2 className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>STAGE 02 · BLUEPRINT & ARCHITECTURE</span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#080808]">
              Software Blueprint
            </h1>
            <p className="text-xs font-medium text-[#080808]/75">
              Comprehensive specifications, data entities, user journeys, and execution sequence for your AI agent.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab("blueprint")}
              className={`flex items-center gap-2 border-[2.5px] border-[#080808] px-3.5 py-2 text-xs font-black uppercase transition-all ${
                activeTab === "blueprint"
                  ? "bg-[#FFE500] text-[#080808] shadow-[3px_3px_0px_#080808] -translate-y-0.5"
                  : "bg-white text-[#080808]/70 hover:bg-[#F8F6EC] hover:text-[#080808]"
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Full Blueprint</span>
            </button>
            <button
              onClick={() => setActiveTab("buildMap")}
              className={`flex items-center gap-2 border-[2.5px] border-[#080808] px-3.5 py-2 text-xs font-black uppercase transition-all ${
                activeTab === "buildMap"
                  ? "bg-[#FFE500] text-[#080808] shadow-[3px_3px_0px_#080808] -translate-y-0.5"
                  : "bg-white text-[#080808]/70 hover:bg-[#F8F6EC] hover:text-[#080808]"
              }`}
            >
              <MapPin className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Build Map Sequence</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="border-[3px] border-[#080808] bg-white p-12 text-center shadow-[5px_5px_0px_#080808] space-y-4">
          <Loader2 className="w-8 h-8 text-[#080808] animate-spin mx-auto stroke-[2.5]" />
          <div className="space-y-1">
            <h3 className="text-base font-black uppercase text-[#080808]">
              Synthesizing Software Blueprint & Build Map
            </h3>
            <p className="text-xs font-medium text-[#080808]/70 max-w-md mx-auto">
              Compiling discovery insights, role hierarchies, user journeys, and data schemas...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="border-[3px] border-[#080808] bg-white p-8 text-center shadow-[5px_5px_0px_#080808] space-y-4">
          <AlertCircle className="w-8 h-8 text-[#FF4F9A] mx-auto stroke-[2.5]" />
          <div className="space-y-1">
            <h3 className="text-base font-black uppercase text-[#080808]">
              Unable to Load Blueprint
            </h3>
            <p className="text-xs font-medium text-[#080808]/70 max-w-md mx-auto">{error}</p>
          </div>
          <button
            onClick={loadProjectData}
            className="inline-flex items-center gap-2 border-2 border-[#080808] bg-[#FFE500] px-4 py-2 text-xs font-black uppercase text-[#080808] shadow-[2.5px_2.5px_0px_#080808] hover:bg-white"
          >
            <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" /> Retry Loading
          </button>
        </div>
      )}

      {/* Main Views */}
      {!loading && !error && blueprint && healthReport && (
        <div className="min-w-0">
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
        </div>
      )}
    </div>
  );
}
