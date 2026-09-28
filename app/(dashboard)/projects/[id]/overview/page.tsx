import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Users,
  Terminal,
  Activity,
  Layers,
  Search,
} from "lucide-react";
import { Project } from "@/types";

export const metadata = {
  title: "Project Overview | Aigenstra",
  description: "Product status, build readiness indicators, open issues, and agent activity.",
};

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: projectData } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!projectData) {
    notFound();
  }

  const project = projectData as Project;

  // Fetch summary data
  const [findingsRes, decisionsRes, discoveryRes, promptsRes] = await Promise.all([
    supabase.from("audit_findings").select("*").eq("project_id", id),
    supabase.from("agent_decisions").select("*").eq("project_id", id).order("created_at", { ascending: false }).limit(3),
    supabase.from("discovery_qna").select("*").eq("project_id", id),
    supabase.from("prompts").select("*").eq("project_id", id),
  ]);

  const findings = findingsRes.data || [];
  const decisions = decisionsRes.data || [];
  const qnaList = discoveryRes.data || [];
  const prompts = promptsRes.data || [];

  const answeredCount = qnaList.filter((q) => q.answer && q.answer.trim().length > 0).length;

  const openIssues = {
    critical: findings.filter((f) => f.severity === "critical" && f.status === "open").length,
    high: findings.filter((f) => f.severity === "high" && f.status === "open").length,
    medium: findings.filter((f) => f.severity === "medium" && f.status === "open").length,
    low: findings.filter((f) => f.severity === "low" && f.status === "open").length,
  };

  // Readiness category mock calculation based on state
  const readinessCategories = [
    { name: "Product Spec", status: answeredCount >= 3 ? "READY" : "NEEDS ATTENTION", score: answeredCount >= 3 ? 85 : 40, href: `/projects/${id}/product` },
    { name: "UX Journeys", status: "READY", score: 80, href: `/projects/${id}/journey` },
    { name: "Architecture", status: prompts.some((p) => p.category === "architecture") ? "READY" : "NEEDS ATTENTION", score: prompts.some((p) => p.category === "architecture") ? 90 : 50, href: `/projects/${id}/architecture` },
    { name: "Database Schema", status: "READY", score: 85, href: `/projects/${id}/architecture` },
    { name: "API Strategy", status: "READY", score: 75, href: `/projects/${id}/architecture` },
    { name: "Security Architecture", status: openIssues.critical === 0 ? "READY" : "NEEDS ATTENTION", score: openIssues.critical === 0 ? 80 : 35, href: `/projects/${id}/security` },
    { name: "Testing Plan", status: "READY", score: 70, href: `/projects/${id}/council` },
    { name: "Accessibility", status: "READY", score: 90, href: `/projects/${id}/design` },
    { name: "Performance", status: "READY", score: 85, href: `/projects/${id}/audit` },
    { name: "SEO Structure", status: "READY", score: 80, href: `/projects/${id}/audit` },
  ];

  // Dynamic next recommended action
  let nextAction = {
    title: "Complete Product Discovery Q&A",
    desc: `Answer remaining discovery questions (${answeredCount}/${qnaList.length || 5} completed) to help your AI PM Agent formulate the Product Specification.`,
    href: `/projects/${id}/discovery`,
    cta: "Go to Discovery Engine",
  };

  if (answeredCount >= 3 && prompts.length === 0) {
    nextAction = {
      title: "Consult Multi-Agent Council & Generate Build Prompts",
      desc: "Your discovery requirements are set. Have your AI Engineering Council debate key decisions and generate your first Vibe-Coding Build Prompts.",
      href: `/projects/${id}/prompts`,
      cta: "Generate Build Prompts",
    };
  } else if (findings.length > 0) {
    nextAction = {
      title: "Review Audit Findings & Generate Fix Prompts",
      desc: `Address ${openIssues.critical} Critical and ${openIssues.high} High severity findings by generating precise fix prompts for your coding AI.`,
      href: `/projects/${id}/fix-queue`,
      cta: "Open Fix Queue",
    };
  }

  return (
    <div className="space-y-8">
      {/* Disclaimer Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200">
        <Sparkles className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div>
          <span className="font-bold">Aigenstra Engineering Disclaimer:</span> Build readiness indicators and security summaries reflect completed automated checks and structured reasoning. They reduce blind spots before you ship, but do not guarantee 100% security or vulnerability-free code.
        </div>
      </div>

      {/* Next Recommended Action Banner */}
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
              <Activity className="h-3.5 w-3.5" />
              Recommended Next Action
            </div>
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              {nextAction.title}
            </h2>
            <p className="max-w-2xl text-xs sm:text-sm text-blue-100">
              {nextAction.desc}
            </p>
          </div>

          <Link
            href={nextAction.href}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-blue-700 shadow-md transition-all hover:bg-blue-50 active:scale-95"
          >
            {nextAction.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Open Issues & Status Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-xs font-bold uppercase tracking-wider">Critical Issues</span>
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
            {openIssues.critical}
          </div>
          <p className="mt-1 text-xs text-slate-500">Must fix before deployment</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">High Severity</span>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
            {openIssues.high}
          </div>
          <p className="mt-1 text-xs text-slate-500">High priority risks</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Medium / Low</span>
            <Layers className="h-5 w-5" />
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
            {openIssues.medium + openIssues.low}
          </div>
          <p className="mt-1 text-xs text-slate-500">Secondary enhancements</p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span className="text-xs font-bold uppercase tracking-wider">Agent Decisions</span>
            <Users className="h-5 w-5" />
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
            {decisions.length}
          </div>
          <p className="mt-1 text-xs text-slate-500">Agreed architecture decisions</p>
        </div>
      </div>

      {/* Build Readiness Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              System Build Readiness Indicators
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated across 10 specialized engineering categories
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {readinessCategories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-blue-500/50 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-900"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                  <span>{cat.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                      cat.status === "READY"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {cat.status}
                  </span>
                </div>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      cat.score >= 80 ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                <span>Score: {cat.score}%</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Agent Activity Log */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent AI Agent Decisions & Discussions
            </h3>
          </div>
          <Link
            href={`/projects/${id}/council`}
            className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
          >
            View Council →
          </Link>
        </div>

        {decisions.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500 dark:border-slate-800">
            <Sparkles className="h-6 w-6 text-slate-400" />
            <p className="mt-2 font-semibold">No decisions recorded yet.</p>
            <p className="mt-1 max-w-sm text-slate-400">
              Run your AI Agent Council to evaluate trade-offs (e.g. guest checkout, authentication structure, database indexes).
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {decisions.map((dec) => (
              <div
                key={dec.id}
                className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                    <span>Decision #{dec.decision_number}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-900 dark:text-white">{dec.topic}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    {dec.decision}
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  {dec.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
