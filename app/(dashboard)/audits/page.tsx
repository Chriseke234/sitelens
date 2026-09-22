import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AuditUrlForm } from "@/components/audit/audit-url-form";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { FileSearch, ArrowRight, Search, Filter } from "lucide-react";

interface AuditsPageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function AuditsPage({ searchParams }: AuditsPageProps) {
  const supabase = await createClient();
  const { q = "", status = "all" } = await searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Query real database for current user's audits
  let query = supabase
    .from("audits")
    .select("*")
    .eq("user_id", user?.id || "")
    .order("created_at", { ascending: false });

  if (q.trim()) {
    query = query.ilike("url", `%${q.trim()}%`);
  }

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data: audits } = await query;
  const hasAudits = audits && audits.length > 0;

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Website Audits
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Analyze website technical SEO, performance, accessibility, UX, trust, and conversion metrics.
        </p>
      </div>

      {/* URL Submission Form Card */}
      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Audit a New Website</CardTitle>
          <CardDescription className="text-xs">
            Enter any public website URL to run a deterministic multi-layer audit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuditUrlForm buttonLabel="Start Audit" />
        </CardContent>
      </Card>

      {/* Audit History & Filter Card */}
      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <CardTitle className="text-lg font-bold">Audit History</CardTitle>
            <CardDescription className="text-xs">
              All website audits run for your account
            </CardDescription>
          </div>

          {/* Search & Status Filters Form */}
          <form method="GET" className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search URL..."
                className="rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <select
              name="status"
              defaultValue={status}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="analyzing">Analyzing</option>
              <option value="failed">Failed</option>
            </select>

            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Filter
            </button>
          </form>
        </CardHeader>

        <CardContent className="pt-6">
          {hasAudits ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 dark:border-slate-800">
                    <th className="pb-3 font-semibold">Website URL</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Overall Score</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold text-right">Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {audits.map((audit) => (
                    <tr key={audit.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                      <td className="py-3 font-mono font-medium text-slate-900 dark:text-slate-100 max-w-[200px] truncate sm:max-w-none">
                        {audit.url}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={
                            audit.status === "completed"
                              ? "success"
                              : audit.status === "failed"
                              ? "destructive"
                              : "secondary"
                          }
                          className="capitalize text-[10px]"
                        >
                          {audit.status}
                        </Badge>
                      </td>
                      <td className="py-3 font-bold text-slate-900 dark:text-slate-100">
                        {audit.overall_score !== null && audit.overall_score !== undefined
                          ? `${audit.overall_score}/100`
                          : "N/A"}
                      </td>
                      <td className="py-3 text-slate-400">
                        {new Date(audit.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/audits/${audit.id}`}
                          className="inline-flex items-center gap-1 font-semibold text-slate-900 hover:underline dark:text-slate-100"
                        >
                          <span>View</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No audits found"
              description={
                q || status !== "all"
                  ? "No website audits matched your filter query."
                  : "Give SiteLens a website URL above to generate your first technical and UX audit report."
              }
              icon={<FileSearch className="h-6 w-6" />}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
