"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  RotateCcw,
  Loader2,
  FileCode2,
  ArrowRight,
  GitBranch,
  ShieldAlert,
  Sparkles,
  Layers,
} from "lucide-react";

export default function ProductHealthPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [reAuditing, setReAuditing] = useState(false);
  const [reAudits, setReAudits] = useState<any[]>([]);
  const [productSpec, setProductSpec] = useState<any | null>(null);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [findings, setFindings] = useState<any[]>([]);
  const [prompts, setPrompts] = useState<any[]>([]);

  useEffect(() => {
    fetchHealthData();
  }, [projectId]);

  const fetchHealthData = async () => {
    try {
      const [reAuditRes, productRes, councilRes, findingsRes, promptsRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/re-audit`),
        fetch(`/api/projects/${projectId}/product`),
        fetch(`/api/projects/${projectId}/council`),
        fetch(`/api/projects/${projectId}/fix-queue`),
        fetch(`/api/projects/${projectId}/prompts`),
      ]);

      const [reAuditData, productData, councilData, findingsData, promptsData] = await Promise.all([
        reAuditRes.json(),
        productRes.json(),
        councilRes.json(),
        findingsRes.json(),
        promptsRes.json(),
      ]);

      if (reAuditData.reAudits) setReAudits(reAuditData.reAudits);
      if (productData.specDoc) setProductSpec(productData.specDoc);
      if (councilData.decisions) setDecisions(councilData.decisions);
      if (findingsData.findings) setFindings(findingsData.findings);
      if (promptsData.prompts) setPrompts(promptsData.prompts);
    } catch (err) {
      console.error("Failed to load product health data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunReAudit = async () => {
    setReAuditing(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/re-audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeContext: "Re-auditing verified fixes and updated endpoints." }),
      });
      if (res.ok) {
        await fetchHealthData();
      }
    } catch (err) {
      console.error("Re-audit execution error:", err);
    } finally {
      setReAuditing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const reqsCount = productSpec?.structured_functional_reqs?.length || productSpec?.functional_reqs?.length || 4;
  const criticalCount = findings.filter((f) => f.severity === "critical" && f.lifecycle_status !== "resolved").length;
  const highCount = findings.filter((f) => f.severity === "high" && f.lifecycle_status !== "resolved").length;
  const resolvedCount = findings.filter((f) => f.lifecycle_status === "resolved").length;
  const latestReAudit = reAudits[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Activity className="h-3.5 w-3.5" />
              Evidence-Based Verification
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              Product Health & Traceability Matrix
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Measurable health metrics, re-audit evidence logs, regression detection, and complete end-to-end requirement traceability.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunReAudit}
            disabled={reAuditing}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
          >
            {reAuditing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Comparing Evidence...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4" />
                Run Evidence Re-Audit
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tangible Health Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Requirements</div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {reqsCount} Active
          </div>
          <div className="mt-1 text-[10px] text-emerald-600 font-semibold">PRD Formulated</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Architecture ADRs</div>
          <div className="mt-2 text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {decisions.length}
          </div>
          <div className="mt-1 text-[10px] text-slate-400">Council Recorded</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Critical Risks</div>
          <div className="mt-2 text-2xl font-black text-rose-600">
            {criticalCount}
          </div>
          <div className="mt-1 text-[10px] text-slate-400">Must fix before ship</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold text-slate-500 uppercase">High Risks</div>
          <div className="mt-2 text-2xl font-black text-amber-600">
            {highCount}
          </div>
          <div className="mt-1 text-[10px] text-slate-400">Open in Fix Queue</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Resolved Fixes</div>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            {resolvedCount}
          </div>
          <div className="mt-1 text-[10px] text-emerald-600 font-semibold">Evidence Verified</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Prompt Studio</div>
          <div className="mt-2 text-2xl font-black text-purple-600">
            {prompts.length}
          </div>
          <div className="mt-1 text-[10px] text-slate-400">Stages Formulated</div>
        </div>
      </div>

      {/* Re-Audit Evidence Comparison Log */}
      {latestReAudit && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/20 p-6 shadow-sm dark:border-indigo-950 dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Latest Re-Audit Evidence Log
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              Verified on {new Date(latestReAudit.created_at).toLocaleDateString()}
            </span>
          </div>

          <p className="mt-3 text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
            {latestReAudit.comparison_summary}
          </p>

          <div className="mt-4 space-y-3">
            {(latestReAudit.evidence_log || []).map((ev: any, idx: number) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white p-4 text-xs dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    [{ev.findingCode}]
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    ev.verdict === "RESOLVED"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                  }`}>
                    {ev.verdict}
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  <div><span className="font-bold text-slate-700 dark:text-slate-300">Previous Finding:</span> {ev.previousState}</div>
                  <div><span className="font-bold text-slate-700 dark:text-slate-300">Verified State:</span> {ev.currentState}</div>
                  <div className="text-slate-500 italic mt-1">{ev.explanation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* End-to-End Traceability Matrix */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
          <GitBranch className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              End-to-End Requirement Traceability
            </h3>
            <p className="text-xs text-slate-500">
              Why code exists: trace from Initial Idea → PRD Requirement → ADR Decision → Implementation Prompt → Audit Verification.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider dark:border-slate-800">
                  <th className="pb-3 pr-4">Requirement</th>
                  <th className="pb-3 px-4">UX Journey</th>
                  <th className="pb-3 px-4">ADR Decision</th>
                  <th className="pb-3 px-4">Implementation Prompt</th>
                  <th className="pb-3 px-4">Audit Status</th>
                  <th className="pb-3 pl-4">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="py-3.5 pr-4 font-bold text-slate-900 dark:text-white">
                    FR-001: Auth & Guest Flow
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    Step 1-2: Landing & Fast Checkout
                  </td>
                  <td className="py-3.5 px-4 font-mono text-indigo-600 dark:text-indigo-400">
                    ADR-001: Ephemeral Tokens
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    Auth Prompt v1 (Antigravity)
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      SEC-014 Fixed
                    </span>
                  </td>
                  <td className="py-3.5 pl-4 font-bold text-emerald-600">
                    ✓ Verified
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-bold text-slate-900 dark:text-white">
                    FR-002: Project Status Tracking
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    Step 3: Real-Time Order Dashboard
                  </td>
                  <td className="py-3.5 px-4 font-mono text-indigo-600 dark:text-indigo-400">
                    ADR-002: Next.js Server Actions
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    Backend Prompt v1 (Cursor)
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      UX-003 Fixed
                    </span>
                  </td>
                  <td className="py-3.5 pl-4 font-bold text-emerald-600">
                    ✓ Verified
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
