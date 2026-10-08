"use client";

import React, { useState } from "react";
import {
  SoftwareBlueprint,
  BlueprintHealthReport,
  ItemSource,
  ItemStatus,
  BlueprintFeature,
  BlueprintScreen,
  BlueprintDataEntity,
  BlueprintUserRole,
  BlueprintUserJourney,
  BlueprintWorkflow,
  BlueprintBusinessRule,
  BlueprintIntegration,
  BlueprintAdminTool,
  BlueprintSecurityRule,
  BlueprintQualityTarget,
  BlueprintFuturePath,
} from "@/types";
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  Layers,
  Users,
  Route,
  Layout,
  GitFork,
  Scale,
  Database,
  Puzzle,
  Settings,
  Shield,
  CheckCheck,
  Compass,
  Code2,
  Eye,
  RefreshCw,
  Edit3,
  Check,
  ChevronDown,
  ChevronRight,
  Info,
} from "lucide-react";

interface BlueprintViewProps {
  projectId: string;
  projectName: string;
  initialBlueprint: SoftwareBlueprint;
  initialHealth: BlueprintHealthReport;
  onContinueToBuildMap?: () => void;
}

type ActiveSection =
  | "overview"
  | "usersRoles"
  | "userJourneys"
  | "features"
  | "screens"
  | "workflows"
  | "businessRules"
  | "dataEntities"
  | "integrations"
  | "adminTools"
  | "security"
  | "quality"
  | "futureConsiderations";

