"use client";

import React from "react";
import { DetailedScores, CategoryScoreDetails } from "@/lib/audit/types";
import { CheckCircle2, AlertTriangle, HelpCircle, Sparkles } from "lucide-react";

interface AuditScoreBreakdownProps {
  detailedScores?: DetailedScores | null;
}

export function AuditScoreBreakdown({ detailedScores }: AuditScoreBreakdownProps) {
  if (!detailedScores || !detailedScores.details) {
    return (
      <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[5px_5px_0px_#080808]">
        <p className="font-mono text-xs font-bold text-[#080808]/70">
          Detailed score evidence breakdown is being calculated or not yet available for this audit record.
        </p>
      </div>
    );
  }

  const categories = [
    {
      key: "seo",
      title: "Search Engine Optimization (SEO)",
      businessMeaning: "How easily potential customers find your website on Google search.",
      data: detailedScores.details.seo,
    },
    {
      key: "performance",
      title: "Page Speed & Response Time",
      businessMeaning: "How fast your site loads before impatient mobile visitors give up and leave.",
      data: detailedScores.details.performance,
    },
    {
      key: "accessibility",
      title: "Accessibility & Inclusive Design",
      businessMeaning: "Whether all visitors—including visually impaired or mobile users—can use your site.",
      data: detailedScores.details.accessibility,
    },
    {
      key: "ux",
      title: "User Experience (UX)",
      businessMeaning: "Clear headings, straightforward layouts, and smooth navigation that keep customers browsing.",
      data: detailedScores.details.ux,
    },
    {
      key: "trust",
      title: "Trust, Security & Privacy Signals",
      businessMeaning: "HTTPS safety badges, privacy assurances, and clear contact channels that make buyers feel secure.",
      data: detailedScores.details.trust,
    },
    {
      key: "conversion",
      title: "Conversion & Action Pathways",
      businessMeaning: "Clear, prominent buttons that guide prospective clients to buy, sign up, or contact you.",
      data: detailedScores.details.conversion,
    },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[5px_5px_0px_#080808]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-block border-2 border-[#080808] bg-[#FFE500] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-[#080808] shadow-[1.5px_1.5px_0px_#080808]">
              METHODOLOGY & AUDIT EVIDENCE
            </div>
            <h3 className="mt-2 font-sans text-xl font-black uppercase tracking-tight text-[#080808]">
              How Each Category Was Scored
            </h3>
            <p className="mt-1 font-sans text-xs sm:text-sm font-medium text-[#080808]/80 max-w-2xl">
              Deterministic real-world measurements evaluated against web performance and search visibility benchmarks.
            </p>
          </div>
          <span className="self-start sm:self-auto border-2 border-[#080808] bg-[#F8F6EC] px-3 py-1 font-mono text-xs font-black uppercase text-[#080808]">
            Engine v{detailedScores.scoringVersion}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {categories.map((cat) => (
          <CategoryDetailCard
            key={cat.key}
            title={cat.title}
            businessMeaning={cat.businessMeaning}
            details={cat.data}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryDetailCard({
  title,
  businessMeaning,
  details,
}: {
  title: string;
  businessMeaning: string;
  details: CategoryScoreDetails;
}) {
  const score = details.score;

  return (
    <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[5px_5px_0px_#080808] space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b-2 border-[#080808] pb-3">
        <div>
          <h4 className="font-sans text-base font-black text-[#080808]">
            {title}
          </h4>
          <p className="font-sans text-xs text-[#080808]/75 mt-0.5 font-medium">
            {businessMeaning}
          </p>
        </div>
        <span
          className={`shrink-0 border-2 border-[#080808] px-3 py-1 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#080808] ${
            score === null
              ? "bg-[#F8F6EC] text-[#080808]"
              : score >= 80
              ? "bg-[#B7FF6A] text-[#080808]"
              : score >= 50
              ? "bg-[#FFE500] text-[#080808]"
              : "bg-[#FF4F9A] text-white"
          }`}
        >
          {score !== null ? `${score}/100` : "N/A"}
        </span>
      </div>

      <div className="space-y-4 text-xs font-sans">
        {/* Detected Signals */}
        {details.availableEvidence && details.availableEvidence.length > 0 && (
          <div className="border-2 border-[#080808] bg-[#F8F6EC] p-3 shadow-[2px_2px_0px_#080808]">
            <span className="font-mono text-[10px] font-black uppercase text-[#080808] block mb-2">
              Detected Positive Signals:
            </span>
            <ul className="space-y-1.5">
              {details.availableEvidence.map((ev, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[#080808]/90 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-[#080808] shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Deductions */}
        {details.majorDeductions && details.majorDeductions.length > 0 && (
          <div className="border-2 border-[#080808] bg-white p-3 shadow-[2px_2px_0px_#080808]">
            <span className="font-mono text-[10px] font-black uppercase text-[#080808] block mb-2">
              Areas Causing Score Drops:
            </span>
            <ul className="space-y-1.5">
              {details.majorDeductions.map((ded, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[#080808]/90 font-medium">
                  <AlertTriangle className="h-4 w-4 text-[#FF4F9A] shrink-0 mt-0.5 stroke-[2.5]" />
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
