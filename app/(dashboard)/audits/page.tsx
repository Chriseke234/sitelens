import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AuditUrlForm } from "@/components/audit/audit-url-form";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { FileSearch, ArrowRight, Search } from "lucide-react";

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
    <div className="space-y-8 py-2">
      <div className="border-b-[3px] border-[#080808] pb-6">
        <div className="inline-block border-2 border-[#080808] bg-[#B7FF6A] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808]">
          CODE &amp; LIVE SITE AUDIT
        </div>
        <h1 className="mt-3 font-mono text-2xl font-black uppercase tracking-tight text-[#080808] sm:text-3xl">
          Website Audits
        </h1>
        <p className="mt-1 font-mono text-xs font-bold text-[#080808]/70">
          Analyze website technical SEO, performance, accessibility, UX, trust, and conversion metrics.
        </p>
      </div>

      {/* URL Submission Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Audit a New Website</CardTitle>
          <CardDescription>
            Enter any public website URL to run a deterministic multi-layer audit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuditUrlForm buttonLabel="Start Audit" />
        </CardContent>
      </Card>

      {/* Audit History & Filter Card */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Audit History</CardTitle>
            <CardDescription>
              All website audits run for your account
            </CardDescription>
          </div>

          {/* Search & Status Filters Form */}
          <form method="GET" className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#080808]" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search URL..."
                className="border-2 border-[#080808] bg-[#F8F6EC] pl-8 pr-3 py-1.5 font-mono text-xs font-bold text-[#080808] shadow-[2px_2px_0px_#080808] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FFE500]"
              />
            </div>

            <select
              name="status"
              defaultValue={status}
              className="border-2 border-[#080808] bg-[#F8F6EC] px-2.5 py-1.5 font-mono text-xs font-bold text-[#080808] shadow-[2px_2px_0px_#080808] focus:bg-white focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="analyzing">Analyzing</option>
              <option value="failed">Failed</option>
            </select>

            <button
              type="submit"
              className="border-2 border-[#080808] bg-[#FFE500] px-3 py-1.5 font-mono text-xs font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808] hover:translate-x-0.5 hover:translate-y-0.5"
            >
              Filter
            </button>
          </form>
        </CardHeader>

        <CardContent>
          {hasAudits ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left font-mono text-xs">
                <thead>
                  <tr className="border-b-2 border-[#080808] text-[#080808] bg-[#F8F6EC]">
                    <th className="py-2.5 px-3 font-black uppercase">Website URL</th>
                    <th className="py-2.5 px-3 font-black uppercase">Status</th>
                    <th className="py-2.5 px-3 font-black uppercase">Overall Score</th>
                    <th className="py-2.5 px-3 font-black uppercase">Date</th>
                    <th className="py-2.5 px-3 font-black uppercase text-right">Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#080808]/20">
                  {audits.map((audit) => (
                    <tr key={audit.id} className="hover:bg-[#F8F6EC]/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-[#080808] max-w-[200px] truncate sm:max-w-none">
                        {audit.url}
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          variant={
                            audit.status === "completed"
                              ? "success"
                              : audit.status === "failed"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {audit.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 font-black text-[#080808]">
                        {audit.overall_score !== null && audit.overall_score !== undefined
                          ? `${audit.overall_score}/100`
                          : "N/A"}
                      </td>
                      <td className="py-3 px-3 text-[#080808]/70">
                        {new Date(audit.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/audits/${audit.id}`}
                          className="inline-flex items-center gap-1 border-2 border-[#080808] bg-white px-2.5 py-1 text-[11px] font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808] hover:bg-[#FFE500]"
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
              title="No audits found"
              description={
                q || status !== "all"
                  ? "No website audits matched your filter query."
                  : "Give Aigenstra a website URL above to generate your first technical and UX audit report."
              }
              icon={<FileSearch className="h-6 w-6 stroke-[2.5]" />}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
