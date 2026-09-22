"use client";

import React from "react";
import { UXOpportunity } from "@/lib/audit/types";
import { Badge } from "@/components/ui/badge";
import { MousePointer, Eye, FileText, CheckCircle2, ArrowRight } from "lucide-react";

interface AuditUXConversionTabProps {
  opportunities?: UXOpportunity[];
}

export function AuditUXConversionTab({ opportunities = [] }: AuditUXConversionTabProps) {
  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">UX & Conversion Opportunities</h3>
          <p className="text-xs text-slate-500">
            Observation-based friction reduction and conversion path opportunities.
          </p>
        </div>
      </div>

      {opportunities && opportunities.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {opportunities.map((opp, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <MousePointer className="h-3.5 w-3.5 text-blue-600" />
                  {opp.category.toUpperCase()} Opportunity
                </span>
                <Badge variant="outline" className="text-[10px]">
                  Optimization Signal
                </Badge>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Observation:</span>
                  <p className="text-slate-600 dark:text-slate-400">{opp.observation}</p>
                </div>

                <div>
                  <span className="font-bold text-blue-700 dark:text-blue-300 block mb-0.5">Opportunity:</span>
                  <p className="text-slate-600 dark:text-slate-400">{opp.opportunity}</p>
                </div>

                <div className="rounded bg-slate-50 p-2 dark:bg-slate-950 text-[11px]">
                  <span className="font-semibold text-slate-500">Evidence: </span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{opp.evidence}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 text-center">
          <p className="text-xs text-slate-500">
            No specific UX/conversion optimization opportunities detected beyond the standard audit issues list.
          </p>
        </div>
      )}
    </div>
  );
}
