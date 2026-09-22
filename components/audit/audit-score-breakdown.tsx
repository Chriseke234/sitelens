"use client";

import React from "react";
import { DetailedScores, CategoryScoreDetails } from "@/lib/audit/types";
import { CheckCircle2, AlertTriangle, HelpCircle, ChevronRight } from "lucide-react";

interface AuditScoreBreakdownProps {
  detailedScores?: DetailedScores | null;
}

export function AuditScoreBreakdown({ detailedScores }: AuditScoreBreakdownProps) {
  if (!detailedScores || !detailedScores.details) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs text-slate-500">Detailed score evidence breakdown is not available for this audit record.</p>
      </div>
    );
  }

  const categories = [
    { key: "seo", title: "Search Engine Optimization (SEO)", data: detailedScores.details.seo },
    { key: "performance", title: "Performance & Load Speed", data: detailedScores.details.performance },
    { key: "accessibility", title: "Basic HTML Accessibility", data: detailedScores.details.accessibility },
    { key: "ux", title: "User Experience (UX)", data: detailedScores.details.ux },
    { key: "trust", title: "Trust & Security Signals", data: detailedScores.details.trust },
    { key: "conversion", title: "Conversion & Action Pathways", data: detailedScores.details.conversion },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Score Methodology & Evidence</h3>
          <p className="text-xs text-slate-500">
            Deterministic score version <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{detailedScores.scoringVersion}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {categories.map((cat) => (
          <CategoryDetailCard key={cat.key} title={cat.title} details={cat.data} />
        ))}
      </div>
    </div>
  );
}

function CategoryDetailCard({
  title,
  details,
}: {
  title: string;
  details: CategoryScoreDetails;
}) {
  const isMeasured = details.status === "measured";
  const score = details.score;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h4>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400 capitalize">
            {details.status}
          </span>
          <span
            className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-extrabold ${
              score === null
                ? "bg-slate-100 text-slate-500"
                : score >= 80
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : score >= 50
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
            }`}
          >
            {score !== null ? `${score}/100` : "N/A"}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-4 text-xs">
        {/* Evidence items */}
        {details.availableEvidence && details.availableEvidence.length > 0 && (
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Detected Signals:
            </span>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400">
              {details.availableEvidence.map((ev, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Deductions */}
        {details.majorDeductions && details.majorDeductions.length > 0 && (
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Score Deductions:
            </span>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400">
              {details.majorDeductions.map((ded, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{ded}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
