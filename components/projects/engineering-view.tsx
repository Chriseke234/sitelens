"use client";

import React, { useState } from "react";
import {
  EngineeringBlueprint,
  EngineeringDomain,
  EngineeringDomainItem,
  EngineeringReadinessReport,
  TechnicalRecommendation,
  ApiContract,
  EntityRelationship,
  StateTransition,
  TraceabilityItem,
} from "@/types";
import {
  Cpu,
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
  Server,
  Lock,
  Zap,
  Globe,
  ArrowRight,
  AlertCircle,
  FileCheck2,
  Search,
} from "lucide-react";

interface EngineeringViewProps {
  projectId: string;
  projectName: string;
  initialBlueprint: EngineeringBlueprint;
  initialReadiness: EngineeringReadinessReport;
  onRefresh?: () => void;
}

export function EngineeringView({
  projectId,
  projectName,
  initialBlueprint,
  initialReadiness,
  onRefresh,
}: EngineeringViewProps) {
  const [blueprint, setBlueprint] = useState<EngineeringBlueprint>(initialBlueprint);
  const [readiness, setReadiness] = useState<EngineeringReadinessReport>(initialReadiness);
  const [viewMode, setViewMode] = useState<"simple" | "technical">("simple");
  const [activeTab, setActiveTab] = useState<"domains" | "traceability" | "decisions" | "readiness">("domains");
  const [selectedDomain, setSelectedDomain] = useState<EngineeringDomain>("PRODUCT_ARCHITECTURE");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isResynthesizing, setIsResynthesizing] = useState(false);

  const domainList: Array<{ id: EngineeringDomain; label: string; icon: React.ReactNode }> = [
    { id: "PRODUCT_ARCHITECTURE", label: "Product Architecture", icon: <Layers className="w-4 h-4" /> },
    { id: "UX_ARCHITECTURE", label: "UX Architecture", icon: <Route className="w-4 h-4" /> },
    { id: "UI_ARCHITECTURE", label: "UI Architecture", icon: <Layout className="w-4 h-4" /> },
    { id: "FRONTEND", label: "Frontend", icon: <Eye className="w-4 h-4" /> },
    { id: "BACKEND", label: "Backend", icon: <Server className="w-4 h-4" /> },
    { id: "API_CONTRACTS", label: "API Contracts", icon: <Code2 className="w-4 h-4" /> },
    { id: "DATABASE", label: "Database & Models", icon: <Database className="w-4 h-4" /> },
    { id: "AUTHENTICATION", label: "Authentication", icon: <Lock className="w-4 h-4" /> },
    { id: "AUTHORIZATION", label: "Authorization (RLS)", icon: <Shield className="w-4 h-4" /> },
    { id: "SECURITY", label: "Security & Defenses", icon: <ShieldCheck className="w-4 h-4" /> },
    { id: "PERFORMANCE", label: "Performance", icon: <Zap className="w-4 h-4" /> },
    { id: "ACCESSIBILITY", label: "Accessibility (a11y)", icon: <CheckCheck className="w-4 h-4" /> },
    { id: "TESTING", label: "Testing Suite", icon: <FileCheck2 className="w-4 h-4" /> },
    { id: "DEPLOYMENT", label: "Deployment & DevOps", icon: <Globe className="w-4 h-4" /> },
    { id: "SEO", label: "SEO & Social Sharing", icon: <Compass className="w-4 h-4" /> },
  ];

  const handleDecision = async (
    recommendationId: string,
    decision: "USER_CONFIRMED" | "UNDECIDED" | "DEFERRED",
    selectedOption?: string
  ) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/architecture`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendationId, decision, selectedOption }),
      });
      if (res.ok) {
        const data = await res.json();
        setBlueprint(data.engineeringBlueprint);
        setReadiness(data.readiness);
      }
    } catch (err) {
      console.error("Failed to update recommendation:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResynthesize = async () => {
    if (!confirm("Re-synthesizing will analyze current blueprint specifications and update engineering models. Continue?")) return;
    setIsResynthesizing(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/architecture`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setBlueprint(data.engineeringBlueprint);
        setReadiness(data.readiness);
      }
    } catch (err) {
      console.error("Failed to re-synthesize engineering blueprint:", err);
    } finally {
      setIsResynthesizing(false);
    }
  };

  const currentDomainItems = (blueprint.domains?.[selectedDomain] || []).filter((it) =>
    searchQuery === "" ||
    it.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    it.simpleExplanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    it.technicalSpecification.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner & Progressive Disclosure Toggle */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Phase 3 Architecture
              </span>
              <span className="text-xs text-slate-500">
                Updated {new Date(blueprint.updated_at).toLocaleTimeString()}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Engineering Intelligence: {projectName}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Understand how your product works behind the scenes — from UI flows and backend APIs to database security and performance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Progressive Disclosure Toggle */}
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
              onClick={handleResynthesize}
              disabled={isResynthesizing}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResynthesizing ? "animate-spin" : ""}`} />
              Re-Analyze
            </button>
          </div>
        </div>

        {/* High-Level Architecture Flow (Beginner Friendly Visual Guide) */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            System Architecture Overview
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Layout className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>1. User Interface</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {blueprint.highLevelFlow?.userInterface || "Responsive web & mobile interface"}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Server className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>2. Application Logic</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {blueprint.highLevelFlow?.applicationLogic || "Server-side rules & validation"}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>3. Secure Database</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {blueprint.highLevelFlow?.databaseLayer || "Relational storage with Row-Level Security"}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Puzzle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>4. Integrations</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {blueprint.highLevelFlow?.externalServices || "Auth, emails, and external APIs"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("domains")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === "domains"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          15 Engineering Domains
        </button>

        <button
          onClick={() => setActiveTab("traceability")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === "traceability"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Route className="w-3.5 h-3.5" />
          Feature Traceability Matrix
        </button>

        <button
          onClick={() => setActiveTab("decisions")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === "decisions"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          Technical Decisions & Tradeoffs
          {readiness.unresolvedDecisionsCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-semibold">
              {readiness.unresolvedDecisionsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("readiness")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === "readiness"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Engineering Readiness & Change Impact
        </button>
      </div>

      {/* TAB 1: 15 ENGINEERING DOMAINS */}
      {activeTab === "domains" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Domain Selector Sidebar */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 space-y-1 shadow-sm">
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Engineering Disciplines
            </div>
            {domainList.map((dom) => {
              const isSelected = selectedDomain === dom.id;
              const itemCount = blueprint.domains?.[dom.id]?.length || 0;
              return (
                <button
                  key={dom.id}
                  onClick={() => setSelectedDomain(dom.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}>
                      {dom.icon}
                    </span>
                    <span>{dom.label}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {itemCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Domain Content Panel */}
          <div className="lg:col-span-9 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {domainList.find((d) => d.id === selectedDomain)?.label}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedDomain === "DATABASE"
                    ? "Entity schemas, relations, constraints, and cascade deletion policies."
                    : selectedDomain === "API_CONTRACTS"
                    ? "REST endpoint interfaces, payload structures, and error handling."
                    : selectedDomain === "AUTHORIZATION"
                    ? "Data isolation rules and Row-Level Security (RLS) enforcement."
                    : "Architecture specifications and implementation implications."}
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter domain items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              {currentDomainItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h3>
                      <div className="text-[11px] text-slate-400 mt-0.5">Priority: {item.priority}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {item.simpleExplanation}
                  </p>

                  <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-1">
                    <div className="text-[11px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" /> Why It Matters
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{item.whyItMatters}</p>
                  </div>

                  {viewMode === "technical" && (
                    <div className="p-3 rounded-lg bg-slate-950 text-slate-200 font-mono text-xs border border-slate-800 space-y-1">
                      <div className="text-slate-400 font-sans text-[11px] uppercase font-bold tracking-wider">
                        Technical Specification
                      </div>
                      <div className="text-slate-300 leading-relaxed pt-1">
                        {item.technicalSpecification}
                      </div>
                      {item.affectedEntities?.length > 0 && (
                        <div className="text-slate-400 text-[11px] pt-1">
                          Entities: {item.affectedEntities.join(", ")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {currentDomainItems.length === 0 && (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                  No items found matching your filter.
                </div>
              )}
            </div>

            {/* Special Database Sub-Views: Relations & State Transitions */}
            {selectedDomain === "DATABASE" && blueprint.entityRelationships?.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Entity Relationships & Foreign Keys
                </div>
                <div className="space-y-2">
                  {blueprint.entityRelationships.map((rel) => (
                    <div
                      key={rel.id}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                        <span>{rel.fromEntity}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span>{rel.toEntity}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                          {rel.relationType}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">{rel.simpleMeaning}</p>
                      {viewMode === "technical" && (
                        <code className="block text-[11px] text-blue-600 dark:text-blue-400 font-mono">
                          FK: {rel.foreignKey} (ON DELETE {rel.onDelete})
                        </code>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Special API Sub-Views: Conceptual API Contracts */}
            {selectedDomain === "API_CONTRACTS" && blueprint.apiContracts?.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  API Endpoints & Error Codes
                </div>
                <div className="space-y-3">
                  {blueprint.apiContracts.map((api) => (
                    <div
                      key={api.id}
                      className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                            api.method === "GET"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : api.method === "POST"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                          }`}
                        >
                          {api.method}
                        </span>
                        <code className="font-mono font-semibold text-slate-900 dark:text-white">{api.endpoint}</code>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">{api.purpose}</p>

                      {viewMode === "technical" && (
                        <div className="space-y-1.5 pt-1 border-t border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                          <div className="text-slate-500">
                            <strong>Input:</strong> {api.inputPayload}
                          </div>
                          <div className="text-slate-500">
                            <strong>Output:</strong> {api.outputPayload}
                          </div>
                          <div className="text-slate-500">
                            <strong>Rate Limit:</strong> {api.rateLimitPolicy}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FEATURE TRACEABILITY MATRIX */}
      {activeTab === "traceability" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Feature-to-Engineering Traceability
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Every product feature maps to concrete screens, backend services, database tables, and verification tests.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="pb-2.5 font-semibold">Feature</th>
                  <th className="pb-2.5 font-semibold">Screens & UI</th>
                  <th className="pb-2.5 font-semibold">Data Entities</th>
                  <th className="pb-2.5 font-semibold">APIs & Services</th>
                  <th className="pb-2.5 font-semibold">Authorization & Test Cases</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {blueprint.traceabilityMatrix?.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 font-semibold text-slate-900 dark:text-white align-top">
                      {t.featureTitle}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400 align-top">
                      {t.screens?.join(", ")}
                    </td>
                    <td className="py-3 font-mono text-blue-600 dark:text-blue-400 align-top">
                      {t.dataEntities?.join(", ")}
                    </td>
                    <td className="py-3 font-mono text-purple-600 dark:text-purple-400 align-top">
                      <div>{t.apiEndpoints?.join(", ")}</div>
                      <div className="text-[11px] text-slate-500">{t.backendServices?.join(", ")}</div>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400 align-top space-y-1">
                      <div className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                        🔒 {t.authorizationRules?.join(", ")}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        🧪 {t.testCases?.join("; ")}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TECHNICAL DECISIONS & TRADEOFFS */}
      {activeTab === "decisions" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Technical Recommendations & Stack Decisions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review Aigenstra&apos;s proportional stack recommendations, evaluate honest tradeoffs, and confirm your preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {blueprint.recommendations?.map((rec) => (
              <div
                key={rec.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {rec.area}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{rec.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        rec.status === "USER_CONFIRMED"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      {rec.status === "USER_CONFIRMED" ? "Confirmed" : "Recommended"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-500 font-semibold">Requirement</div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{rec.requirement}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-1.5">
                  <div className="text-xs font-bold text-indigo-800 dark:text-indigo-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Aigenstra Recommendation: {rec.recommendedOption}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{rec.whyRecommended}</p>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-indigo-200/50 dark:border-indigo-800/40">
                    <strong>Tradeoffs / Limitations:</strong> {rec.tradeoffs}
                  </div>
                </div>

                {rec.alternatives?.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-500">Viable Alternatives</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {rec.alternatives.map((alt, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1"
                        >
                          <div className="font-bold text-slate-900 dark:text-white">{alt.name}</div>
                          <p className="text-slate-600 dark:text-slate-400">{alt.description}</p>
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Pros: {alt.pros}</div>
                          <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">Cons: {alt.cons}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Decision Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleDecision(rec.id, "USER_CONFIRMED", rec.recommendedOption)}
                    disabled={isUpdating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
                  >
                    <Check className="w-3.5 h-3.5" /> Accept Recommendation
                  </button>
                  <button
                    onClick={() => handleDecision(rec.id, "DEFERRED")}
                    disabled={isUpdating}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 transition"
                  >
                    Decide Later
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ENGINEERING READINESS & CHANGE IMPACT */}
      {activeTab === "readiness" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Engineering Readiness & Change Impact
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Factual readiness analysis across technical domains with simulated downstream change impacts.
              </p>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                readiness.status === "READY"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : readiness.status === "NEEDS_DECISIONS"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                  : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
              }`}
            >
              Overall: {readiness.status.replace("_", " ")}
            </span>
          </div>

          {/* Blockers */}
          {readiness.blockers?.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Active Architecture Blockers ({readiness.blockers.length})
              </div>
              <div className="space-y-2">
                {readiness.blockers.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-lg bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-xs space-y-1"
                  >
                    <div className="font-bold text-rose-800 dark:text-rose-200">{b.title}</div>
                    <p className="text-slate-600 dark:text-slate-400">{b.description}</p>
                    <div className="text-slate-900 dark:text-white font-medium pt-1">
                      <strong>Resolution:</strong> {b.resolution}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Change Impact Analysis */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-indigo-600" /> Change Impact Simulator
            </div>
            <p className="text-xs text-slate-500">
              When a core product assumption or requirement changes, Aigenstra maps all affected engineering subsystems.
            </p>
            <div className="space-y-3">
              {readiness.changeImpacts?.map((ci, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-2"
                >
                  <div className="font-bold text-slate-900 dark:text-white">
                    Scenario: &ldquo;{ci.productChange}&rdquo;
                  </div>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400 pl-4 list-disc">
                    {ci.affectedEngineeringAreas?.map((area, aIdx) => (
                      <li key={aIdx}>{area}</li>
                    ))}
                  </ul>
                  <div className="p-2.5 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200 text-[11px] font-medium border border-blue-100 dark:border-blue-900">
                    💡 <strong>Architectural Recommendation:</strong> {ci.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
