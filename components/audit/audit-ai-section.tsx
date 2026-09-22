"use client";

import React, { useState, useEffect } from "react";
import { DBStoredAIReport } from "@/lib/ai/audit-report";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Sparkles, AlertCircle, CheckCircle2, ShieldAlert, ArrowRight } from "lucide-react";

interface AuditAISectionProps {
  auditId: string;
}

export function AuditAISection({ auditId }: AuditAISectionProps) {
  const [report, setReport] = useState<DBStoredAIReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAIReport() {
      try {
        setLoading(true);
        const res = await fetch(`/api/audits/${auditId}/ai-report`);
        const json = await res.json();

        if (res.ok && json.data) {
          setReport(json.data);
        } else {
          setError(json.error || "Failed to load AI interpretation.");
        }
      } catch (err: any) {
        setError("Network error fetching AI analysis.");
      } finally {
        setLoading(false);
      }
    }

    fetchAIReport();
  }, [auditId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-8 text-center dark:border-blue-900/40 dark:bg-blue-950/20">
        <Spinner className="mx-auto h-8 w-8 text-blue-600 mb-3" />
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Synthesizing AI Report Interpretation...
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Translating deterministic audit evidence into actionable executive summary.
        </p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-900/50 dark:bg-amber-950/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">AI Report Interpretation Unavailable</h4>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              {error || "AI analysis is not available for this audit yet."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Header Card */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/80 to-indigo-50/40 p-6 shadow-sm dark:border-blue-900/60 dark:from-blue-950/30 dark:to-indigo-950/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-blue-100 pb-4 dark:border-blue-900/50">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Executive Interpretation</h3>
              <p className="text-xs text-slate-500">
                Model: <span className="font-mono text-slate-700 dark:text-slate-300">{report.model}</span> | Prompt Version: <span className="font-mono text-slate-700 dark:text-slate-300">{report.prompt_version}</span>
              </p>
            </div>
          </div>
          <Badge variant="outline" className="w-fit border-blue-300 bg-white text-blue-700 dark:border-blue-800 dark:bg-slate-900 dark:text-blue-300">
            Evidence-Based Analysis
          </Badge>
        </div>

        <div className="mt-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {report.summary}
        </div>
      </div>

      {/* Key Findings List */}
      {report.key_findings && report.key_findings.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Key Strategic Findings</h4>
          <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs text-slate-600 dark:text-slate-300">
            {report.key_findings.map((finding, idx) => (
              <li key={idx} className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Priority Action Matrix */}
      {report.priority_actions && report.priority_actions.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Recommended Priority Action Items</h4>

          <div className="space-y-4">
            {report.priority_actions.map((act, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-slate-100 bg-slate-50/80 p-4 text-xs dark:border-slate-800 dark:bg-slate-950/60"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Evidence: <span className="font-mono text-slate-600 dark:text-slate-400">{act.evidence}</span>
                  </span>
                  <PriorityBadge priority={act.priority} />
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 mt-2">
                  <div className="rounded border border-slate-200/60 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Why it matters:</span>
                    <p className="text-slate-600 dark:text-slate-400">{act.why_it_matters}</p>
                  </div>
                  <div className="rounded border border-slate-200/60 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                    <span className="font-bold text-blue-700 dark:text-blue-300 block mb-0.5">Recommended action:</span>
                    <p className="text-slate-600 dark:text-slate-400">{act.recommended_action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mandatory AI Disclaimer */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950">
        <p className="italic text-center">
          Notice: AI-generated analysis is provided as an interpretation of the automated audit results and should be reviewed alongside the underlying evidence.
        </p>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  switch (priority.toLowerCase()) {
    case "critical":
      return <Badge className="bg-rose-600 text-white">Critical</Badge>;
    case "high":
      return <Badge className="bg-amber-600 text-white">High</Badge>;
    case "medium":
      return <Badge className="bg-blue-600 text-white">Medium</Badge>;
    default:
      return <Badge variant="secondary">Low</Badge>;
  }
}