export function BlueprintView({
  projectId,
  projectName,
  initialBlueprint,
  initialHealth,
  onContinueToBuildMap,
}: BlueprintViewProps) {
  const [blueprint, setBlueprint] = useState<SoftwareBlueprint>(initialBlueprint);
  const [health, setHealth] = useState<BlueprintHealthReport>(initialHealth);
  const [activeSection, setActiveSection] = useState<ActiveSection>("overview");
  const [viewMode, setViewMode] = useState<"simple" | "technical">("simple");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");

  const sectionTabs: Array<{ id: ActiveSection; label: string; icon: React.ReactNode; count?: number }> = [
    { id: "overview", label: "Product Overview", icon: <Info className="w-4 h-4" /> },
    { id: "usersRoles", label: "Users & Roles", icon: <Users className="w-4 h-4" />, count: blueprint.usersRoles?.length },
    { id: "userJourneys", label: "User Journeys", icon: <Route className="w-4 h-4" />, count: blueprint.userJourneys?.length },
    { id: "features", label: "Feature Matrix", icon: <Layers className="w-4 h-4" />, count: blueprint.features?.length },
    { id: "screens", label: "Pages & Screens", icon: <Layout className="w-4 h-4" />, count: blueprint.screens?.length },
    { id: "workflows", label: "Workflows", icon: <GitFork className="w-4 h-4" />, count: blueprint.workflows?.length },
    { id: "businessRules", label: "Business Rules", icon: <Scale className="w-4 h-4" />, count: blueprint.businessRules?.length },
    { id: "dataEntities", label: "Data Model", icon: <Database className="w-4 h-4" />, count: blueprint.dataEntities?.length },
    { id: "integrations", label: "Integrations", icon: <Puzzle className="w-4 h-4" />, count: blueprint.integrations?.length },
    { id: "adminTools", label: "Admin & Ops", icon: <Settings className="w-4 h-4" />, count: blueprint.adminTools?.length },
    { id: "security", label: "Security & Privacy", icon: <Shield className="w-4 h-4" />, count: blueprint.security?.length },
    { id: "quality", label: "Quality & Testing", icon: <CheckCheck className="w-4 h-4" />, count: blueprint.quality?.length },
    { id: "futureConsiderations", label: "Future Roadmap", icon: <Compass className="w-4 h-4" />, count: blueprint.futureConsiderations?.length },
  ];

  const handleStatusChange = async (
    section: ActiveSection,
    itemId: string,
    newStatus: ItemStatus
  ) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/blueprint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemUpdate: {
            section,
            itemId,
            status: newStatus,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setBlueprint(data.blueprint);
        setHealth(data.healthReport);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!confirm("Re-synthesizing will analyze all discovery inputs and refresh blueprint recommendations. Continue?")) return;
    setIsRegenerating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/blueprint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "regenerate" }),
      });
      if (res.ok) {
        const data = await res.json();
        setBlueprint(data.blueprint);
        setHealth(data.healthReport);
      }
    } catch (err) {
      console.error("Failed to regenerate blueprint:", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const renderSourceBadge = (source: ItemSource) => {
    switch (source) {
      case "USER_CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Confirmed by You
          </span>
        );
      case "USER_DESCRIBED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Edit3 className="w-3 h-3" /> From Your Idea
          </span>
        );
      case "SYSTEM_INFERRED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-3 h-3" /> Architecture Inferred
          </span>
        );
      case "SYSTEM_RECOMMENDED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Sparkles className="w-3 h-3" /> Recommended
          </span>
        );
      case "ASSUMED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <HelpCircle className="w-3 h-3" /> Provisional Assumption
          </span>
        );
      default:
        return null;
    }
  };

  const renderStatusSelector = (section: ActiveSection, itemId: string, status: ItemStatus) => (
    <div className="flex items-center gap-1.5 flex-wrap">
      {(["CONFIRMED", "PROPOSED", "NEEDS_DECISION"] as ItemStatus[]).map((st) => {
        const isActive = status === st;
        return (
          <button
            key={st}
            onClick={() => handleStatusChange(section, itemId, st)}
            disabled={isUpdating}
            className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium border ${
              isActive
                ? st === "CONFIRMED"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : st === "NEEDS_DECISION"
                  ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                  : "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300"
            }`}
          >
            {st === "CONFIRMED" && <Check className="w-3 h-3 inline mr-1" />}
            {st === "CONFIRMED" ? "Confirmed" : st === "PROPOSED" ? "Proposed" : "Needs Decision"}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Banner & Progressive Disclosure Toggle */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Phase 2 Architecture
              </span>
              <span className="text-xs text-slate-500">
                Updated {new Date(blueprint.updated_at).toLocaleTimeString()}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Software Blueprint: {blueprint.overview?.name || projectName}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              A comprehensive blueprint mapping every role, journey, screen, and data entity your software requires.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode("simple")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "simple"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Simple View
              </button>
              <button
                onClick={() => setViewMode("technical")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "technical"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Technical Details
              </button>
            </div>

            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
              Re-Synthesize
            </button>

            {onContinueToBuildMap && (
              <button
                onClick={onContinueToBuildMap}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
              >
                View Build Map
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Blueprint Health Alert / Status Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                Blueprint Health: {health.score}%
              </span>
            </div>
            <div className="w-28 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  health.score >= 80
                    ? "bg-emerald-500"
                    : health.score >= 60
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${health.score}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">
              {health.isReadyForBuild ? "Ready for Build Planning" : "Needs Review"}
            </span>
          </div>

          {health.issues.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{health.issues.length} architecture notes to address</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Section Navigation Sidebar + Active Section Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 space-y-1 shadow-sm">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Blueprint Sections
          </div>
          {sectionTabs.map((tab) => {
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? "bg-blue-200/60 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Section Content Panel */}
        <div className="lg:col-span-9 space-y-6">
          {/* SECTION 1: PRODUCT OVERVIEW */}
          {activeSection === "overview" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Product Overview</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Foundational alignment and core objectives.</p>
                </div>
                <div className="flex items-center gap-2">
                  {renderSourceBadge(blueprint.overview.source)}
                  {renderStatusSelector("overview", "overview", blueprint.overview.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Product Name</div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{blueprint.overview.name}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Product Type</div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{blueprint.overview.productType}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Summary</div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                  {blueprint.overview.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Problem Statement</div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                    {blueprint.overview.problemStatement}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Outcome</div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                    {blueprint.overview.targetOutcome}
                  </p>
                </div>
              </div>

              {viewMode === "technical" && (
                <div className="mt-4 p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                    <Code2 className="w-4 h-4" /> Technical Architecture Note
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Platform Type: <strong>{blueprint.overview.productType}</strong>. Target delivery architecture: Next.js App Router (Fullstack SSR/SSG), Supabase PostgreSQL with Row Level Security, Tailwind CSS styling system.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: USERS & ROLES */}
          {activeSection === "usersRoles" && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Users & Roles</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Defined roles, goals, and access permissions.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {blueprint.usersRoles?.map((role) => (
                  <div
                    key={role.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{role.roleName}</h3>
                          <div className="mt-0.5">{renderSourceBadge(role.source)}</div>
                        </div>
                      </div>
                      {renderStatusSelector("usersRoles", role.id, role.status)}
                    </div>

                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {role.simpleDescription}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <div className="text-xs font-semibold text-slate-500 mb-1.5">User Goals</div>
                        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                          {role.userGoals?.map((g, idx) => (
                            <li key={idx} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              {g}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <div className="text-xs font-semibold text-slate-500 mb-1.5">Restrictions & Boundaries</div>
                        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                          {role.restrictions?.length ? (
                            role.restrictions.map((r, idx) => (
                              <li key={idx} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                {r}
                              </li>
                            ))
                          ) : (
                            <li className="text-slate-400">No restrictions specified.</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {viewMode === "technical" && (
                      <div className="mt-3 p-3 rounded-lg bg-slate-950 text-slate-200 font-mono text-xs space-y-1 border border-slate-800">
                        <div className="text-slate-400 font-sans text-[11px] font-semibold uppercase tracking-wider">
                          Technical Permissions
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {role.technicalPermissions?.map((perm, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700">
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: USER JOURNEYS */}
          {activeSection === "userJourneys" && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">User Journeys</h2>
                  <p className="text-xs text-slate-500 mt-0.5">End-to-end paths, friction points, and failure resolutions.</p>
                </div>
              </div>

              {blueprint.userJourneys?.map((journey) => (
                <div
                  key={journey.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{journey.title}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Role: {journey.role}
                        </span>
                      </div>
                      <div className="mt-1">{renderSourceBadge(journey.source)}</div>
                    </div>
                    {renderStatusSelector("userJourneys", journey.id, journey.status)}
                  </div>

                  {/* Happy Path Steps */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Step-by-Step Flow</div>
                    <div className="space-y-2.5">
                      {journey.happyPathSteps?.map((step) => (
                        <div
                          key={step.stepNumber}
                          className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                        >
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {step.stepNumber}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="text-xs font-semibold text-slate-900 dark:text-white">{step.title}</div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                              <strong className="text-slate-700 dark:text-slate-300">User Action:</strong> {step.userAction}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                              <strong className="text-slate-700 dark:text-slate-300">System Response:</strong> {step.systemResponse}
                            </div>
                            {viewMode === "technical" && step.technicalImplication && (
                              <div className="mt-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-700 text-[11px] text-blue-600 dark:text-blue-400 font-mono">
                                🔧 {step.technicalImplication}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Failure / Fallback Handling */}
                  {journey.failureScenarios?.length > 0 && (
                    <div className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-1.5">
                      <div className="text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Failure & Friction Handling
                      </div>
                      {journey.failureScenarios.map((f, idx) => (
                        <div key={idx} className="text-xs text-slate-700 dark:text-slate-300">
                          <strong className="text-rose-600 dark:text-rose-400">Scenario:</strong> {f.scenario} — <strong className="text-slate-900 dark:text-white">Resolution:</strong> {f.resolution}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* SECTION 4: FEATURE MATRIX */}
          {activeSection === "features" && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Feature Matrix</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Prioritized capabilities categorized by release phase.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blueprint.features?.map((feat) => (
                  <div
                    key={feat.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            feat.category === "CORE_MVP"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200"
                              : feat.category === "ADMIN"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {feat.category.replace("_", " ")}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">{feat.priority}</span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{feat.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {feat.simpleDescription}
                      </p>

                      {viewMode === "technical" && (
                        <div className="mt-2 p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                          ⚙️ {feat.technicalDetails}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      {renderSourceBadge(feat.source)}
                      {renderStatusSelector("features", feat.id, feat.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: PAGES & SCREENS */}
          {activeSection === "screens" && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pages & Screens</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Screen specifications with loading, empty, and error states.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {blueprint.screens?.map((screen) => (
                  <div
                    key={screen.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{screen.screenName}</h3>
                          <code className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-mono">
                            {screen.routePath}
                          </code>
                        </div>
                        <div className="mt-1">{renderSourceBadge(screen.source)}</div>
                      </div>
                      {renderStatusSelector("screens", screen.id, screen.status)}
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      {screen.simplePurpose}
                    </p>

                    {/* UI States Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="font-semibold text-slate-500">Empty State</div>
                        <div className="text-slate-600 dark:text-slate-400">{screen.emptyState}</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="font-semibold text-slate-500">Loading State</div>
                        <div className="text-slate-600 dark:text-slate-400">{screen.loadingState}</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="font-semibold text-slate-500">Error State</div>
                        <div className="text-slate-600 dark:text-slate-400">{screen.errorState}</div>
                      </div>
                    </div>

                    {viewMode === "technical" && (
                      <div className="p-3 rounded-lg bg-slate-950 text-slate-200 text-xs font-mono border border-slate-800 space-y-1">
                        <div className="text-slate-400 text-[11px] uppercase font-sans font-semibold">
                          Authorized Roles & Key Components
                        </div>
                        <div className="text-slate-300">
                          <strong>Roles:</strong> {screen.accessRoles?.join(", ")}
                        </div>
                        <div className="text-slate-300">
                          <strong>Components:</strong> {screen.keyComponents?.join(", ")}
                        </div>
                        {screen.technicalNotes && (
                          <div className="text-blue-300 text-[11px] pt-1">
                            💡 {screen.technicalNotes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6: WORKFLOWS */}
          {activeSection === "workflows" && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Business Workflows</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Multi-step backend and lifecycle triggers.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {blueprint.workflows?.map((wf) => (
                  <div
                    key={wf.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{wf.name}</h3>
                        <div className="mt-1">{renderSourceBadge(wf.source)}</div>
                      </div>
                      {renderStatusSelector("workflows", wf.id, wf.status)}
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      <strong className="text-slate-800 dark:text-slate-200">Trigger:</strong> {wf.trigger}
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      {wf.simpleDescription}
                    </p>

                    <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div className="text-xs font-semibold text-slate-500">Execution Steps</div>
                      <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                        {wf.steps?.map((st, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            {st}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {viewMode === "technical" && (
                      <div className="text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 p-2.5 rounded border border-blue-100 dark:border-blue-900">
                        ⚡ Technical Services Involved: {wf.technicalServices?.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 7: BUSINESS RULES */}
          {activeSection === "businessRules" && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Business Rules</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Inviolable constraints, rate limits, and validation policies.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {blueprint.businessRules?.map((rule) => (
                  <div
                    key={rule.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {rule.code}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                          {rule.enforcementLevel}
                        </span>
                      </div>
                      {renderStatusSelector("businessRules", rule.id, rule.status)}
                    </div>

                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {rule.ruleStatement}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      <strong>Rationale:</strong> {rule.reason}
                    </p>

                    {viewMode === "technical" && rule.technicalConstraint && (
                      <div className="p-2.5 rounded bg-slate-950 text-slate-200 text-xs font-mono border border-slate-800">
                        🔒 Enforcement: {rule.technicalConstraint}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 8: DATA MODEL */}
          {activeSection === "dataEntities" && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Data Model & Entities</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Database schema definitions, ownership, and attributes.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {blueprint.dataEntities?.map((entity) => (
                  <div
                    key={entity.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                          <Database className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{entity.entityName}</h3>
                          <span className="text-xs text-slate-500">Owner Role: {entity.ownershipRole}</span>
                        </div>
                      </div>
                      {renderStatusSelector("dataEntities", entity.id, entity.status)}
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      {entity.simpleDescription}
                    </p>

                    {/* Attributes Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                            <th className="pb-2 font-semibold">Field</th>
                            <th className="pb-2 font-semibold">Type</th>
                            <th className="pb-2 font-semibold">Required</th>
                            <th className="pb-2 font-semibold">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                          {entity.attributes?.map((attr, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <td className="py-2 font-mono font-medium text-slate-900 dark:text-slate-200">{attr.name}</td>
                              <td className="py-2 font-mono text-blue-600 dark:text-blue-400">{attr.type}</td>
                              <td className="py-2">{attr.required ? "Yes" : "Optional"}</td>
                              <td className="py-2 text-slate-600 dark:text-slate-400">{attr.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 9: INTEGRATIONS */}
          {activeSection === "integrations" && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Third-Party Integrations</h2>
                  <p className="text-xs text-slate-500 mt-0.5">External APIs, services, and fallback architectures.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blueprint.integrations?.map((integ) => (
                  <div
                    key={integ.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        {integ.category}
                      </span>
                      {renderStatusSelector("integrations", integ.id, integ.status)}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{integ.serviceName}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{integ.purpose}</p>
                    <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                      <strong>Fallback:</strong> {integ.fallbackPlan}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 10: ADMIN & OPS */}
          {activeSection === "adminTools" && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Administration & Operations</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Internal tools, monitoring consoles, and moderation controls.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {blueprint.adminTools?.map((tool) => (
                  <div
                    key={tool.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{tool.toolName}</h3>
                      {renderStatusSelector("adminTools", tool.id, tool.status)}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{tool.simpleDescription}</p>
                    <div className="text-xs text-slate-500">
                      <strong>Purpose:</strong> {tool.operationalPurpose}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 11: SECURITY & PRIVACY */}
          {activeSection === "security" && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Security & Privacy Rules</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Row-level security, auth guardrails, and data isolation policies.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {blueprint.security?.map((sec) => (
                  <div
                    key={sec.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{sec.title}</h3>
                      </div>
                      {renderStatusSelector("security", sec.id, sec.status)}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{sec.simpleDescription}</p>
                    <div className="p-2.5 rounded bg-slate-950 text-slate-200 font-mono text-xs border border-slate-800">
                      🛡️ {sec.technicalImplementation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 12: QUALITY & TESTING */}
          {activeSection === "quality" && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quality, Responsiveness & Testing</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Accessibility standards, viewport coverage, and performance benchmarks.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blueprint.quality?.map((qual) => (
                  <div
                    key={qual.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        {qual.category}
                      </span>
                      {renderStatusSelector("quality", qual.id, qual.status)}
                    </div>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{qual.requirement}</p>
                    {qual.targetMetric && (
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        Target: {qual.targetMetric}
                      </div>
                    )}
                    <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                      <strong>Approach:</strong> {qual.technicalApproach}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 13: FUTURE ROADMAP */}
          {activeSection === "futureConsiderations" && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Future Roadmap & Scale</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Post-MVP features and long-term architectural pathways.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {blueprint.futureConsiderations?.map((fut) => (
                  <div
                    key={fut.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                          {fut.phase}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{fut.title}</h3>
                      </div>
                      {renderStatusSelector("futureConsiderations", fut.id, fut.status)}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{fut.simpleDescription}</p>
                    {viewMode === "technical" && (
                      <div className="p-2.5 rounded bg-slate-950 text-slate-200 font-mono text-xs border border-slate-800">
                        🚀 Architecture Note: {fut.technicalArchitectureNote}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
