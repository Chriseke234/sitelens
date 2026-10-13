"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuditRecord, AuditIssue, AuditPage } from "@/types";
import { AuditIssueCard } from "@/components/audit/audit-issue-card";
import { AuditScoreBreakdown } from "@/components/audit/audit-score-breakdown";
import { AuditAISection } from "@/components/audit/audit-ai-section";
import { AuditUXConversionTab } from "@/components/audit/audit-ux-conversion-tab";
import { AuditSEOKeywordsTab } from "@/components/audit/audit-seo-keywords-tab";
import { Spinner } from "@/components/ui/spinner";
import {
  Globe,
  TrendingUp,
  Gauge,
  UserCheck,
  Layout,
  ShieldCheck,
  Target,
  AlertTriangle,
  RefreshCw,
  Plus,
  Sparkles,
  MousePointer,
  FileText,
  SlidersHorizontal,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertOctagon,
  Check,
} from "lucide-react";

interface AuditReportViewProps {
  initialAudit: AuditRecord;
  pageDetail?: AuditPage | null;
  initialIssues: AuditIssue[];
}

export function AuditReportView({
  initialAudit,
  pageDetail,
  initialIssues,
}: AuditReportViewProps) {
  const router = useRouter();
  const [audit, setAudit] = useState<AuditRecord>(initialAudit);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [activeSeverity, setActiveSeverity] = useState<string>("all");

  // Status Polling for active analysis
  useEffect(() => {
    if (audit.status !== "queued" && audit.status !== "analyzing") {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/audits/${audit.id}/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "completed" || data.status === "failed") {
            setAudit((prev) => ({ ...prev, status: data.status }));
            router.refresh();
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [audit.id, audit.status, router]);

  if (audit.status === "queued" || audit.status === "analyzing") {
    return (
      <div className="border-[3px] border-[#080808] bg-white p-12 text-center shadow-[6px_6px_0px_#080808]">
        <Spinner size="lg" className="mx-auto mb-4 text-[#080808]" />
        <div className="inline-block border-2 border-[#080808] bg-[#FFE500] px-3 py-1 font-mono text-xs font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808] mb-3">
          {audit.status === "queued" ? "QUEUE POSITION: READY" : "REAL-TIME SCAN IN PROGRESS"}
        </div>
        <h3 className="font-sans text-2xl font-black uppercase tracking-tight text-[#080808]">
          {audit.status === "queued" ? "Your Website Audit Is Queued..." : "Analyzing Your Website & Marketing Signals..."}
        </h3>
        <p className="mx-auto mt-2 max-w-lg font-sans text-sm font-medium text-[#080808]/80 leading-relaxed">
          Aigenstra is inspecting response speeds, Google search tags, mobile responsiveness, customer trust badges, and conversion elements for{" "}
          <strong className="font-mono text-[#080808]">{audit.url}</strong>.
        </p>
      </div>
    );
  }

  if (audit.status === "failed") {
    return (
      <div className="border-[3px] border-[#080808] bg-[#FF4F9A] p-8 text-center text-white shadow-[6px_6px_0px_#080808]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border-2 border-[#080808] bg-white text-[#FF4F9A] shadow-[3px_3px_0px_#080808]">
          <AlertTriangle className="h-8 w-8 stroke-[2.5]" />
        </div>
        <h3 className="font-sans text-2xl font-black uppercase tracking-tight text-white">
          We Couldn&apos;t Reach This Website
        </h3>
        <p className="mx-auto mt-2 max-w-md font-sans text-sm font-medium text-white/90 leading-relaxed">
          The server at <strong className="font-mono text-white underline">{audit.url}</strong> did not respond to standard requests. Please check that the URL is public and online.
        </p>
        <div className="mt-6">
          <Link
            href="/audits"
            className="inline-flex items-center gap-2 border-2 border-[#080808] bg-white px-5 py-2.5 font-mono text-xs font-black uppercase text-[#080808] shadow-[3px_3px_0px_#080808] hover:bg-[#FFE500]"
          >
            <RefreshCw className="h-4 w-4 stroke-[2.5]" />
            <span>Try Another Website</span>
          </Link>
        </div>
      </div>
    );
  }

  // Filter Issues
  const filteredIssues =
    activeSeverity === "all"
      ? initialIssues
      : initialIssues.filter((issue) => issue.severity.toLowerCase() === activeSeverity.toLowerCase());

  const categoryCards = [
    {
      name: "Search Visibility (SEO)",
      sub: "Can Google discover you?",
      score: audit.seo_score,
      icon: TrendingUp,
      accent: "bg-[#FFE500]",
    },
    {
      name: "Page Speed",
      sub: "Do visitors stay or bounce?",
      score: audit.performance_score,
      icon: Gauge,
      accent: "bg-[#B7FF6A]",
    },
    {
      name: "Accessibility",
      sub: "Works for all shoppers",
      score: audit.accessibility_score,
      icon: UserCheck,
      accent: "bg-white",
    },
    {
      name: "User Experience",
      sub: "Easy to navigate & read",
      score: audit.ux_score,
      icon: Layout,
      accent: "bg-white",
    },
    {
      name: "Trust & Safety",
      sub: "Reassures cautious buyers",
      score: audit.trust_score,
      icon: ShieldCheck,
      accent: "bg-[#F8F6EC]",
    },
    {
      name: "Sales Conversion",
      sub: "Clear actions to buy/call",
      score: audit.conversion_score,
      icon: Target,
      accent: "bg-[#FFE500]",
    },
  ];

  const getOverallBusinessRating = (score: number | null | undefined) => {
    if (score === null || score === undefined) return { label: "Pending", bg: "bg-white", text: "text-[#080808]" };
    if (score >= 80) return { label: "High Performing Website", bg: "bg-[#B7FF6A]", text: "text-[#080808]" };
    if (score >= 60) return { label: "Solid Foundation (Action Items Needed)", bg: "bg-[#FFE500]", text: "text-[#080808]" };
    return { label: "Needs Immediate Attention", bg: "bg-[#FF4F9A]", text: "text-white" };
  };

  const overallRating = getOverallBusinessRating(audit.overall_score);

  const tabs = [
    { id: "overview", label: "Executive Overview" },
    { id: "issues", label: `Action Items (${initialIssues.length})` },
    { id: "ai-analysis", label: "Plain-English Summary" },
    { id: "scores", label: "Category Evidence" },
    { id: "seo-keywords", label: "Google Keywords" },
    { id: "ux-conversion", label: "Sales & UX Growth" },
    { id: "technical", label: "Server Signals" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[6px_6px_0px_#080808]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="border-2 border-[#080808] bg-[#B7FF6A] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-[#080808] shadow-[1.5px_1.5px_0px_#080808]">
                LIVE SITE AUDIT REPORT
              </span>
              <span className="font-mono text-xs font-bold text-[#080808]/60">
                Completed {new Date(audit.completed_at || audit.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 stroke-[2.5] text-[#080808]" />
              <h1 className="font-mono text-xl font-black text-[#080808] sm:text-2xl break-all">
                {audit.url}
              </h1>
            </div>
            <p className="mt-1 font-sans text-xs sm:text-sm font-medium text-[#080808]/75 max-w-2xl">
              Comprehensive non-technical audit explaining real-world business impact, search engine visibility, load speed, and customer conversion pathways.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <Link
              href="/audits"
              className="inline-flex items-center gap-1.5 border-2 border-[#080808] bg-[#FFE500] px-3.5 py-2 font-mono text-xs font-black uppercase text-[#080808] shadow-[2.5px_2.5px_0px_#080808] hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Run New Audit</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Sub-header Bento Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b-2 border-[#080808] pb-2 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap border-2 border-[#080808] px-4 py-2 font-mono text-xs font-black uppercase transition-all ${
              activeTab === tab.id
                ? "bg-[#080808] text-white shadow-[3px_3px_0px_#FFE500]"
                : "bg-white text-[#080808] shadow-[2px_2px_0px_#080808] hover:bg-[#F8F6EC]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Bento Grid: Overall Score + 6 Category Cards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Overall Score Bento Card */}
            <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[5px_5px_0px_#080808] flex flex-col justify-between space-y-4">
              <div>
                <span className="border-2 border-[#080808] bg-[#FFE500] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-[#080808] shadow-[1px_1px_0px_#080808]">
                  WEBSITE HEALTH INDEX
                </span>
                <div className="mt-4 flex items-baseline gap-2">
                  {audit.overall_score !== null && audit.overall_score !== undefined ? (
                    <>
                      <span className="font-mono text-6xl font-black text-[#080808]">
                        {audit.overall_score}
                      </span>
                      <span className="font-mono text-xl font-bold text-[#080808]/60">/ 100</span>
                    </>
                  ) : (
                    <span className="font-mono text-2xl font-black text-[#080808]/60">N/A</span>
                  )}
                </div>
              </div>

              <div className="border-2 border-[#080808] p-3 shadow-[2px_2px_0px_#080808] bg-[#F8F6EC]">
                <span className="font-mono text-[10px] font-black uppercase text-[#080808] block mb-0.5">
                  Business Health Rating:
                </span>
                <span className="font-sans text-xs font-bold text-[#080808]">
                  {overallRating.label}
                </span>
              </div>
            </div>

            {/* 6 Category Bento Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:col-span-2">
              {categoryCards.map((cat) => {
                const Icon = cat.icon;
                const hasScore = cat.score !== null && cat.score !== undefined;
                return (
                  <div
                    key={cat.name}
                    className="border-2 border-[#080808] bg-white p-4 shadow-[3px_3px_0px_#080808] flex flex-col justify-between transition-all hover:translate-x-0.5 hover:translate-y-0.5"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] font-black uppercase text-[#080808]">
                          {cat.name}
                        </span>
                        <Icon className="h-4 w-4 stroke-[2.5] text-[#080808]" />
                      </div>
                      <p className="font-sans text-[11px] text-[#080808]/75 font-medium leading-tight mb-3">
                        {cat.sub}
                      </p>
                    </div>

                    <div className="flex items-baseline justify-between border-t-2 border-[#080808]/20 pt-2">
                      <span className="font-mono text-2xl font-black text-[#080808]">
                        {hasScore ? cat.score : "N/A"}
                      </span>
                      {hasScore && (
                        <span className="font-mono text-[10px] font-bold text-[#080808]/60">/100</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Executive Translation on Overview */}
          <AuditAISection auditId={audit.id} />

          {/* Quick Highlight: Top 3 Critical Items */}
          {initialIssues.length > 0 && (
            <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[5px_5px_0px_#080808] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#080808] pb-3">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="h-4 w-4 stroke-[2.5] text-[#FF4F9A]" />
                  <h3 className="font-sans text-sm sm:text-base font-black uppercase tracking-tight text-[#080808]">
                    Top Urgent Action Items ({Math.min(initialIssues.length, 3)} of {initialIssues.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("issues")}
                  className="font-mono text-xs font-black uppercase text-[#080808] underline decoration-2 hover:text-[#080808]/70"
                >
                  View All Findings →
                </button>
              </div>

              <div className="space-y-4">
                {initialIssues.slice(0, 3).map((issue) => (
                  <AuditIssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTION ITEMS & ISSUES */}
      {activeTab === "issues" && (
        <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[5px_5px_0px_#080808] space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b-2 border-[#080808] pb-4">
            <div>
              <div className="inline-block border-2 border-[#080808] bg-[#FFE500] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-[#080808] shadow-[1px_1px_0px_#080808]">
                STEP-BY-STEP FIX LIST
              </div>
              <h2 className="mt-2 font-sans text-xl font-black uppercase tracking-tight text-[#080808]">
                Everything Identified on Your Website
              </h2>
              <p className="font-sans text-xs sm:text-sm font-medium text-[#080808]/80">
                {initialIssues.length} concrete items discovered through deterministic checks, ranked by urgency.
              </p>
            </div>

            {/* Severity Filters */}
            <div className="flex flex-wrap items-center gap-1.5">
              {["all", "critical", "high", "medium", "low"].map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setActiveSeverity(sev)}
                  className={`border-2 border-[#080808] px-3 py-1 font-mono text-xs font-black uppercase transition-all ${
                    activeSeverity.toLowerCase() === sev
                      ? "bg-[#080808] text-white shadow-[2px_2px_0px_#FFE500]"
                      : "bg-[#F8F6EC] text-[#080808] shadow-[1px_1px_0px_#080808] hover:bg-white"
                  }`}
                >
                  {sev === "all" ? "All Severities" : sev}
                </button>
              ))}
            </div>
          </div>

          {filteredIssues.length > 0 ? (
            <div className="space-y-4">
              {filteredIssues.map((issue) => (
                <AuditIssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          ) : (
            <div className="border-2 border-[#080808] bg-[#F8F6EC] p-8 text-center font-mono text-xs font-bold text-[#080808]">
              No audit issues found matching the severity filter: <strong>{activeSeverity.toUpperCase()}</strong>.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PLAIN-ENGLISH EXECUTIVE BRIEF */}
      {activeTab === "ai-analysis" && (
        <AuditAISection auditId={audit.id} />
      )}

      {/* TAB 4: CATEGORY SCORES & METHODOLOGY */}
      {activeTab === "scores" && (
        <AuditScoreBreakdown detailedScores={(audit as any).detailedScores} />
      )}

      {/* TAB 5: GOOGLE KEYWORDS */}
      {activeTab === "seo-keywords" && (
        <AuditSEOKeywordsTab keywords={(audit as any).keywords} />
      )}

      {/* TAB 6: SALES & UX GROWTH */}
      {activeTab === "ux-conversion" && (
        <AuditUXConversionTab opportunities={(audit as any).opportunities || []} />
      )}

      {/* TAB 7: SERVER SIGNALS */}
      {activeTab === "technical" && (
        <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[5px_5px_0px_#080808] space-y-4">
          <div className="border-b-2 border-[#080808] pb-3">
            <span className="border-2 border-[#080808] bg-[#F8F6EC] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-[#080808]">
              DIAGNOSTIC TELEMETRY
            </span>
            <h3 className="mt-2 font-sans text-lg font-black uppercase tracking-tight text-[#080808]">
              Raw Network & Document Signals
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border-2 border-[#080808] bg-[#F8F6EC] p-3 shadow-[2px_2px_0px_#080808]">
              <span className="font-mono text-[10px] font-bold text-[#080808]/70 uppercase block mb-1">
                Final Scanned URL
              </span>
              <p className="font-mono text-xs font-bold text-[#080808] truncate">
                {pageDetail?.url || audit.url}
              </p>
            </div>
            <div className="border-2 border-[#080808] bg-[#F8F6EC] p-3 shadow-[2px_2px_0px_#080808]">
              <span className="font-mono text-[10px] font-bold text-[#080808]/70 uppercase block mb-1">
                HTTP Response Code
              </span>
              <p className="font-mono text-xs font-black text-[#080808]">
                {pageDetail?.status_code || 200} (Success)
              </p>
            </div>
            <div className="border-2 border-[#080808] bg-[#F8F6EC] p-3 shadow-[2px_2px_0px_#080808]">
              <span className="font-mono text-[10px] font-bold text-[#080808]/70 uppercase block mb-1">
                Server Response Speed
              </span>
              <p className="font-mono text-xs font-black text-[#080808]">
                {pageDetail?.load_time ? `${pageDetail.load_time}ms` : "Instant"}
              </p>
            </div>
            <div className="border-2 border-[#080808] bg-[#F8F6EC] p-3 shadow-[2px_2px_0px_#080808]">
              <span className="font-mono text-[10px] font-bold text-[#080808]/70 uppercase block mb-1">
                Document Title
              </span>
              <p className="font-sans text-xs font-bold text-[#080808] truncate">
                {pageDetail?.title || "None Detected"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
