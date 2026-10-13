"use client";

import React from "react";
import { UXOpportunity } from "@/lib/audit/types";
import { MousePointer, CheckCircle2, ArrowRight, Sparkles, TrendingUp } from "lucide-react";

interface AuditUXConversionTabProps {
  opportunities?: UXOpportunity[];
}

export function AuditUXConversionTab({ opportunities = [] }: AuditUXConversionTabProps) {
  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[5px_5px_0px_#080808]">
        <div className="inline-block border-2 border-[#080808] bg-[#FFE500] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-[#080808] shadow-[1.5px_1.5px_0px_#080808]">
          CONVERSION & USER JOURNEY
        </div>
        <h3 className="mt-2 font-sans text-xl font-black uppercase tracking-tight text-[#080808]">
          UX & Customer Conversion Opportunities
        </h3>
        <p className="mt-1 font-sans text-xs sm:text-sm font-medium text-[#080808]/80 max-w-2xl">
          Friction-reduction ideas designed to turn casual website visitors into leads, buyers, or subscribers.
        </p>
      </div>

      {opportunities && opportunities.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {opportunities.map((opp, idx) => (
            <div
              key={idx}
              className="border-[3px] border-[#080808] bg-white p-6 shadow-[5px_5px_0px_#080808] space-y-4"
            >
              <div className="flex items-center justify-between border-b-2 border-[#080808] pb-3">
                <span className="font-mono text-xs font-black uppercase text-[#080808] flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 stroke-[2.5]" />
                  {opp.category} Enhancement
                </span>
                <span className="border-2 border-[#080808] bg-[#B7FF6A] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-[#080808] shadow-[1px_1px_0px_#080808]">
                  Sales Opportunity
                </span>
              </div>

              <div className="space-y-3 font-sans text-xs">
                <div className="border-2 border-[#080808] bg-[#F8F6EC] p-3 shadow-[2px_2px_0px_#080808]">
                  <span className="font-mono text-[10px] font-black uppercase text-[#080808] block mb-1">
                    What was observed:
                  </span>
                  <p className="text-[#080808]/90 font-medium leading-relaxed">
                    {opp.observation}
                  </p>
                </div>

                <div className="border-2 border-[#080808] bg-[#FFE500] p-3 shadow-[2px_2px_0px_#080808]">
                  <span className="font-mono text-[10px] font-black uppercase text-[#080808] block mb-1">
                    How to improve conversions:
                  </span>
                  <p className="text-[#080808] font-bold leading-relaxed">
                    {opp.opportunity}
                  </p>
                </div>

                <div className="bg-white border border-[#080808]/40 p-2 font-mono text-[11px] text-[#080808]/75">
                  <span className="font-black text-[#080808]">Evidence: </span>
                  <span>{opp.evidence}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[5px_5px_0px_#080808] text-center">
          <p className="font-mono text-xs font-bold text-[#080808]/70">
            No specific UX friction points detected beyond the issues listed in the Findings tab.
          </p>
        </div>
      )}
    </div>
  );
}
