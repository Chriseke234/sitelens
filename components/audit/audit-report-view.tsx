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
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { getScoreColorCategory } from "@/lib/utils";
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
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Spinner size="lg" className="mb-4" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {audit.status === "queued" ? "Your audit is queued." : "Analyzing your website..."}
        </h3>
        <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
          SiteLens is inspecting headers, DOM structure, SEO tags, performance metrics, and UX signals for <strong className="font-mono">{audit.url}</strong>.
        </p>
      </div>
    );
  }

  if (audit.status === "failed") {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center shadow-sm dark:border-rose-900/40 dark:bg-rose-950/30">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          We couldn&apos;t complete this audit
        </h3>
        <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          SiteLens was unable to reach or analyze <strong className="font-mono">{audit.url}</strong>. Please check that the URL is public and online.
        </p>
        <div className="mt-6">
          <Link href="/audits">
            <Button className="gap-2">
              <RefreshCw className="h-4 w-4" />
              <span>Try another audit</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Filter Issues
  const filteredIssues =
    activeSeverity === "all"
      ? initialIssues
      : initialIssues.filter((issue) => issue.severity === activeSeverity);

  const categoryCards = [
    { name: "SEO", score: audit.seo_score, icon: TrendingUp },
    { name: "Performance", score: audit.performance_score, icon: Gauge },
    { name: "Accessibility", score: audit.accessibility_score, icon: UserCheck },
    { name: "UX", score: audit.ux_score, icon: Layout },
    { name: "Trust", score: audit.trust_score, icon: ShieldCheck },
    { name: "Conversion", score: audit.conversion_score, icon: Target },
  ];

  const overallScoreInfo =
    audit.overall_score !== null && audit.overall_score !== undefined
      ? getScoreColorCategory(audit.overall_score)
      : null;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "scores", label: "Category Scores" },
    { id: "ai-analysis", label: "AI Analysis" },
    { id: "seo-keywords", label: "SEO Keywords" },
    { id: "issues", label: `Issues (${initialIssues.length})` },
    { id: "ux-conversion", label: "UX & Conversion" },
    { id: "technical", label: "Technical Details" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-slate-500" />
            <h1 className="font-mono text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              {audit.url}
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Completed on {new Date(audit.completed_at || audit.created_at).toLocaleString()}
          </p>
        </div>

        <Link href="/audits">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span>Run New Audit</span>
          </Button>
        </Link>
      </div>

      {/* Navigation Sub-header Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 no-scrollbar dark:border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Overall Health Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Overall Audit Score
                </span>
                <div className="mt-4 flex items-baseline gap-2">
                  {audit.overall_score !== null && audit.overall_score !== undefined ? (
                    <>
                      <span className="text-5xl font-extrabold text-slate-900 dark:text-white">
                        {audit.overall_score}
                      </span>
                      <span className="text-xl font-semibold text-slate-400">/ 100</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-slate-400">Not available</span>
                  )}
                </div>
              </div>

              {overallScoreInfo && (
                <div className="mt-6 flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${overallScoreInfo.colorClass}`} />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {overallScoreInfo.label} rating based on measured metrics
                  </span>
                </div>
              )}
            </div>

            {/* 6 Category Score Cards */}
            <div className="grid grid-cols-2 gap-3 lg:col-span-2 sm:grid-cols-3">
              {categoryCards.map((cat) => {
                const Icon = cat.icon;
                const hasScore = cat.score !== null && cat.score !== undefined;
                return (
                  <div
                    key={cat.name}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">{cat.name}</span>
                      <Icon className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {hasScore ? cat.score : "N/A"}
                      </span>
                      {hasScore && (
                        <span className="text-[10px] font-semibold text-slate-500">/100</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Section Preview in Overview */}
          <AuditAISection auditId={audit.id} />
        </div>
      )}

      {/* TAB 2: SCORES & METHODOLOGY */}
      {activeTab === "scores" && (
        <AuditScoreBreakdown detailedScores={(audit as any).detailedScores} />
      )}

      {/* TAB 3: AI ANALYSIS */}
      {activeTab === "ai-analysis" && (
        <AuditAISection auditId={audit.id} />
      )}

      {/* TAB 4: SEO KEYWORDS */}
      {activeTab === "seo-keywords" && (
        <AuditSEOKeywordsTab keywords={(audit as any).keywords} />
      )}

      {/* TAB 4: ISSUES */}
      {activeTab === "issues" && (
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <CardTitle className="text-lg font-bold">Measured Audit Findings</CardTitle>
              <CardDescription className="text-xs">
                {initialIssues.length} issue(s) identified from deterministic checks
              </CardDescription>
            </div>

            {/* Severity Filters */}
            <div className="flex flex-wrap items-center gap-1.5">
              {["all", "critical", "high", "medium", "low", "info"].map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setActiveSeverity(sev)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-colors ${
                    activeSeverity === sev
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {filteredIssues.length > 0 ? (
              <div className="space-y-4">
                {filteredIssues.map((issue) => (
                  <AuditIssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                No audit issues found for severity filter: <strong>{activeSeverity}</strong>.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 5: UX & CONVERSION */}
      {activeTab === "ux-conversion" && (
        <AuditUXConversionTab opportunities={(audit as any).opportunities || []} />
      )}

      {/* TAB 6: TECHNICAL DETAILS */}
      {activeTab === "technical" && (
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Technical Audit Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2 md:grid-cols-4">
              <div>
                <span className="text-slate-400">Final Target URL</span>
                <p className="font-mono font-medium text-slate-800 dark:text-slate-200 truncate">
                  {pageDetail?.url || audit.url}
                </p>
              </div>
              <div>
                <span className="text-slate-400">HTTP Status Code</span>
                <p className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {pageDetail?.status_code || 200} OK
                </p>
              </div>
              <div>
                <span className="text-slate-400">Server Response Time</span>
                <p className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {pageDetail?.load_time ? `${pageDetail.load_time}ms` : "N/A"}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Page Document Title</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                  {pageDetail?.title || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
