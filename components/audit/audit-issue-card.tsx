import React from "react";
import { Badge } from "@/components/ui/badge";
import { AuditIssue } from "@/types";
import { AlertOctagon, AlertTriangle, AlertCircle, Info, FileSearch, CheckCircle2 } from "lucide-react";

interface AuditIssueCardProps {
  issue: AuditIssue;
}

export function AuditIssueCard({ issue }: AuditIssueCardProps) {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive" className="bg-rose-700 text-white">Critical</Badge>;
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="warning">Medium</Badge>;
      case "low":
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertOctagon className="h-4 w-4 text-rose-700 dark:text-rose-400" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
      case "medium":
        return <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <Info className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {getSeverityIcon(issue.severity)}
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {issue.title}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
            {issue.category}
          </span>
          {getSeverityBadge(issue.severity)}
        </div>
      </div>

      <div className="mt-3 space-y-3 text-xs">
        {/* Description */}
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          {issue.description}
        </p>

        {/* Evidence */}
        <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/60">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold mb-1">
            <FileSearch className="h-3.5 w-3.5 text-slate-400" />
            <span>Measured Evidence:</span>
          </div>
          <p className="font-mono text-slate-700 dark:text-slate-300 leading-normal">
            {issue.evidence}
          </p>
        </div>

        {/* Recommendation */}
        <div className="rounded-lg border border-slate-900/10 bg-slate-900 text-white p-3 dark:border-slate-800 dark:bg-slate-100 dark:text-slate-900">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200 dark:text-slate-700 mb-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 dark:text-emerald-600" />
            <span>Recommendation:</span>
          </div>
          <p className="leading-relaxed font-medium">
            {issue.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
