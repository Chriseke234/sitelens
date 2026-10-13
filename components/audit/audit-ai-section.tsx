"use client";

import React, { useState, useEffect } from "react";
import { DBStoredAIReport } from "@/lib/ai/audit-report";
import { Spinner } from "@/components/ui/spinner";
import { Sparkles, AlertCircle, CheckCircle2, ShieldAlert, ArrowRight, Target, Zap } from "lucide-react";

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
      <div className="border-[3px] border-[#080808] bg-[#F8F6EC] p-8 text-center shadow-[5px_5px_0px_#080808]">
        <Spinner className="mx-auto h-8 w-8 text-[#080808] mb-3" />
        <p className="font-sans text-sm font-black uppercase text-[#080808]">
          Translating Audit Evidence into Plain-English Executive Report...
        </p>
        <p className="font-sans text-xs text-[#080808]/75 mt-1">
          Synthesizing real-world measurements into actionable business priorities.
        </p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="border-[3px] border-[#080808] bg-[#FFE500] p-6 shadow-[5px_5px_0px_#080808]">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[#080808] mt-0.5 shrink-0 stroke-[2.5]" />
          <div>
            <h4 className="font-sans text-sm font-black uppercase text-[#080808]">Executive Interpretation Notice</h4>
            <p className="font-sans text-xs text-[#080808]/85 mt-1 font-medium">
              {error || "Plain-English executive analysis will be synthesized shortly after the audit finishes."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Header Card */}
      <div className="border-[3px] border-[#080808] bg-[#FFE500] p-6 shadow-[5px_5px_0px_#080808] text-[#080808]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b-2 border-[#080808] pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center border-2 border-[#080808] bg-white text-[#080808] shadow-[2px_2px_0px_#080808]">
              <Sparkles className="h-4 w-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-sans text-lg font-black uppercase tracking-tight text-[#080808]">
                Executive Business Summary
              </h3>
              <p className="font-mono text-[10px] text-[#080808]/80 font-bold">
                Plain-English Translation · Measured Evidence Grounded
              </p>
            </div>
          </div>
          <span className="w-fit border-2 border-[#080808] bg-white px-3 py-1 font-mono text-[11px] font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808]">
            Non-Technical Brief
          </span>
        </div>

        <div className="mt-4 font-sans text-sm font-medium leading-relaxed text-[#080808]">
          {report.summary}
        </div>
      </div>

      {/* Key Strategic Findings List */}
      {report.key_findings && report.key_findings.length > 0 && (
        <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[5px_5px_0px_#080808]">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 stroke-[2.5] text-[#080808]" />
            <h4 className="font-sans text-sm font-black uppercase tracking-tight text-[#080808]">
              Key Business Insights & Observations
            </h4>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {report.key_findings.map((finding, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 border-2 border-[#080808] bg-[#F8F6EC] p-3 shadow-[2px_2px_0px_#080808]"
              >
                <CheckCircle2 className="h-4 w-4 text-[#080808] shrink-0 mt-0.5 stroke-[2.5]" />
                <span className="font-sans text-xs font-semibold leading-relaxed text-[#080808]">{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Priority Action Matrix */}
      {report.priority_actions && report.priority_actions.length > 0 && (
        <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[5px_5px_0px_#080808]">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 stroke-[2.5] text-[#080808]" />
            <h4 className="font-sans text-sm font-black uppercase tracking-tight text-[#080808]">
              Recommended High-Priority Action Items
            </h4>
          </div>

          <div className="space-y-4">
            {report.priority_actions.map((act, idx) => (
              <div
                key={idx}
                className="border-2 border-[#080808] bg-white p-4 shadow-[3px_3px_0px_#080808]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#080808]/20 pb-2 mb-3">
                  <span className="font-mono text-xs font-bold text-[#080808]/80">
                    Observation: <span className="font-medium">{act.evidence}</span>
                  </span>
                  <PriorityBadge priority={act.priority} />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="border-2 border-[#080808] bg-[#F8F6EC] p-3 shadow-[2px_2px_0px_#080808]">
                    <span className="font-mono text-[10px] font-black uppercase text-[#080808] block mb-1">
                      Why this matters for your customers:
                    </span>
                    <p className="font-sans text-xs font-medium text-[#080808]/90 leading-relaxed">
                      {act.why_it_matters}
                    </p>
                  </div>
                  <div className="border-2 border-[#080808] bg-[#B7FF6A] p-3 text-[#080808] shadow-[2px_2px_0px_#080808]">
                    <span className="font-mono text-[10px] font-black uppercase text-[#080808] block mb-1">
                      Recommended Next Step:
                    </span>
                    <p className="font-sans text-xs font-bold text-[#080808] leading-relaxed">
                      {act.recommended_action}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mandatory AI Disclaimer */}
      <div className="border-2 border-[#080808] bg-[#F8F6EC] p-3 shadow-[2px_2px_0px_#080808]">
        <p className="font-mono text-[11px] text-center font-bold text-[#080808]/75">
          Notice: This plain-English analysis is grounded strictly in deterministic audit measurements and page signals.
        </p>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  switch (priority.toLowerCase()) {
    case "critical":
      return (
        <span className="border border-[#080808] bg-[#FF4F9A] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-white shadow-[1px_1px_0px_#080808]">
          Critical Priority
        </span>
      );
    case "high":
      return (
        <span className="border border-[#080808] bg-[#FFE500] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-[#080808] shadow-[1px_1px_0px_#080808]">
          High Impact
        </span>
      );
    case "medium":
      return (
        <span className="border border-[#080808] bg-[#B7FF6A] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-[#080808] shadow-[1px_1px_0px_#080808]">
          Medium Priority
        </span>
      );
    default:
      return (
        <span className="border border-[#080808] bg-white px-2 py-0.5 font-mono text-[10px] font-black uppercase text-[#080808] shadow-[1px_1px_0px_#080808]">
          Low Priority
        </span>
      );
  }
}
