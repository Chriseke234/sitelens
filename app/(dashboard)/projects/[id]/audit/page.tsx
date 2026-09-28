"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  SearchCheck,
  Sparkles,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  Layers,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { AuditFinding } from "@/types";

export default function AuditPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);
  const [audits, setAudits] = useState<any[]>([]);
  const [findings, setFindings] = useState<AuditFinding[]>([]);

  useEffect(() => {
    fetchAuditData();
  }, [projectId]);

  const fetchAuditData = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/audit`);
      const data = await res.json();
      if (res.ok && data.audits) {
        setAudits(data.audits);
      }
      const fixRes = await fetch(`/api/projects/${projectId}/fix-queue`);
      const fixData = await fixRes.json();
      if (fixRes.ok && fixData.findings) {
        setFindings(fixData.findings);
      }
    } catch (err) {
      console.error("Failed to load audit data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAudit = async () => {
    setAuditing(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/audit`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        await fetchAuditData();
      }
    } catch (err) {
      console.error("Run project audit error:", err);
    } finally {
      setAuditing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const latestAudit = audits[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <SearchCheck className="h-3.5 w-3.5" />
              Multi-Agent 9-Category Project Audit
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              Project Audit & Readiness Verification
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Run specialized audits across Product, UX, Frontend, Backend, Security, Performance, SEO, Accessibility, and Code Quality.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunAudit}
            disabled={auditing}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
          >
            {auditing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Auditing Workspace...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                {latestAudit ? "Run Re-Audit" : "Run Multi-Agent Audit"}
              </>
            )}
          </button>
        </div>
      </div>

      {!latestAudit ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <SearchCheck className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            No Project Audits Executed Yet
          </h2>
          <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Click "Run Multi-Agent Audit" above to analyze your product across all 9 engineering categories.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Audit Results Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Category Readiness Overview
              </h3>
              <span className="text-xs text-slate-500">
                Audit completed on {new Date(latestAudit.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Object.entries(latestAudit.readiness_scores || {}).map(([key, score]: [string, any]) => (
                <div key={key} className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
                  <div className="capitalize text-xs font-bold text-slate-500">{key.replace("_", " ")}</div>
                  <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{score}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Findings System List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Identified Audit Findings ({findings.length})
            </h3>

            {findings.map((f) => {
              const isCritical = f.severity === "critical";
              return (
                <div
                  key={f.id}
                  className={`rounded-2xl border p-6 transition-all ${
                    isCritical
                      ? "border-rose-200 bg-rose-50/20 dark:border-rose-950/40 dark:bg-slate-900"
                      : "border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        [{f.finding_code}]
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {f.title}
                      </h4>
                    </div>

                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                        isCritical
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {f.severity} SEVERITY
                    </span>
                  </div>

                  {/* Two-Layer Explanations */}
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-950/50 dark:bg-blue-950/20">
                      <span className="text-xs font-bold text-blue-800 dark:text-blue-300">
                        Layer 1 (Simple: What this means)
                      </span>
                      <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
                        {f.simple_explanation}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Layer 2 (Technical Details)
                      </span>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                        {f.technical_explanation}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-500">
                      Impact: {f.potential_impact}
                    </span>
                    <a
                      href={`/projects/${projectId}/fix-queue`}
                      className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Generate Fix Prompt →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
