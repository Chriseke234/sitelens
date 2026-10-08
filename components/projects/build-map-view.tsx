"use client";

import React, { useState } from "react";
import { BuildMap, BuildStage, BuildStageStatus } from "@/types";
import {
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  Check,
  ChevronRight,
  Bot,
  Layers,
  Database,
  Layout,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";

interface BuildMapViewProps {
  projectId: string;
  projectName: string;
  initialBuildMap: BuildMap;
  onBackToBlueprint?: () => void;
}

export function BuildMapView({
  projectId,
  projectName,
  initialBuildMap,
  onBackToBlueprint,
}: BuildMapViewProps) {
  const [buildMap, setBuildMap] = useState<BuildMap>(initialBuildMap);
  const [selectedStageId, setSelectedStageId] = useState<string>(
    initialBuildMap.stages[0]?.id || ""
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const selectedStage =
    buildMap.stages.find((s) => s.id === selectedStageId) || buildMap.stages[0];

  const handleStatusChange = async (stageId: string, newStatus: BuildStageStatus) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/build-map`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId, status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setBuildMap(data.buildMap);
      }
    } catch (err) {
      console.error("Failed to update build stage status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: BuildStageStatus) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Play className="w-3 h-3" /> In Progress
          </span>
        );
      case "READY":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Clock className="w-3 h-3" /> Ready to Build
          </span>
        );
      case "BLOCKED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-3 h-3" /> Blocked
          </span>
        );
      case "DEFERRED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Deferred
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Not Started
          </span>
        );
    }
  };

  const progressPercentage = Math.round(
    (buildMap.completedStages / Math.max(1, buildMap.totalStages)) * 100
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Phase 2 Build Map
              </span>
              <span className="text-xs text-slate-500">
                {buildMap.completedStages} of {buildMap.totalStages} stages completed ({progressPercentage}%)
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Build Map: {projectName}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Chronological build increments sequenced for external coding agents. Each stage has a clear purpose and concrete deliverables.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onBackToBlueprint && (
              <button
                onClick={onBackToBlueprint}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Back to Blueprint
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {progressPercentage}% Completed
          </span>
        </div>
      </div>

      {/* Main Layout: Stages Timeline / List on Left + Selected Stage Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Stage Progression List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            Build Sequence ({buildMap.stages.length} Stages)
          </div>

          {buildMap.stages.map((stage) => {
            const isSelected = stage.id === selectedStage?.id;
            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStageId(stage.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-white dark:bg-slate-900 border-blue-500 ring-2 ring-blue-500/20 shadow-md"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center">
                      {stage.stageNumber}
                    </span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {stage.userCentricName}
                    </div>
                  </div>
                  {getStatusBadge(stage.status)}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                  {stage.whyThisExists}
                </p>

                <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3" /> {stage.deliverables?.length || 0} deliverables
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {stage.estimatedComplexity} complexity
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Selected Stage Deep-Dive */}
        {selectedStage && (
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
            {/* Stage Header & Status Controller */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Stage {selectedStage.stageNumber} of {buildMap.totalStages}
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedStage.userCentricName}
                </h2>
              </div>

              {/* Status Updater */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(["NOT_STARTED", "READY", "IN_PROGRESS", "COMPLETED"] as BuildStageStatus[]).map(
                  (st) => {
                    const isActive = selectedStage.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(selectedStage.id, st)}
                        disabled={isUpdating}
                        className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium border ${
                          isActive
                            ? st === "COMPLETED"
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                              : st === "IN_PROGRESS"
                              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                              : st === "READY"
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                              : "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-sm"
                            : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                        }`}
                      >
                        {st === "COMPLETED" && <Check className="w-3 h-3 inline mr-1" />}
                        {st === "COMPLETED"
                          ? "Completed"
                          : st === "IN_PROGRESS"
                          ? "In Progress"
                          : st === "READY"
                          ? "Ready"
                          : "Not Started"}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Why This Exists (Prominent Plain-English Callout) */}
            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
                <HelpCircle className="w-4 h-4" /> Why This Exists &amp; Why It&apos;s Built Now
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedStage.whyThisExists}
              </p>
            </div>

            {/* Deliverables Scope */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-400" /> Stage Deliverables & Scope
              </div>
              <ul className="space-y-2">
                {selectedStage.deliverables?.map((deliv, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{deliv}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Associated Assets (Screens & Data Entities) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Layout className="w-3.5 h-3.5 text-slate-400" /> Associated Screens
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStage.associatedScreens?.length > 0 ? (
                    selectedStage.associatedScreens.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">None specified for this stage.</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-slate-400" /> Associated Data Entities
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStage.associatedEntities?.length > 0 ? (
                    selectedStage.associatedEntities.map((e, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono"
                      >
                        {e}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">None specified for this stage.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Target Coding Agent Guidance */}
            <div className="p-4 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Bot className="w-4 h-4" /> Coding Agent Implementation Strategy
              </div>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                {selectedStage.agentGuidance}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
