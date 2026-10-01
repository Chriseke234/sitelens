"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Wrench,
  Sparkles,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  ShieldAlert,
  AlertTriangle,
  FileCode,
  ShieldCheck,
  Filter,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { AuditFinding, SeverityLevel, FindingLifecycleStatus } from "@/types";

export default function FixQueuePage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [findings, setFindings] = useState<any[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [lifecycleFilter, setLifecycleFilter] = useState<string>("all");

  useEffect(() => {
    fetchFindings();
  }, [projectId]);

  const fetchFindings = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/fix-queue`);
      const data = await res.json();
      if (res.ok && data.findings) {
        setFindings(data.findings);
      }
    } catch (err) {
      console.error("Failed to load fix queue:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFixPrompt = async (findingId: string) => {
    setGeneratingId(findingId);
    try {
      const res = await fetch(`/api/projects/${projectId}/fix-queue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          findingId,
          action: "generate_fix_prompt",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        await fetchFindings();
      }
    } catch (err) {
      console.error("Generate fix prompt error:", err);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleUpdateLifecycle = async (findingId: string, lifecycleStatus: FindingLifecycleStatus) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/fix-queue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          findingId,
          action: "update_lifecycle",
          lifecycleStatus,
        }),
      });
      if (res.ok) {
        await fetchFindings();
      }
    } catch (err) {
      console.error("Update status error:", err);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const filteredFindings = findings.filter((f) => {
    if (severityFilter !== "all" && f.severity !== severityFilter) return false;
    if (lifecycleFilter !== "all" && (f.lifecycle_status || "open") !== lifecycleFilter) return false;
    return true;
  });

  const getConfidenceBadge = (confidence?: string) => {
    switch (confidence) {
      case "confirmed":
        return <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-black text-rose-800 dark:bg-rose-950 dark:text-rose-300">CONFIRMED</span>;
      case "likely":
        return <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800 dark:bg-amber-950 dark:text-amber-300">LIKELY</span>;
      case "potential":
        return <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-800 dark:bg-blue-950 dark:text-blue-300">POTENTIAL</span>;
      default:
        return <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-700 dark:bg-slate-800 dark:text-slate-300">UNVERIFIED</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Wrench className="h-3.5 w-3.5" />
            Findings & Fix Prompt Engine
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Findings, Evidence & Fix Loop
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Targeted 16-part Fix Prompts generated directly from audit findings with exact route and code evidence.
          </p>
        </div>

        {/* Severity & Lifecycle Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            <span>Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <span>Lifecycle:</span>
            <select
              value={lifecycleFilter}
              onChange={(e) => setLifecycleFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            >
              <option value="all">All Stages</option>
              <option value="open">Open</option>
              <option value="fix_prompt_generated">Fix Prompt Ready</option>
              <option value="user_implementing">User Implementing</option>
              <option value="ready_for_verification">Ready for Verification</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {filteredFindings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            No Findings Match Current Filters
          </h2>
          <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Run a 9-Agent Project Audit or change the filters above to inspect open finding records.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredFindings.map((f) => {
            const fixPrompt = f.fix_prompts?.[0] || f.fix_prompts;
            const currentLifecycle = f.lifecycle_status || f.status || "open";
            const isResolved = currentLifecycle === "resolved";

            return (
              <div
                key={f.id}
                className={`rounded-2xl border p-6 transition-all ${
                  isResolved
                    ? "border-emerald-200 bg-emerald-50/20 opacity-80 dark:border-emerald-950/40 dark:bg-slate-900"
                    : f.severity === "critical"
                    ? "border-rose-200 bg-rose-50/20 shadow-sm dark:border-rose-950/40 dark:bg-slate-900"
                    : "border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">
                      [{f.finding_code}]
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {f.title}
                    </h3>
                    {getConfidenceBadge(f.confidence)}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Lifecycle Status Selector */}
                    <select
                      value={currentLifecycle}
                      onChange={(e) => handleUpdateLifecycle(f.id, e.target.value as FindingLifecycleStatus)}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${
                        isResolved
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "border-slate-300 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                      }`}
                    >
                      <option value="open">1. OPEN</option>
                      <option value="fix_prompt_generated">2. FIX PROMPT READY</option>
                      <option value="user_implementing">3. USER IMPLEMENTING</option>
                      <option value="ready_for_verification">4. READY FOR VERIFICATION</option>
                      <option value="resolved">5. RESOLVED</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleGenerateFixPrompt(f.id)}
                      disabled={generatingId === f.id}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
                    >
                      {generatingId === f.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      {fixPrompt ? "Re-Generate Fix Prompt" : "Generate Fix Prompt"}
                    </button>
                  </div>
                </div>

                {/* Evidence & Technical Details Grid */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2.5">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                      <div className="font-bold text-slate-900 dark:text-white mb-1">Code & Route Evidence:</div>
                      <div className="font-mono text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                        {f.evidence || f.affected_file_or_route || "Route handler inspection"}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                      <div className="font-bold text-slate-900 dark:text-white mb-1">Simple Explanation:</div>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{f.simple_explanation}</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                      <div className="font-bold text-slate-900 dark:text-white mb-1">Recommended Fix:</div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{f.recommended_fix}</p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                      <div className="font-bold text-slate-900 dark:text-white mb-1">Verification Method:</div>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{f.verification_method || "Run automated test suite and check status code response."}</p>
                    </div>
                  </div>
                </div>

                {/* Generated Fix Prompt Code Block */}
                {fixPrompt && (
                  <div className="mt-5 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-slate-100 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-indigo-400" />
                        <span className="font-mono text-xs font-bold text-slate-300">
                          FIX_PROMPT_{f.finding_code}.md
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(fixPrompt.id, fixPrompt.prompt_text)}
                        className="flex items-center gap-1 rounded bg-indigo-600 px-3 py-1 text-[11px] font-bold text-white transition-all hover:bg-indigo-500"
                      >
                        {copiedId === fixPrompt.id ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            Copied to Clipboard!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copy Fix Prompt
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed">
                      {fixPrompt.prompt_text}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
