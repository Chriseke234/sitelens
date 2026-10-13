"use client";

import React, { useState } from "react";
import { AuditIssue } from "@/types";
import {
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Info,
  FileSearch,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface AuditIssueCardProps {
  issue: AuditIssue;
}

export function AuditIssueCard({ issue }: AuditIssueCardProps) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return (
          <span className="inline-flex items-center gap-1 border border-[#080808] bg-[#FF4F9A] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-white shadow-[1.5px_1.5px_0px_#080808]">
            <AlertOctagon className="h-3 w-3 stroke-[2.5]" /> Urgent Priority
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center gap-1 border border-[#080808] bg-[#FFE500] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-[#080808] shadow-[1.5px_1.5px_0px_#080808]">
            <AlertTriangle className="h-3 w-3 stroke-[2.5]" /> High Impact
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1 border border-[#080808] bg-[#B7FF6A] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-[#080808] shadow-[1.5px_1.5px_0px_#080808]">
            <AlertCircle className="h-3 w-3 stroke-[2.5]" /> Recommended
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center gap-1 border border-[#080808] bg-white px-2 py-0.5 font-mono text-[10px] font-black uppercase text-[#080808] shadow-[1.5px_1.5px_0px_#080808]">
            <Info className="h-3 w-3 stroke-[2.5]" /> Minor Tweak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 border border-[#080808] bg-[#F8F6EC] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-[#080808] shadow-[1.5px_1.5px_0px_#080808]">
            Info
          </span>
        );
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "seo":
        return "Search Visibility (SEO)";
      case "performance":
        return "Page Speed";
      case "accessibility":
        return "Accessibility";
      case "ux":
        return "User Experience";
      case "trust":
        return "Trust & Safety";
      case "conversion":
        return "Sales & Action";
      default:
        return cat.toUpperCase();
    }
  };

  return (
    <div className="border-[3px] border-[#080808] bg-white p-5 shadow-[4px_4px_0px_#080808] transition-all hover:translate-x-0.5 hover:translate-y-0.5">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#080808] pb-3">
        <div className="flex items-center gap-2">
          <span className="border-2 border-[#080808] bg-[#F8F6EC] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-[#080808]">
            {getCategoryLabel(issue.category)}
          </span>
          {getSeverityBadge(issue.severity)}
        </div>
      </div>

      {/* Main Plain-English Finding Content */}
      <div className="mt-4 space-y-4">
        {/* Title */}
        <h4 className="font-sans text-base font-black tracking-tight text-[#080808] sm:text-lg">
          {issue.title}
        </h4>

        {/* What this means for your business & visitors */}
        <div className="border-2 border-[#080808] bg-[#F8F6EC] p-3.5 shadow-[2px_2px_0px_#080808]">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-black uppercase text-[#080808] mb-1">
            <Sparkles className="h-3.5 w-3.5 text-[#080808] stroke-[2.5]" />
            <span>Why this matters for your business:</span>
          </div>
          <p className="font-sans text-xs sm:text-sm font-medium leading-relaxed text-[#080808]/90">
            {issue.description}
          </p>
        </div>

        {/* Action Needed */}
        <div className="border-2 border-[#080808] bg-[#B7FF6A] p-3.5 text-[#080808] shadow-[2px_2px_0px_#080808]">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-black uppercase text-[#080808] mb-1">
            <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Recommended Action (What to do):</span>
          </div>
          <p className="font-sans text-xs sm:text-sm font-bold leading-relaxed text-[#080808]">
            {issue.recommendation}
          </p>
        </div>

        {/* Expandable Technical Evidence Toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="inline-flex items-center gap-1.5 font-mono text-xs font-black uppercase text-[#080808] hover:text-[#080808]/70 underline decoration-2 underline-offset-4"
          >
            <FileSearch className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>{showTechnicalDetails ? "Hide technical evidence" : "Show technical evidence & code details"}</span>
            {showTechnicalDetails ? (
              <ChevronUp className="h-3.5 w-3.5 stroke-[2.5]" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 stroke-[2.5]" />
            )}
          </button>

          {showTechnicalDetails && (
            <div className="mt-3 border-2 border-[#080808] bg-white p-3 font-mono text-xs shadow-[2px_2px_0px_#080808]">
              <span className="font-black text-[#080808] block mb-1 uppercase text-[10px]">
                Measured HTML / Server Signal:
              </span>
              <p className="text-[#080808]/80 break-words leading-relaxed bg-[#F8F6EC] p-2 border border-[#080808]/40">
                {issue.evidence}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
