import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
    <div className="space-y-8 animate-fade-in">
      {/* Header Greeting & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl font-sans">
            {welcomeHeadline}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Overview of your website audits and site intelligence metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/audits">
            <Button size="sm" className="gap-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold btn-interactive">
              <Search className="h-4 w-4" />
              <span>New Audit</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 card-hover-effect">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Audits</span>
          <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{totalAudits}</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 card-hover-effect">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed</span>
          <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{completedCount}</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 card-hover-effect">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Score</span>
          <div className="mt-2 text-3xl font-extrabold text-blue-600 dark:text-blue-400">
            {avgScore !== null ? `${avgScore}/100` : "N/A"}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 card-hover-effect">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Open High Issues</span>
          <div className="mt-2 text-3xl font-extrabold text-rose-600 dark:text-rose-400">{criticalHighCount}</div>
        </div>
      </div>

      {/* Score Trend Section */}
      {trendPoints.length > 0 && (
        <ScoreTrendChart
          title={`Score Trend for ${latestAudit?.url}`}
          points={trendPoints}
        />
      )}

      {/* Main Grid: Recent Audits */}
      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg font-bold">Recent Audits</CardTitle>
            <CardDescription className="text-xs">
              Your recent website audit reports
            </CardDescription>
          </div>
          <History className="h-5 w-5 text-slate-400" />
        </CardHeader>
        <CardContent>
          {audits.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950">
                    <th className="py-2.5 px-3 font-semibold">Website URL</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Overall Score</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Date</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {audits.slice(0, 10).map((audit) => (
                    <tr key={audit.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                      <td className="py-3 px-3 font-mono font-medium text-slate-800 dark:text-slate-200">
                        {audit.url}
                      </td>
                      <td className="py-3 px-3 capitalize font-semibold">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[10px] ${
                            audit.status === "completed"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : audit.status === "failed"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {audit.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {audit.overall_score !== null ? `${audit.overall_score}/100` : "—"}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500">
                        {new Date(audit.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link href={`/audits/${audit.id}`}>
                          <Button size="sm" variant="outline" className="gap-1">
                            <span>View</span>
                            <ArrowRight className="h-3 w-3" />
                          </Button>
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
              icon={<FileSearch className="h-6 w-6" />}
              action={
                <Link href="/audits">
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <span>Start an Audit</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
