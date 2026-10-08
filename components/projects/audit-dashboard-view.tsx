"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileCode,
  FolderGit2,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  PlusCircle,
  EyeOff,
  Filter,
  ExternalLink,
  ArrowRight,
  Loader2,
  Terminal,
  Zap,
  AlertOctagon,
  Activity,
  History,
  GitCompare,
  RotateCcw,
} from "lucide-react";
import {
  AuditSnapshot,
  Phase7Finding,
  AuditScope,
  CodingAgentProfile,
  FindingSeverityLevel,
  AuditDimension,
  AuditVerification,
  ProjectHealthSnapshot,
  VerificationStatus,
} from "@/types";

interface AuditDashboardViewProps {
  projectId: string;
  projectName: string;
  initialAudit: AuditSnapshot | null;
  hasConnectedRepo: boolean;
  onRefresh: () => void;
}

export function AuditDashboardView({
  projectId,
  projectName,
  initialAudit,
  hasConnectedRepo,
  onRefresh,
}: AuditDashboardViewProps) {
  const [audit, setAudit] = useState<AuditSnapshot | null>(initialAudit);
  const [health, setHealth] = useState<ProjectHealthSnapshot | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isVerifyingFinding, setIsVerifyingFinding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedScope, setSelectedScope] = useState<AuditScope>("FULL");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Expanded technical views
  const [expandedFindings, setExpandedFindings] = useState<Set<string>>(new Set());

  // Verification Result Modal
  const [activeVerificationResult, setActiveVerificationResult] = useState<{
    finding: Phase7Finding;
    verification: AuditVerification;
  } | null>(null);

  // Fix Prompt Modal
  const [activeFixFinding, setActiveFixFinding] = useState<Phase7Finding | null>(null);
  const [isRevisedPrompt, setIsRevisedPrompt] = useState(false);
  const [targetAgent, setTargetAgent] = useState<CodingAgentProfile>("Antigravity");
  const [compiledPrompt, setCompiledPrompt] = useState<string | null>(null);
  const [isCompilingPrompt, setIsCompilingPrompt] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [taskAddedFindingId, setTaskAddedFindingId] = useState<string | null>(null);

  // Dismiss Modal
  const [dismissingFinding, setDismissingFinding] = useState<Phase7Finding | null>(null);
  const [dismissRationale, setDismissRationale] = useState("");

  const toggleExpand = (id: string) => {
    setExpandedFindings((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: selectedScope }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to run audit analysis.");
      }

      setAudit(data.audit);
      onRefresh();

      // Refresh health
      const healthRes = await fetch(`/api/projects/${projectId}/audit/health`);
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setHealth(healthData.health);
      }
    } catch (err: any) {
      setError(err.message || "Failed to run project audit.");
    } finally {
      setIsAuditing(false);
    }
  };

  const handleVerifyFinding = async (finding: Phase7Finding) => {
    setIsVerifyingFinding(finding.id);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/audit/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ findingId: finding.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed.");
      }

      // Update in local state
      setAudit((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          findings: prev.findings.map((f) => (f.id === finding.id ? data.finding : f)),
        };
      });

      if (data.health) {
        setHealth(data.health);
      }

      setActiveVerificationResult({
        finding: data.finding,
        verification: data.verification,
      });
    } catch (err: any) {
      setError(err.message || "Targeted verification failed.");
    } finally {
      setIsVerifyingFinding(null);
    }
  };

  const handleGenerateRevisedPrompt = async (finding: Phase7Finding, verification: AuditVerification) => {
    setActiveFixFinding(finding);
    setIsRevisedPrompt(true);
    setCompiledPrompt(null);
    setCopiedPrompt(false);
    setIsCompilingPrompt(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/audit/findings/${finding.id}/revised-prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetAgent }),
      });

      const data = await res.json();
      if (res.ok && data.prompt) {
        setCompiledPrompt(data.prompt);
      } else {
        throw new Error(data.error || "Failed to compile revised prompt.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCompilingPrompt(false);
    }
  };

  const handleOpenFixPrompt = async (finding: Phase7Finding) => {
    setActiveFixFinding(finding);
    setIsRevisedPrompt(false);
    setCompiledPrompt(null);
    setCopiedPrompt(false);
    setIsCompilingPrompt(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/audit/findings/${finding.id}/prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetAgent }),
      });

      const data = await res.json();
      if (res.ok && data.promptText) {
        setCompiledPrompt(data.promptText);
      } else {
        throw new Error(data.error || "Failed to compile prompt.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCompilingPrompt(false);
    }
  };

  const handleAgentChange = async (agent: CodingAgentProfile) => {
    setTargetAgent(agent);
    if (!activeFixFinding) return;
    setIsCompilingPrompt(true);

    try {
      const url = isRevisedPrompt
        ? `/api/projects/${projectId}/audit/findings/${activeFixFinding.id}/revised-prompt`
        : `/api/projects/${projectId}/audit/findings/${activeFixFinding.id}/prompt`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetAgent: agent }),
      });

      const data = await res.json();
      if (res.ok) {
        setCompiledPrompt(data.prompt || data.promptText);
      }
    } catch (err) {
      console.error("Agent change compile error:", err);
    } finally {
      setIsCompilingPrompt(false);
    }
  };

  const handleConvertFindingToTask = async (finding: Phase7Finding) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/audit/findings/${finding.id}/task`, {
        method: "POST",
      });
      if (res.ok) {
        setTaskAddedFindingId(finding.id);
        setTimeout(() => setTaskAddedFindingId(null), 3500);
      }
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  const handleDismissFinding = async () => {
    if (!dismissingFinding) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/audit/findings/${dismissingFinding.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DISMISSED",
          rationale: dismissRationale || "User marked as not applicable or acceptable risk.",
        }),
      });

      if (res.ok) {
        setAudit((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            findings: prev.findings.map((f) =>
              f.id === dismissingFinding.id
                ? {
                    ...f,
                    status: "NOT_APPLICABLE",
                    userOverride: {
                      action: "DISMISSED",
                      rationale: dismissRationale,
                      timestamp: new Date().toISOString(),
                    },
                  }
                : f
            ),
          };
        });
        setDismissingFinding(null);
        setDismissRationale("");
      }
    } catch (err) {
      console.error("Failed to dismiss finding:", err);
    }
  };

  const getSeverityBadge = (severity: FindingSeverityLevel) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-500/20">
            <ShieldAlert className="w-2.5 h-2.5" /> Critical
          </span>
        );
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-500/20">
            <AlertTriangle className="w-2.5 h-2.5" /> High
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-950/70 dark:text-yellow-300 border border-yellow-500/20">
            Medium
          </span>
        );
      case "LOW":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-500/20">
            Low
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Info
          </span>
        );
    }
  };

  const getVerificationBadge = (finding: Phase7Finding) => {
    if (finding.verificationStatus === "REGRESSED") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-sm">
          <AlertOctagon className="w-2.5 h-2.5" /> Regressed
        </span>
      );
    }
    if (finding.verificationStatus === "RESOLVED" || finding.status === "VERIFIED") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/20">
          <CheckCircle2 className="w-2.5 h-2.5" /> Verified Resolved
        </span>
      );
    }
    if (finding.verificationStatus === "PARTIALLY_RESOLVED") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-500/20">
          <RotateCcw className="w-2.5 h-2.5" /> Partially Resolved
        </span>
      );
    }
    if (finding.verificationStatus === "STILL_PRESENT") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-500/20">
          Still Present
        </span>
      );
    }
    if (finding.verificationStatus === "UNABLE_TO_VERIFY") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          Unverified
        </span>
      );
    }
    return null;
  };

  // Filter findings
  const filteredFindings = (audit?.findings || []).filter((f) => {
    if (selectedSeverity !== "ALL" && f.severity !== selectedSeverity) return false;
    if (selectedCategory !== "ALL" && f.category !== selectedCategory) return false;
    if (selectedStatus === "RESOLVED" && f.status !== "VERIFIED" && f.verificationStatus !== "RESOLVED") return false;
    if (selectedStatus === "REGRESSED" && f.verificationStatus !== "REGRESSED") return false;
    if (selectedStatus === "OPEN" && (f.status === "VERIFIED" || f.status === "NOT_APPLICABLE")) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Project Audit & Verification Hub
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  Phase 8
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verifies implementation fixes, catches regressions, and tracks factual project health.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value as AuditScope)}
              disabled={isAuditing || !hasConnectedRepo}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="FULL">Scope: Full Project Re-Audit</option>
              <option value="PRODUCT">Scope: Product Requirements</option>
              <option value="SECURITY">Scope: Security & Authorization</option>
              <option value="ENGINEERING">Scope: Engineering & Backend</option>
              <option value="UX">Scope: UX & User Journeys</option>
              <option value="UI">Scope: UI & Screens</option>
              <option value="TESTING">Scope: Test Coverage</option>
            </select>

            <button
              onClick={handleRunAudit}
              disabled={isAuditing || !hasConnectedRepo}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
            >
              {isAuditing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Auditing Codebase...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Re-Audit Project</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Repository Not Connected Banner */}
      {!hasConnectedRepo && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FolderGit2 className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                No Repository Connected Yet
              </h3>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                Aigenstra needs to inspect your codebase before it can audit against your blueprint.
              </p>
            </div>
          </div>
          <Link
            href={`/projects/${projectId}/intelligence`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-sm self-start sm:self-auto"
          >
            <span>Connect Project Repository</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl p-4 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs font-medium">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div className="flex-1">{error}</div>
        </div>
      )}

      {/* FACTUAL PROJECT HEALTH OVERVIEW BAR (Phase 8 - Zero Fake Scores) */}
      {audit && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Project Health & Verification Status
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Status within scope:</span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  (health?.healthStatus || (audit.summary.criticalCount > 0 ? "HIGH_RISK" : "HEALTHY_WITHIN_SCOPE")) === "HIGH_RISK"
                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                    : (health?.healthStatus || "") === "NEEDS_ATTENTION"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                }`}
              >
                {health?.healthStatus?.replace(/_/g, " ") || (audit.summary.criticalCount > 0 ? "HIGH RISK" : "HEALTHY WITHIN SCOPE")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
              <div className="text-[10px] font-semibold text-slate-500 uppercase">Critical Findings</div>
              <div className="text-lg font-black text-rose-600 mt-0.5">{audit.summary.criticalCount}</div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
              <div className="text-[10px] font-semibold text-slate-500 uppercase">High Findings</div>
              <div className="text-lg font-black text-amber-600 mt-0.5">{audit.summary.highCount}</div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
              <div className="text-[10px] font-semibold text-slate-500 uppercase">Regressions</div>
              <div className={`text-lg font-black mt-0.5 ${(health?.regressionCount || 0) > 0 ? "text-rose-600" : "text-slate-700 dark:text-slate-300"}`}>
                {health?.regressionCount || audit.findings.filter((f) => f.verificationStatus === "REGRESSED").length}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
              <div className="text-[10px] font-semibold text-slate-500 uppercase">Blueprint Alignment</div>
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1.5">
                {health?.blueprintAlignment || "ALIGNED"}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-center col-span-2 sm:col-span-1">
              <div className="text-[10px] font-semibold text-slate-500 uppercase">Audit Recency</div>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1.5">
                {audit.completedAt ? "Up to date" : "Just now"}
              </div>
            </div>
          </div>

          {/* Actionable Next Priority */}
          <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl flex items-start gap-2.5 text-xs">
            <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Recommended Action: </span>
              <span className="text-slate-600 dark:text-slate-300">
                {health?.recommendedNextAction || audit.summary.nextRecommendedAction || "All inspected requirements match code evidence."}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Finding Controls */}
      {audit && audit.findings.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold px-2">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="SECURITY">Security</option>
              <option value="AUTHORIZATION">Authorization</option>
              <option value="DATABASE">Database</option>
              <option value="UI">UI & Screens</option>
              <option value="TESTING">Testing</option>
              <option value="PRODUCT">Product</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open Issues</option>
              <option value="RESOLVED">Verified Resolved</option>
              <option value="REGRESSED">Regressed Only</option>
            </select>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredFindings.length} of {audit.findings.length} findings
          </span>
        </div>
      )}

      {/* Findings List */}
      {audit && filteredFindings.length > 0 && (
        <div className="space-y-4">
          {filteredFindings.map((finding) => {
            const isExpanded = expandedFindings.has(finding.id);
            const isDismissed = finding.status === "NOT_APPLICABLE";
            const isResolved = finding.status === "VERIFIED" || finding.verificationStatus === "RESOLVED";
            const isRegressed = finding.verificationStatus === "REGRESSED";
            const isVerifying = isVerifyingFinding === finding.id;

            return (
              <div
                key={finding.id}
                className={`bg-white dark:bg-slate-900 border ${
                  isRegressed
                    ? "border-rose-400 dark:border-rose-700 ring-2 ring-rose-500/10"
                    : isResolved
                    ? "border-emerald-200 dark:border-emerald-900/60 opacity-80"
                    : isDismissed
                    ? "border-slate-100 dark:border-slate-800/40 opacity-60"
                    : finding.severity === "CRITICAL"
                    ? "border-rose-200 dark:border-rose-900/60"
                    : finding.severity === "HIGH"
                    ? "border-amber-200 dark:border-amber-900/60"
                    : "border-slate-200 dark:border-slate-800"
                } rounded-2xl p-6 shadow-sm space-y-4 transition`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {finding.findingCode}
                    </span>
                    {getSeverityBadge(finding.severity)}
                    {getVerificationBadge(finding)}
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {finding.category}
                    </span>
                    {finding.confidence && (
                      <span className="text-[10px] text-slate-400">
                        {finding.confidence} confidence
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* VERIFY FIX BUTTON (Phase 8 Core Action) */}
                    <button
                      onClick={() => handleVerifyFinding(finding)}
                      disabled={isVerifying}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 rounded-xl transition border border-indigo-200 dark:border-indigo-800 disabled:opacity-50"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Verify Fix</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleConvertFindingToTask(finding)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
                    >
                      {taskAddedFindingId === finding.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600">Task Created!</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Add to Tasks</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenFixPrompt(finding)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Fix Prompt</span>
                    </button>

                    <button
                      onClick={() => setDismissingFinding(finding)}
                      title="Dismiss finding"
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Finding Title & Layer 1 Beginner Explanation */}
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {finding.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {finding.summary || finding.description}
                  </p>
                </div>

                {/* Why It Matters & Recommendation Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                      Why it matters
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {finding.impact}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                      Recommended action
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {finding.recommendation}
                    </span>
                  </div>
                </div>

                {/* Collapsible Layer 2: Deep Technical Details for Vibe Coders */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => toggleExpand(finding.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isExpanded ? "Hide Technical Details" : "View Technical Details & Evidence"}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="mt-4 space-y-3 pl-4 border-l-2 border-indigo-200 dark:border-indigo-900">
                      {finding.affectedFile && (
                        <div className="text-xs">
                          <span className="font-semibold text-slate-500">Target File: </span>
                          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                            {finding.affectedFile}
                          </code>
                        </div>
                      )}

                      {finding.expectedBehavior && (
                        <div className="text-xs">
                          <span className="font-semibold text-slate-500">Expected: </span>
                          <span className="text-slate-700 dark:text-slate-300">
                            {finding.expectedBehavior}
                          </span>
                        </div>
                      )}

                      {finding.observedBehavior && (
                        <div className="text-xs">
                          <span className="font-semibold text-slate-500">Observed: </span>
                          <span className="text-slate-700 dark:text-slate-300">
                            {finding.observedBehavior}
                          </span>
                        </div>
                      )}

                      {finding.evidence?.snippet && (
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-slate-500">Evidence Snippet:</span>
                          <pre className="p-3 bg-slate-900 text-slate-100 text-[11px] font-mono rounded-xl overflow-x-auto max-h-40">
                            {finding.evidence.snippet}
                          </pre>
                        </div>
                      )}

                      {finding.verificationCriteria && finding.verificationCriteria.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-slate-500">
                            Acceptance Criteria:
                          </span>
                          <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                            {finding.verificationCriteria.map((crit, idx) => (
                              <li key={idx}>{crit}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State when no findings */}
      {audit && filteredFindings.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center shadow-sm space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            No Findings Matching Filter
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All audited requirements within this category match observed implementation evidence.
          </p>
        </div>
      )}

      {/* VERIFICATION RESULT & EVIDENCE DIFF MODAL (Phase 8) */}
      {activeVerificationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Verification Result — {activeVerificationResult.finding.findingCode}
                </h3>
              </div>
              <button
                onClick={() => setActiveVerificationResult(null)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Close
              </button>
            </div>

            {/* Status & Method Badge */}
            <div className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Verification Status
                </span>
                <div className="text-sm font-bold">
                  {activeVerificationResult.verification.status === "RESOLVED" && (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Issue Verified Resolved
                    </span>
                  )}
                  {activeVerificationResult.verification.status === "REGRESSED" && (
                    <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <AlertOctagon className="w-4 h-4" /> Critical Regression Detected
                    </span>
                  )}
                  {activeVerificationResult.verification.status === "PARTIALLY_RESOLVED" && (
                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <RotateCcw className="w-4 h-4" /> Partially Resolved
                    </span>
                  )}
                  {activeVerificationResult.verification.status === "STILL_PRESENT" && (
                    <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" /> Issue Remains Present
                    </span>
                  )}
                  {activeVerificationResult.verification.status === "UNABLE_TO_VERIFY" && (
                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" /> Unable to Verify Automatically
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right text-xs text-slate-500 space-y-0.5">
                <div>
                  <span className="font-semibold">Method: </span>
                  {activeVerificationResult.verification.verificationMethod}
                </div>
                <div>
                  <span className="font-semibold">Confidence: </span>
                  {activeVerificationResult.verification.confidence}
                </div>
              </div>
            </div>

            {/* Evidence Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white block">Expected Behavior</span>
                <p className="text-slate-600 dark:text-slate-300">
                  {activeVerificationResult.verification.expectedBehavior}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white block">Observed in Code</span>
                <p className="text-slate-600 dark:text-slate-300">
                  {activeVerificationResult.verification.observedBehavior}
                </p>
              </div>
            </div>

            {/* Code Snippet Evidence if present */}
            {activeVerificationResult.verification.currentEvidence?.snippet && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-500">Current Code Evidence:</span>
                <pre className="p-3.5 bg-slate-900 text-slate-100 text-[11px] font-mono rounded-xl overflow-x-auto max-h-48">
                  {activeVerificationResult.verification.currentEvidence.snippet}
                </pre>
              </div>
            )}

            {/* Action buttons inside modal */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveVerificationResult(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Close
              </button>

              {activeVerificationResult.verification.status !== "RESOLVED" && (
                <button
                  onClick={() => {
                    const { finding, verification } = activeVerificationResult;
                    setActiveVerificationResult(null);
                    handleGenerateRevisedPrompt(finding, verification);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Revised Fix Prompt</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FIX PROMPT DRAWER / MODAL */}
      {activeFixFinding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isRevisedPrompt ? "Revised Fix Prompt" : "Targeted Fix Prompt"} — {activeFixFinding.findingCode}
                </h3>
              </div>
              <button
                onClick={() => setActiveFixFinding(null)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Close
              </button>
            </div>

            {/* Target Agent Selector */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Format Prompt for Coding Agent:
              </span>
              <select
                value={targetAgent}
                onChange={(e) => handleAgentChange(e.target.value as CodingAgentProfile)}
                className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none"
              >
                <option value="Antigravity">Google Antigravity</option>
                <option value="Cursor">Cursor</option>
                <option value="Claude Code">Claude Code</option>
                <option value="Codex">Codex CLI</option>
                <option value="Generic">Generic LLM</option>
              </select>
            </div>

            {/* Prompt Preview */}
            <div className="relative">
              {isCompilingPrompt ? (
                <div className="h-64 flex flex-col items-center justify-center gap-2 bg-slate-950 rounded-xl text-slate-400 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  <span>Compiling architecture-preserving fix prompt...</span>
                </div>
              ) : (
                <pre className="p-4 bg-slate-950 text-slate-100 text-[11px] font-mono rounded-xl overflow-x-auto max-h-80 whitespace-pre-wrap">
                  {compiledPrompt}
                </pre>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">
                Preserves established database models and auth helpers.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (compiledPrompt) {
                      navigator.clipboard.writeText(compiledPrompt);
                      setCopiedPrompt(true);
                      setTimeout(() => setCopiedPrompt(false), 2000);
                    }
                  }}
                  disabled={!compiledPrompt || isCompilingPrompt}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Fix Prompt</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DISMISS FINDING MODAL */}
      {dismissingFinding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Dismiss Finding {dismissingFinding.findingCode}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide a rationale for why this finding does not apply to this project or is an accepted architectural decision.
            </p>
            <textarea
              value={dismissRationale}
              onChange={(e) => setDismissRationale(e.target.value)}
              placeholder="e.g. Intentionally deferred for MVP, or route is secured at reverse proxy layer."
              rows={3}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDismissingFinding(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDismissFinding}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl transition shadow-sm"
              >
                Confirm Dismissal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
