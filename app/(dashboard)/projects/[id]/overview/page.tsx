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
  Activity,
  Layers,
  FileCode2,
  TrendingUp,
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

  // Fetch actual project artifacts in parallel to compute real progress
  const [
    findingsRes,
    decisionsRes,
    discoveryRes,
    researchRes,
    journeyRes,
    productRes,
    designRes,
    archRes,
    secRes,
    promptsRes,
  ] = await Promise.all([
    supabase.from("audit_findings").select("*").eq("project_id", id),
    supabase.from("agent_decisions").select("*").eq("project_id", id).order("created_at", { ascending: false }).limit(3),
    supabase.from("discovery_qna").select("*").eq("project_id", id),
    supabase.from("research_documents").select("id").eq("project_id", id).limit(1),
    supabase.from("user_journeys").select("id").eq("project_id", id).limit(1),
    supabase.from("product_specs").select("id").eq("project_id", id).limit(1),
    supabase.from("design_specs").select("id").eq("project_id", id).limit(1),
    supabase.from("architecture_docs").select("id").eq("project_id", id).limit(1),
    supabase.from("security_plans").select("id").eq("project_id", id).limit(1),
    supabase.from("prompts").select("*").eq("project_id", id),
  ]);

  const findings = findingsRes.data || [];
  const decisions = decisionsRes.data || [];
  const qnaList = discoveryRes.data || [];
  const hasResearch = (researchRes.data?.length || 0) > 0;
  const hasJourney = (journeyRes.data?.length || 0) > 0;
  const hasProduct = (productRes.data?.length || 0) > 0;
  const hasDesign = (designRes.data?.length || 0) > 0;
  const hasArch = (archRes.data?.length || 0) > 0;
  const hasSecurity = (secRes.data?.length || 0) > 0;
  const prompts = promptsRes.data || [];

  const answeredCount = qnaList.filter((q) => q.answer && q.answer.trim().length > 0).length;
  const hasDiscovery = answeredCount >= 2;

  // Calculate real progress percentage (10 stages)
  const stageWeights = [
    hasDiscovery ? 10 : answeredCount > 0 ? 5 : 0,
    hasResearch ? 10 : 0,
    hasJourney ? 10 : 0,
    hasProduct ? 10 : 0,
    hasDesign ? 10 : 0,
    hasArch ? 10 : 0,
    hasSecurity ? 10 : 0,
    decisions.length > 0 ? 10 : 0,
    prompts.length > 0 ? 10 : 0,
    findings.length > 0 ? 10 : 0,
  ];
  const totalProgressPct = stageWeights.reduce((a, b) => a + b, 0);

  const openIssues = {
    critical: findings.filter((f) => f.severity === "critical" && f.status === "open").length,
    high: findings.filter((f) => f.severity === "high" && f.status === "open").length,
    medium: findings.filter((f) => f.severity === "medium" && f.status === "open").length,
    low: findings.filter((f) => f.severity === "low" && f.status === "open").length,
  };

  // Readiness categories based on actual database stage records
  const readinessCategories = [
    { name: "Product Spec", status: hasProduct ? "READY" : "NEEDS ATTENTION", score: hasProduct ? 100 : answeredCount >= 2 ? 50 : 20, href: `/projects/${id}/product` },
    { name: "UX Journeys", status: hasJourney ? "READY" : "NEEDS ATTENTION", score: hasJourney ? 100 : 20, href: `/projects/${id}/journey` },
    { name: "Design System", status: hasDesign ? "READY" : "NEEDS ATTENTION", score: hasDesign ? 100 : 20, href: `/projects/${id}/design` },
    { name: "Architecture", status: hasArch ? "READY" : "NEEDS ATTENTION", score: hasArch ? 100 : 20, href: `/projects/${id}/architecture` },
    { name: "Security Architecture", status: hasSecurity && openIssues.critical === 0 ? "READY" : "NEEDS ATTENTION", score: hasSecurity ? (openIssues.critical === 0 ? 100 : 50) : 20, href: `/projects/${id}/security` },
    { name: "Agent Council & ADRs", status: decisions.length > 0 ? "READY" : "NEEDS ATTENTION", score: decisions.length > 0 ? 100 : 20, href: `/projects/${id}/council` },
    { name: "Vibe Build Prompts", status: prompts.length > 0 ? "READY" : "NEEDS ATTENTION", score: prompts.length > 0 ? 100 : 20, href: `/projects/${id}/prompts` },
    { name: "Code & Quality Audit", status: findings.length > 0 ? "READY" : "NEEDS ATTENTION", score: findings.length > 0 ? 100 : 20, href: `/projects/${id}/audit` },
  ];

  // Dynamic next recommended action
  let nextAction = {
    title: "Complete Product Discovery Q&A",
    desc: `Answer remaining discovery questions (${answeredCount}/${qnaList.length || 5} completed) to help your AI PM Agent formulate the Product Specification.`,
    href: `/projects/${id}/discovery`,
    cta: "Go to Discovery Engine",
  };

  if (!hasProduct && answeredCount >= 2) {
    nextAction = {
      title: "Synthesize Product Requirements (PRD)",
      desc: "Your discovery answers are ready. Formulate personas, FRs, NFRs, edge cases, and anti-bloat scope boundaries.",
      href: `/projects/${id}/product`,
      cta: "Generate PRD",
    };
  } else if (!hasArch && hasProduct) {
    nextAction = {
      title: "Design Technical Architecture & Security Model",
      desc: "Generate your database entities, API endpoints, auth model, and zero-trust security plan.",
      href: `/projects/${id}/architecture`,
      cta: "Plan Architecture",
    };
  } else if (decisions.length === 0 && hasArch) {
    nextAction = {
      title: "Consult Multi-Agent Council & Record ADRs",
      desc: "Have the 7 specialized agents debate architecture trade-offs and record formal Architecture Decision Records.",
      href: `/projects/${id}/council`,
      cta: "Convene Agent Council",
    };
  } else if (prompts.length === 0 && decisions.length > 0) {
    nextAction = {
      title: "Generate 11-Part Vibe-Coding Implementation Prompts",
      desc: "Transform your PRD, Architecture, and Council Decisions into structured prompts for Cursor, Claude Code, and Lovable.",
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
      {/* Project Header with Progress Indicator */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {project.product_type || "SaaS"}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">
                Environment: {project.coding_environment || "Cursor"}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              {project.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              {project.description || project.raw_idea || "AI-assisted product engineering workspace."}
            </p>
          </div>

          {/* Real Stage Completion Metric */}
          <div className="flex flex-col items-start sm:items-end rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-950 dark:bg-indigo-950/20">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="h-3.5 w-3.5" />
              Project Readiness
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              {totalProgressPct}%
            </div>
            <div className="mt-2 h-1.5 w-32 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full bg-indigo-600 transition-all duration-500"
                style={{ width: `${totalProgressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Next Action Banner */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
              <Activity className="h-3.5 w-3.5" />
              Recommended Next Action
            </div>
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              {nextAction.title}
            </h2>
            <p className="max-w-2xl text-xs sm:text-sm text-indigo-100">
              {nextAction.desc}
            </p>
          </div>

          <Link
            href={nextAction.href}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-indigo-700 shadow-md transition-all hover:bg-indigo-50 active:scale-95"
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

        <div className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
            <span className="text-xs font-bold uppercase tracking-wider">Agent Decisions</span>
            <Users className="h-5 w-5" />
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
            {decisions.length}
          </div>
          <p className="mt-1 text-xs text-slate-500">Agreed architecture records</p>
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
              Evaluated across core product engineering domains
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {readinessCategories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-indigo-500/50 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-900"
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

              <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
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
            <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent AI Agent Decisions & ADRs
            </h3>
          </div>
          <Link
            href={`/projects/${id}/council`}
            className="text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            View Council →
          </Link>
        </div>

        {decisions.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500 dark:border-slate-800">
            <Sparkles className="h-6 w-6 text-slate-400" />
            <p className="mt-2 font-semibold">No decisions recorded yet.</p>
            <p className="mt-1 max-w-sm text-slate-400">
              Convene the 7-Agent Council to evaluate trade-offs (e.g. guest checkout, authentication structure, database indexes).
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
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <span>ADR-{String(dec.decision_number).padStart(3, "0")}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-900 dark:text-white">{dec.topic}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    {dec.decision}
                  </p>
                </div>
                <div className="text-right text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  {dec.status || "ACCEPTED"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
