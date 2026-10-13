"use client";

import React from "react";
import { SEOKeywordIntelligence } from "@/lib/audit/keywords";
import { Search, Tag, Lightbulb, FileText, CheckCircle2, ArrowRight } from "lucide-react";

interface AuditSEOKeywordsTabProps {
  keywords?: SEOKeywordIntelligence | null;
}

export function AuditSEOKeywordsTab({ keywords }: AuditSEOKeywordsTabProps) {
  if (!keywords) {
    return (
      <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[5px_5px_0px_#080808] text-center">
        <p className="font-mono text-xs font-bold text-[#080808]/70">
          Keyword intelligence is being processed or not available for this audit record.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[5px_5px_0px_#080808]">
        <div className="inline-block border-2 border-[#080808] bg-[#FFE500] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-[#080808] shadow-[1.5px_1.5px_0px_#080808]">
          SEARCH VISIBILITY & TOPIC REACH
        </div>
        <h3 className="mt-2 font-sans text-xl font-black uppercase tracking-tight text-[#080808]">
          Google Search Keywords & Content Topics
        </h3>
        <p className="mt-1 font-sans text-xs sm:text-sm font-medium text-[#080808]/80 max-w-2xl">
          Keywords and topics detected on your page, explaining how real customers find you and where you can rank higher.
        </p>
      </div>

      {/* Detected Topics List */}
      {keywords.detectedTopics && keywords.detectedTopics.length > 0 && (
        <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[5px_5px_0px_#080808]">
          <div className="flex items-center gap-2 mb-3 text-[#080808]">
            <Tag className="h-4 w-4 stroke-[2.5]" />
            <h4 className="font-sans text-sm font-black uppercase tracking-tight">
              Primary Topics Found on Your Website
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.detectedTopics.map((topic, idx) => (
              <span
                key={idx}
                className="border-2 border-[#080808] bg-[#F8F6EC] px-3 py-1 font-mono text-xs font-bold text-[#080808] shadow-[1.5px_1.5px_0px_#080808]"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Keyword Opportunities Matrix */}
      {keywords.keywordOpportunities && keywords.keywordOpportunities.length > 0 && (
        <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[5px_5px_0px_#080808]">
          <div className="flex items-center gap-2 mb-4 text-[#080808]">
            <Search className="h-4 w-4 stroke-[2.5]" />
            <h4 className="font-sans text-sm font-black uppercase tracking-tight">
              Keyword Opportunities to Attract More Buyers
            </h4>
          </div>

          <div className="space-y-4">
            {keywords.keywordOpportunities.map((opp, idx) => (
              <div
                key={idx}
                className="border-2 border-[#080808] bg-white p-4 shadow-[3px_3px_0px_#080808]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#080808]/20 pb-2 mb-3">
                  <span className="font-sans font-black text-sm text-[#080808]">{opp.topic}</span>
                  <span className="border-2 border-[#080808] bg-[#B7FF6A] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-[#080808] shadow-[1px_1px_0px_#080808]">
                    {opp.category}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="border-2 border-[#080808] bg-[#F8F6EC] p-3 shadow-[2px_2px_0px_#080808]">
                    <span className="font-mono text-[10px] font-black uppercase text-[#080808] block mb-1">
                      Why this matters for search rankings:
                    </span>
                    <p className="font-sans text-xs font-medium text-[#080808]/90 leading-relaxed">
                      {opp.whyRelevant}
                    </p>
                  </div>
                  <div className="border-2 border-[#080808] bg-[#FFE500] p-3 text-[#080808] shadow-[2px_2px_0px_#080808]">
                    <span className="font-mono text-[10px] font-black uppercase text-[#080808] block mb-1">
                      How to use this on your site:
                    </span>
                    <p className="font-sans text-xs font-bold leading-relaxed">
                      {opp.suggestedUsage}
                    </p>
                  </div>
                </div>

                <div className="mt-3 border border-[#080808]/30 bg-white p-2 text-[11px] font-mono text-[#080808]/75">
                  <span className="font-black text-[#080808]">Page Evidence: </span>
                  {opp.pageEvidence}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Snippet Optimization Bento */}
      {keywords.recommendations && (
        <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[5px_5px_0px_#080808]">
          <div className="flex items-center gap-2 mb-3 text-[#080808]">
            <FileText className="h-4 w-4 stroke-[2.5]" />
            <h4 className="font-sans text-sm font-black uppercase tracking-tight">
              Ready-to-Use Headline & Description Copy
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border-2 border-[#080808] bg-[#F8F6EC] p-4 shadow-[2px_2px_0px_#080808]">
              <span className="font-mono text-[10px] font-black uppercase text-[#080808] block mb-1">
                Suggested Page Title (For Google Results):
              </span>
              <p className="font-sans text-sm font-black text-[#080808]">
                {keywords.recommendations.suggestedTitle}
              </p>
              <p className="font-sans text-xs font-medium text-[#080808]/75 mt-2">
                {keywords.recommendations.rationale}
              </p>
            </div>

            <div className="border-2 border-[#080808] bg-[#FFE500] p-4 text-[#080808] shadow-[2px_2px_0px_#080808]">
              <span className="font-mono text-[10px] font-black uppercase text-[#080808] block mb-1">
                Suggested Search Preview Snippet:
              </span>
              <p className="font-sans text-xs sm:text-sm font-bold text-[#080808] leading-relaxed">
                {keywords.recommendations.suggestedMetaDescription}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
