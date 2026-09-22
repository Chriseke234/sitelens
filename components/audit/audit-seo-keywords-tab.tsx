"use client";

import React from "react";
import { SEOKeywordIntelligence } from "@/lib/audit/keywords";
import { Badge } from "@/components/ui/badge";
import { Search, Tag, Lightbulb, FileText, CheckCircle2, ArrowRight } from "lucide-react";

interface AuditSEOKeywordsTabProps {
  keywords?: SEOKeywordIntelligence | null;
}

export function AuditSEOKeywordsTab({ keywords }: AuditSEOKeywordsTabProps) {
  if (!keywords) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 text-center">
        <p className="text-xs text-slate-500">Keyword intelligence is not available for this audit record.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">SEO & Keyword Intelligence</h3>
          <p className="text-xs text-slate-500">
            Content-grounded topic analysis and keyword opportunity suggestions derived from actual page text.
          </p>
        </div>
      </div>

      {/* Detected Topics List */}
      {keywords.detectedTopics && keywords.detectedTopics.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-3 text-slate-900 dark:text-white">
            <Tag className="h-4 w-4 text-blue-600" />
            <h4 className="text-sm font-bold">Detected Topics & Key Phrases</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.detectedTopics.map((topic, idx) => (
              <Badge key={idx} variant="outline" className="px-3 py-1 text-xs border-slate-300 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Keyword Opportunities Matrix */}
      {keywords.keywordOpportunities && keywords.keywordOpportunities.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
            <Search className="h-4 w-4 text-blue-600" />
            <h4 className="text-sm font-bold">Topic & Keyword Opportunities</h4>
          </div>

          <div className="space-y-4">
            {keywords.keywordOpportunities.map((opp, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-slate-100 bg-slate-50/80 p-4 text-xs dark:border-slate-800 dark:bg-slate-950/60"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{opp.topic}</span>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-0">
                    {opp.category}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 mt-2">
                  <div className="rounded border border-slate-200/60 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Why it&apos;s relevant:</span>
                    <p className="text-slate-600 dark:text-slate-400">{opp.whyRelevant}</p>
                  </div>
                  <div className="rounded border border-slate-200/60 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                    <span className="font-bold text-blue-700 dark:text-blue-300 block mb-0.5">Suggested usage:</span>
                    <p className="text-slate-600 dark:text-slate-400">{opp.suggestedUsage}</p>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-500 font-mono">
                  Evidence: {opp.pageEvidence}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keyword Gaps & Title Optimization Recommendations */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Content Gaps */}
        {keywords.keywordGaps && keywords.keywordGaps.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-3 text-slate-900 dark:text-white">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <h4 className="text-sm font-bold">Content & Topic Gaps</h4>
            </div>

            <div className="space-y-3 text-xs">
              {keywords.keywordGaps.map((gap, idx) => (
                <div key={idx} className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{gap.topic}</span>
                  <p className="text-slate-500 mt-0.5">{gap.observation}</p>
                  <p className="text-blue-700 dark:text-blue-300 font-semibold mt-1">{gap.opportunity}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Title & Meta Recommendations */}
        {keywords.recommendations && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-3 text-slate-900 dark:text-white">
              <FileText className="h-4 w-4 text-emerald-600" />
              <h4 className="text-sm font-bold">Snippet Recommendations</h4>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                <span className="font-semibold text-slate-500 block mb-0.5">Title Recommendation:</span>
                <p className="font-mono text-slate-800 dark:text-slate-200 font-bold">{keywords.recommendations.suggestedTitle}</p>
                <p className="text-slate-500 text-[11px] mt-1">{keywords.recommendations.rationale}</p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                <span className="font-semibold text-slate-500 block mb-0.5">Meta Description Recommendation:</span>
                <p className="text-slate-800 dark:text-slate-200 font-medium">{keywords.recommendations.suggestedMetaDescription}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
