import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { ScoreTrendChart, TrendPoint } from "@/components/dashboard/score-trend-chart";
import {
  Search,
  ShieldCheck,
  FileSearch,
  ArrowRight,
  History,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("user_id", user?.id || "")
    .maybeSingle();

  // Fetch all user's audits for aggregate statistics
  const { data: allAudits } = await supabase
    .from("audits")
    .select("id, url, status, overall_score, created_at")
    .eq("user_id", user?.id || "")
    .order("created_at", { ascending: false });

  const audits = allAudits || [];
  const totalAudits = audits.length;
  const completedAudits = audits.filter((a) => a.status === "completed");
  const completedCount = completedAudits.length;

  const validScores = completedAudits
    .map((a) => a.overall_score)
    .filter((s): s is number => typeof s === "number");

  const avgScore =
    validScores.length > 0
      ? Math.round(validScores.reduce((sum, val) => sum + val, 0) / validScores.length)
      : null;

  const latestAudit = audits.length > 0 ? audits[0] : null;

  // Fetch issue stats for user's latest audit
  let criticalHighCount = 0;
  let mediumCount = 0;
  let lowInfoCount = 0;

  if (latestAudit) {
    const { data: issues } = await supabase
      .from("audit_issues")
      .select("severity")
      .eq("audit_id", latestAudit.id);

    if (issues) {
      issues.forEach((i) => {
        if (i.severity === "critical" || i.severity === "high") criticalHighCount++;
        else if (i.severity === "medium") mediumCount++;
        else lowInfoCount++;
      });
    }
  }

  // Build trend points if latest audit domain has multiple completed audits
  let trendPoints: TrendPoint[] = [];
  if (latestAudit && latestAudit.url) {
    const siteAudits = completedAudits
      .filter((a) => a.url === latestAudit.url && typeof a.overall_score === "number")
      .slice(0, 10)
      .reverse();

    trendPoints = siteAudits.map((a) => ({
      label: a.url,
      date: a.created_at,
      score: a.overall_score as number,
    }));
  }

  const fullName = profile?.full_name || user?.user_metadata?.full_name;
  const welcomeHeadline = fullName ? `Welcome back, ${fullName}` : "Welcome back";

  return (
    <div className="space-y-8">
      {/* Header Greeting & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b-[3px] border-[#080808] pb-6">
        <div>
          <div className="inline-block border-2 border-[#080808] bg-[#FFE500] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808]">
            WORKSPACE COMMAND
          </div>
          <h1 className="mt-2 font-mono text-2xl font-black uppercase tracking-tight text-[#080808] sm:text-3xl">
            {welcomeHeadline}
          </h1>
          <p className="mt-1 font-mono text-xs font-bold text-[#080808]/70">
            Overview of your website audits, prompt blueprints, and intelligence metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/audits"
            className="inline-flex items-center gap-2 border-2 border-[#080808] bg-[#FFE500] px-4 py-2 font-mono text-xs font-black uppercase tracking-wider text-[#080808] shadow-[3px_3px_0px_#080808] transition-all hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1"
          >
            <Search className="h-4 w-4 stroke-[2.5]" />
            <span>New Audit</span>
          </Link>
        </div>
      </div>

      {/* 4 Bento Overview Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Audits */}
        <div className="border-[3px] border-[#080808] bg-white p-5 shadow-[5px_5px_0px_#080808]">
          <div className="flex items-center justify-between border-b-2 border-[#080808] pb-2 font-mono">
            <span className="text-[11px] font-black uppercase text-[#080808]/70">TOTAL AUDITS</span>
            <span className="border border-[#080808] bg-[#F8F6EC] px-1.5 py-0.2 text-[9px] font-bold">ALL</span>
          </div>
          <div className="mt-3 font-mono text-3xl font-black text-[#080808]">{totalAudits}</div>
        </div>

        {/* Completed */}
        <div className="border-[3px] border-[#080808] bg-white p-5 shadow-[5px_5px_0px_#080808]">
          <div className="flex items-center justify-between border-b-2 border-[#080808] pb-2 font-mono">
            <span className="text-[11px] font-black uppercase text-[#080808]/70">COMPLETED</span>
            <span className="border border-[#080808] bg-[#B7FF6A] px-1.5 py-0.2 text-[9px] font-bold">DONE</span>
          </div>
          <div className="mt-3 font-mono text-3xl font-black text-[#080808]">{completedCount}</div>
        </div>

        {/* Average Score */}
        <div className="border-[3px] border-[#080808] bg-[#FFE500] p-5 shadow-[5px_5px_0px_#080808]">
          <div className="flex items-center justify-between border-b-2 border-[#080808] pb-2 font-mono">
            <span className="text-[11px] font-black uppercase text-[#080808]">AVERAGE SCORE</span>
            <span className="border border-[#080808] bg-white px-1.5 py-0.2 text-[9px] font-bold">HEALTH</span>
          </div>
          <div className="mt-3 font-mono text-3xl font-black text-[#080808]">
            {avgScore !== null ? `${avgScore}/100` : "N/A"}
          </div>
        </div>

        {/* Open High Issues */}
        <div className="border-[3px] border-[#080808] bg-[#FF4F9A] p-5 shadow-[5px_5px_0px_#080808] text-white">
          <div className="flex items-center justify-between border-b-2 border-white/60 pb-2 font-mono">
            <span className="text-[11px] font-black uppercase text-white">OPEN HIGH ISSUES</span>
            <span className="border border-white bg-white text-[#080808] px-1.5 py-0.2 text-[9px] font-bold">QA</span>
          </div>
          <div className="mt-3 font-mono text-3xl font-black text-white">{criticalHighCount}</div>
        </div>
      </div>

      {/* Score Trend Section */}
      {trendPoints.length > 0 && (
        <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[6px_6px_0px_#080808]">
          <ScoreTrendChart
            title={`Score Trend for ${latestAudit?.url}`}
            points={trendPoints}
          />
        </div>
      )}

      {/* Main Bento Card: Recent Audits */}
      <div className="border-[3px] border-[#080808] bg-white shadow-[6px_6px_0px_#080808]">
        <div className="flex flex-row items-center justify-between border-b-[3px] border-[#080808] bg-[#F8F6EC] p-4">
          <div>
            <h2 className="font-mono text-base font-black uppercase text-[#080808]">
              Recent Audits
            </h2>
            <p className="font-mono text-xs font-bold text-[#080808]/60">
              Your recent website audit reports &amp; inspection records
            </p>
          </div>
          <History className="h-5 w-5 text-[#080808] stroke-[2.5]" />
        </div>

        <div className="p-4 sm:p-6">
          {audits.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left font-mono text-xs">
                <thead>
                  <tr className="border-b-2 border-[#080808] bg-[#F8F6EC] text-[#080808]">
                    <th className="py-2.5 px-3 font-black uppercase">Website URL</th>
                    <th className="py-2.5 px-3 font-black uppercase">Status</th>
                    <th className="py-2.5 px-3 font-black uppercase text-right">Overall Score</th>
                    <th className="py-2.5 px-3 font-black uppercase text-right">Date</th>
                    <th className="py-2.5 px-3 font-black uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#080808]/20">
                  {audits.slice(0, 10).map((audit) => (
                    <tr key={audit.id} className="hover:bg-[#F8F6EC]/80 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-[#080808]">
                        {audit.url}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block border border-[#080808] px-2 py-0.5 text-[10px] font-black uppercase shadow-[1px_1px_0px_#080808] ${
                            audit.status === "completed"
                              ? "bg-[#B7FF6A] text-[#080808]"
                              : audit.status === "failed"
                              ? "bg-red-200 text-red-950"
                              : "bg-[#FFE500] text-[#080808]"
                          }`}
                        >
                          {audit.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-black text-[#080808]">
                        {audit.overall_score !== null ? `${audit.overall_score}/100` : "—"}
                      </td>
                      <td className="py-3.5 px-3 text-right text-[#080808]/70">
                        {new Date(audit.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <Link
                          href={`/audits/${audit.id}`}
                          className="inline-flex items-center gap-1 border-2 border-[#080808] bg-white px-2.5 py-1 text-[11px] font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808] hover:bg-[#FFE500] hover:translate-x-0.5 hover:translate-y-0.5"
                        >
                          <span>View</span>
                          <ArrowRight className="h-3 w-3 stroke-[2.5]" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No audits yet"
              description="Run your first website audit to start uncovering issues and opportunities."
              icon={<FileSearch className="h-6 w-6 stroke-[2.5]" />}
              action={
                <Link
                  href="/audits"
                  className="inline-flex items-center gap-1.5 border-2 border-[#080808] bg-[#FFE500] px-4 py-2 font-mono text-xs font-black uppercase text-[#080808] shadow-[3px_3px_0px_#080808]"
                >
                  <span>Start an Audit</span>
                  <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
                </Link>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
