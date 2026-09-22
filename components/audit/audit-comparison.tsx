"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export interface AuditSummaryRecord {
  id: string;
  url: string;
  created_at: string;
  overall_score: number | null;
  seo_score: number | null;
  performance_score: number | null;
  accessibility_score: number | null;
  ux_score: number | null;
  trust_score: number | null;
  conversion_score: number | null;
}

interface AuditComparisonProps {
  currentAudit: AuditSummaryRecord;
  previousAudit?: AuditSummaryRecord | null;
}

export function AuditComparison({ currentAudit, previousAudit }: AuditComparisonProps) {
  if (!previousAudit) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 text-center">
        <p className="text-xs text-slate-500">
          No previous audit recorded for this domain. Run another audit of <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{currentAudit.url}</span> to start tracking score changes over time.
        </p>
      </div>
    );
  }

  const rows = [
    { label: "Overall Score", prev: previousAudit.overall_score, curr: currentAudit.overall_score },
    { label: "SEO", prev: previousAudit.seo_score, curr: currentAudit.seo_score },
    { label: "Performance", prev: previousAudit.performance_score, curr: currentAudit.performance_score },
    { label: "Accessibility", prev: previousAudit.accessibility_score, curr: currentAudit.accessibility_score },
    { label: "UX", prev: previousAudit.ux_score, curr: currentAudit.ux_score },
    { label: "Trust", prev: previousAudit.trust_score, curr: currentAudit.trust_score },
    { label: "Conversion", prev: previousAudit.conversion_score, curr: currentAudit.conversion_score },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Audit Score Comparison</h3>
          <p className="text-xs text-slate-500">
            Comparing audit from {new Date(previousAudit.created_at).toLocaleDateString()} against current audit ({new Date(currentAudit.created_at).toLocaleDateString()})
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950">
              <th className="py-2.5 px-3 font-semibold">Category</th>
              <th className="py-2.5 px-3 font-semibold text-right">Previous Score</th>
              <th className="py-2.5 px-3 font-semibold text-right">Current Score</th>
              <th className="py-2.5 px-3 font-semibold text-right">Score Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row, idx) => {
              const diff = row.prev !== null && row.curr !== null ? row.curr - row.prev : null;

              return (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">{row.label}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                    {row.prev !== null ? `${row.prev}` : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                    {row.curr !== null ? `${row.curr}` : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    <DiffBadge diff={diff} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DiffBadge({ diff }: { diff: number | null }) {
  if (diff === null) {
    return <span className="text-slate-400">—</span>;
  }

  if (diff > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold dark:text-emerald-400">
        <ArrowUpRight className="h-3.5 w-3.5" />
        +{diff}
      </span>
    );
  }

  if (diff < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-rose-600 font-bold dark:text-rose-400">
        <ArrowDownRight className="h-3.5 w-3.5" />
        {diff}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-0.5 text-slate-400 font-medium">
      <Minus className="h-3.5 w-3.5" />
      0
    </span>
  );
}
