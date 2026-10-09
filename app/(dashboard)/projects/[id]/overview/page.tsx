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
  BookMarked,
  Activity,
  Layers,
  FileCode2,
  TrendingUp,
  Compass,
  Terminal,
  SearchCheck,
} from "lucide-react";
import { Project } from "@/types";

export const metadata = {
  title: "Project Overview | Aigenstra",
  description: "Product status, build readiness indicators, open issues, and tour guide next actions.",
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
    productRes,
    journeyRes,
    archRes,
    secRes,
    promptsRes,
  ] = await Promise.all([
    supabase.from("audit_findings").select("*").eq("project_id", id),
    supabase.from("agent_decisions").select("*").eq("project_id", id).order("created_at", { ascending: false }).limit(3),
    supabase.from("discovery_qna").select("*").eq("project_id", id),
    supabase.from("product_specs").select("id").eq("project_id", id).limit(1),
    supabase.from("user_journeys").select("id").eq("project_id", id).limit(1),
    supabase.from("architecture_docs").select("id").eq("project_id", id).limit(1),
    supabase.from("security_plans").select("id").eq("project_id", id).limit(1),
    supabase.from("prompts").select("*").eq("project_id", id),
  ]);

  const findings = findingsRes.data || [];
  const decisions = decisionsRes.data || [];
  const qnaList = discoveryRes.data || [];
  const hasProduct = (productRes.data?.length || 0) > 0;
  const hasJourney = (journeyRes.data?.length || 0) > 0;
  const hasArch = (archRes.data?.length || 0) > 0;
  const hasSecurity = (secRes.data?.length || 0) > 0;
  const prompts = promptsRes.data || [];

  const answeredCount = qnaList.filter((q) => q.answer && q.answer.trim().length > 0).length;
  const hasDiscovery = answeredCount >= 2;

  // Calculate real progress percentage
  const stageWeights = [
    hasDiscovery ? 20 : answeredCount > 0 ? 10 : 0,
    hasProduct ? 20 : 0,
    hasArch ? 20 : 0,
    decisions.length > 0 ? 15 : 0,
    prompts.length > 0 ? 15 : 0,
    findings.length > 0 ? 10 : 0,
  ];
  const totalProgressPct = Math.min(100, stageWeights.reduce((a, b) => a + b, 0));

  const openIssues = {
    critical: findings.filter((f) => f.severity === "critical" && f.status === "open").length,
    high: findings.filter((f) => f.severity === "high" && f.status === "open").length,
    medium: findings.filter((f) => f.severity === "medium" && f.status === "open").length,
    low: findings.filter((f) => f.severity === "low" && f.status === "open").length,
  };

  // Readiness categories based on actual database stage records
  const readinessCategories = [
    { name: "Discovery & Decisions", status: hasDiscovery ? "DECIDED" : "IN PROGRESS", score: hasDiscovery ? 100 : answeredCount > 0 ? 50 : 20, href: `/projects/${id}/discovery` },
    { name: "Software Blueprint", status: hasProduct ? "READY" : "NEEDS ATTENTION", score: hasProduct ? 100 : answeredCount >= 2 ? 50 : 20, href: `/projects/${id}/product` },
    { name: "Architecture & Security", status: hasArch ? "READY" : "NEEDS ATTENTION", score: hasArch ? 100 : 20, href: `/projects/${id}/architecture` },
    { name: "Decision Log & ADRs", status: decisions.length > 0 ? "RECORDED" : "EMPTY", score: decisions.length > 0 ? 100 : 20, href: `/projects/${id}/decisions` },
    { name: "Coding Prompts", status: prompts.length > 0 ? "COMPILED" : "NOT GENERATED", score: prompts.length > 0 ? 100 : 20, href: `/projects/${id}/prompts` },
    { name: "Code Audit & Fixes", status: findings.length > 0 ? "AUDITED" : "READY TO AUDIT", score: findings.length > 0 ? 100 : 20, href: `/projects/${id}/audit` },
  ];

  // Dynamic next recommended action based on tour guide stages
  let nextAction = {
    title: "Clarify Key Product Decisions",
    desc: `Answer essential discovery questions (${answeredCount}/${qnaList.length || 4} decided) to shape your software blueprint.`,
    href: `/projects/${id}/discovery`,
    cta: "Go to Discovery Engine",
  };

  if (!hasProduct && answeredCount >= 2) {
    nextAction = {
      title: "Synthesize Software Blueprint",
      desc: "Your discovery answers are ready. Formulate journeys, screen specs, data entities, and security rules.",
      href: `/projects/${id}/product`,
      cta: "Generate Blueprint",
    };
  } else if (!hasArch && hasProduct) {
    nextAction = {
      title: "Review Technical Architecture & Security",
      desc: "Inspect database entities, API endpoints, auth model, and server-side zero-trust security.",
      href: `/projects/${id}/architecture`,
      cta: "View Architecture",
    };
  } else if (prompts.length === 0 && (hasArch || hasProduct)) {
    nextAction = {
      title: "Generate Precision Coding Prompts",
      desc: `Compile context-optimized 16-part prompts specifically formatted for ${project.coding_environment || "your coding agent"}.`,
      href: `/projects/${id}/prompts`,
      cta: "Open Prompt Studio",
    };
  } else if (findings.length > 0) {
    nextAction = {
      title: "Review Audit Findings & Generate Fix Prompts",
      desc: `Address ${openIssues.critical} Critical and ${openIssues.high} High severity findings with targeted remediation prompts.`,
      href: `/projects/${id}/fix-queue`,
      cta: "Open Fix Queue",
    };
  }

  return (
    <div className="space-y-6 font-mono">
      {/* 1. Next Recommended Action Hero Bento Card */}
      <div className="border-[3px] border-[#080808] bg-[#FFE500] p-6 shadow-[6px_6px_0px_#080808]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 border-2 border-[#080808] bg-white px-2.5 py-0.5 text-[11px] font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808]">
              <Activity className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Recommended Next Step for Your Project</span>
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#080808] sm:text-2xl">
              {nextAction.title}
            </h2>
            <p className="text-xs font-medium text-[#080808]/85 sm:text-sm">
              {nextAction.desc}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Link
              href={nextAction.href}
              className="inline-flex items-center gap-2 border-[3px] border-[#080808] bg-[#080808] px-5 py-3 text-xs font-black uppercase text-[#FFE500] shadow-[4px_4px_0px_rgba(0,0,0,0.25)] transition-all hover:bg-white hover:text-[#080808] hover:shadow-[5px_5px_0px_#080808] active:translate-x-0.5 active:translate-y-0.5"
            >
              <span>{nextAction.cta}</span>
              <ArrowRight className="h-4 w-4 stroke-[3]" />
            </Link>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 border-t-2 border-[#080808] pt-4">
          <div className="flex items-center justify-between text-xs font-black uppercase text-[#080808] mb-2">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 stroke-[2.5]" />
              Overall Build Readiness
            </span>
            <span className="border-2 border-[#080808] bg-white px-2 py-0.5 shadow-[2px_2px_0px_#080808]">
              {totalProgressPct}% COMPLETE
            </span>
          </div>
          <div className="h-4 w-full border-2 border-[#080808] bg-white p-0.5 shadow-[2px_2px_0px_#080808]">
            <div
              className="h-full bg-[#080808] transition-all duration-500"
              style={{ width: `${totalProgressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. The 5 Bento Stage Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#080808] flex items-center gap-2">
            <span className="border-2 border-[#080808] bg-[#080808] text-white px-1.5 py-0.5 text-[10px]">
              STEP-BY-STEP
            </span>
            The 5 Core Bento Stages
          </h3>
          <span className="text-[10px] text-[#080808]/60 font-bold uppercase hidden sm:inline">
            Click any stage to inspect or edit
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {/* Stage 01: Understand */}
          <Link
            href={`/projects/${id}/discovery`}
            className="group flex flex-col justify-between border-[3px] border-[#080808] bg-white p-4 shadow-[4px_4px_0px_#080808] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#080808]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="border-2 border-[#080808] bg-[#FFE500] px-2 py-0.5 text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_#080808]">
                  01 · UNDERSTAND
                </span>
                <Compass className="h-4 w-4 stroke-[2.5] text-[#080808]" />
              </div>

              <div>
                <h4 className="text-sm font-black uppercase text-[#080808] group-hover:underline">
                  Discovery & Q&A
                </h4>
                <p className="mt-1 text-[11px] font-medium text-[#080808]/75 leading-tight">
                  Clarify the core problem, user personas, and product scope.
                </p>
              </div>

              <div className="border border-[#080808] bg-[#F8F6EC] p-2 text-[10px] font-bold">
                <div className="flex justify-between text-[#080808]">
                  <span>Decisions:</span>
                  <span className="font-black">{answeredCount} of {qnaList.length || 4}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-[#080808]/15 flex items-center justify-between text-[11px] font-black uppercase">
              <span
                className={`border border-[#080808] px-1.5 py-0.5 text-[9px] ${
                  hasDiscovery ? "bg-[#B7FF6A] text-[#080808]" : "bg-white text-[#080808]"
                }`}
              >
                {hasDiscovery ? "DONE" : "IN PROGRESS"}
              </span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2.5] transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Stage 02: Blueprint */}
          <Link
            href={`/projects/${id}/product`}
            className="group flex flex-col justify-between border-[3px] border-[#080808] bg-white p-4 shadow-[4px_4px_0px_#080808] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#080808]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="border-2 border-[#080808] bg-[#B7FF6A] px-2 py-0.5 text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_#080808]">
                  02 · BLUEPRINT
                </span>
                <FileCode2 className="h-4 w-4 stroke-[2.5] text-[#080808]" />
              </div>

              <div>
                <h4 className="text-sm font-black uppercase text-[#080808] group-hover:underline">
                  Specs & Architecture
                </h4>
                <p className="mt-1 text-[11px] font-medium text-[#080808]/75 leading-tight">
                  Screen breakdown, user journeys, data model, and security rules.
                </p>
              </div>

              <div className="border border-[#080808] bg-[#F8F6EC] p-2 text-[10px] font-bold">
                <div className="flex justify-between text-[#080808]">
                  <span>Specs Status:</span>
                  <span className="font-black">{hasProduct ? "Synthesized" : "Pending"}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-[#080808]/15 flex items-center justify-between text-[11px] font-black uppercase">
              <span
                className={`border border-[#080808] px-1.5 py-0.5 text-[9px] ${
                  hasProduct ? "bg-[#B7FF6A] text-[#080808]" : "bg-white text-[#080808]"
                }`}
              >
                {hasProduct ? "READY" : "NEEDS ACTION"}
              </span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2.5] transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Stage 03: Prompts */}
          <Link
            href={`/projects/${id}/prompts`}
            className="group flex flex-col justify-between border-[3px] border-[#080808] bg-white p-4 shadow-[4px_4px_0px_#080808] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#080808]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="border-2 border-[#080808] bg-[#FFE500] px-2 py-0.5 text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_#080808]">
                  03 · PROMPTS
                </span>
                <Terminal className="h-4 w-4 stroke-[2.5] text-[#080808]" />
              </div>

              <div>
                <h4 className="text-sm font-black uppercase text-[#080808] group-hover:underline">
                  Agent Prompt Studio
                </h4>
                <p className="mt-1 text-[11px] font-medium text-[#080808]/75 leading-tight">
                  High-precision prompt compiler tailored for {project.coding_environment || "AI"}.
                </p>
              </div>

              <div className="border border-[#080808] bg-[#F8F6EC] p-2 text-[10px] font-bold">
                <div className="flex justify-between text-[#080808]">
                  <span>Compiled:</span>
                  <span className="font-black">{prompts.length} Prompts</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-[#080808]/15 flex items-center justify-between text-[11px] font-black uppercase">
              <span
                className={`border border-[#080808] px-1.5 py-0.5 text-[9px] ${
                  prompts.length > 0 ? "bg-[#B7FF6A] text-[#080808]" : "bg-white text-[#080808]"
                }`}
              >
                {prompts.length > 0 ? "READY" : "AWAITING"}
              </span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2.5] transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Stage 04: Audit */}
          <Link
            href={`/projects/${id}/audit`}
            className="group flex flex-col justify-between border-[3px] border-[#080808] bg-white p-4 shadow-[4px_4px_0px_#080808] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#080808]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="border-2 border-[#080808] bg-[#FF4F9A] px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-[1.5px_1.5px_0px_#080808]">
                  04 · AUDIT
                </span>
                <SearchCheck className="h-4 w-4 stroke-[2.5] text-[#080808]" />
              </div>

              <div>
                <h4 className="text-sm font-black uppercase text-[#080808] group-hover:underline">
                  Audit & Fixes
                </h4>
                <p className="mt-1 text-[11px] font-medium text-[#080808]/75 leading-tight">
                  Verify what your agent built and generate immediate targeted fix prompts.
                </p>
              </div>

              <div className="border border-[#080808] bg-[#F8F6EC] p-2 text-[10px] font-bold">
                <div className="flex justify-between text-[#080808]">
                  <span>Open Issues:</span>
                  <span className="font-black text-[#FF4F9A]">
                    {openIssues.critical + openIssues.high} Urgent
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-[#080808]/15 flex items-center justify-between text-[11px] font-black uppercase">
              <span
                className={`border border-[#080808] px-1.5 py-0.5 text-[9px] ${
                  findings.length > 0 ? "bg-[#FFE500] text-[#080808]" : "bg-white text-[#080808]"
                }`}
              >
                {findings.length > 0 ? "AUDITED" : "READY"}
              </span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2.5] transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Stage 05: Ship */}
          <Link
            href={`/projects/${id}/readiness`}
            className="group flex flex-col justify-between border-[3px] border-[#080808] bg-white p-4 shadow-[4px_4px_0px_#080808] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#080808]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="border-2 border-[#080808] bg-[#B7FF6A] px-2 py-0.5 text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_#080808]">
                  05 · SHIP
                </span>
                <CheckCircle2 className="h-4 w-4 stroke-[2.5] text-[#080808]" />
              </div>

              <div>
                <h4 className="text-sm font-black uppercase text-[#080808] group-hover:underline">
                  Ship Readiness
                </h4>
                <p className="mt-1 text-[11px] font-medium text-[#080808]/75 leading-tight">
                  Security checklist, deployment health check, and final release signoff.
                </p>
              </div>

              <div className="border border-[#080808] bg-[#F8F6EC] p-2 text-[10px] font-bold">
                <div className="flex justify-between text-[#080808]">
                  <span>Ship Score:</span>
                  <span className="font-black">{totalProgressPct}%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-[#080808]/15 flex items-center justify-between text-[11px] font-black uppercase">
              <span
                className={`border border-[#080808] px-1.5 py-0.5 text-[9px] ${
                  totalProgressPct >= 80 ? "bg-[#B7FF6A] text-[#080808]" : "bg-white text-[#080808]"
                }`}
              >
                {totalProgressPct >= 80 ? "READY" : "IN PROGRESS"}
              </span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2.5] transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </div>

      {/* 3. Open Issues & Architecture Metrics Bento Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-[3px] border-[#080808] bg-white p-4 shadow-[4px_4px_0px_#080808]">
          <div className="flex items-center justify-between text-xs font-black uppercase text-[#080808]">
            <span>Critical Issues</span>
            <ShieldAlert className="h-4 w-4 stroke-[2.5] text-[#FF4F9A]" />
          </div>
          <div className="mt-2 text-3xl font-black text-[#080808]">
            {openIssues.critical}
          </div>
          <p className="mt-1 text-[10px] font-bold uppercase text-[#080808]/60">Must fix before shipping</p>
        </div>

        <div className="border-[3px] border-[#080808] bg-white p-4 shadow-[4px_4px_0px_#080808]">
          <div className="flex items-center justify-between text-xs font-black uppercase text-[#080808]">
            <span>High Severity</span>
            <AlertTriangle className="h-4 w-4 stroke-[2.5] text-[#FFE500]" />
          </div>
          <div className="mt-2 text-3xl font-black text-[#080808]">
            {openIssues.high}
          </div>
          <p className="mt-1 text-[10px] font-bold uppercase text-[#080808]/60">High priority risks</p>
        </div>

        <div className="border-[3px] border-[#080808] bg-white p-4 shadow-[4px_4px_0px_#080808]">
          <div className="flex items-center justify-between text-xs font-black uppercase text-[#080808]">
            <span>Secondary Issues</span>
            <Layers className="h-4 w-4 stroke-[2.5]" />
          </div>
          <div className="mt-2 text-3xl font-black text-[#080808]">
            {openIssues.medium + openIssues.low}
          </div>
          <p className="mt-1 text-[10px] font-bold uppercase text-[#080808]/60">Medium & low enhancements</p>
        </div>

        <div className="border-[3px] border-[#080808] bg-white p-4 shadow-[4px_4px_0px_#080808]">
          <div className="flex items-center justify-between text-xs font-black uppercase text-[#080808]">
            <span>Decisions Logged</span>
            <BookMarked className="h-4 w-4 stroke-[2.5]" />
          </div>
          <div className="mt-2 text-3xl font-black text-[#080808]">
            {decisions.length}
          </div>
          <p className="mt-1 text-[10px] font-bold uppercase text-[#080808]/60">Accepted architectural ADRs</p>
        </div>
      </div>

      {/* 4. Recent Architecture Decisions in Bento Box */}
      <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[5px_5px_0px_#080808]">
        <div className="flex items-center justify-between border-b-2 border-[#080808] pb-4">
          <div className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 stroke-[2.5] text-[#080808]" />
            <h3 className="text-sm font-black uppercase text-[#080808]">
              Recent Product & Architecture Decisions
            </h3>
          </div>
          <Link
            href={`/projects/${id}/decisions`}
            className="border-2 border-[#080808] bg-[#F8F6EC] px-3 py-1 text-[11px] font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808] hover:bg-[#FFE500]"
          >
            View All Decisions →
          </Link>
        </div>

        {decisions.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center border-2 border-dashed border-[#080808] bg-[#F8F6EC] p-8 text-center text-xs">
            <Sparkles className="h-6 w-6 stroke-[2] text-[#080808]" />
            <p className="mt-2 font-black uppercase text-[#080808]">No decisions recorded yet</p>
            <p className="mt-1 max-w-sm text-[11px] font-medium text-[#080808]/70">
              Answer the discovery questions in Stage 01 to automatically record your architecture decisions.
            </p>
            <Link
              href={`/projects/${id}/discovery`}
              className="mt-4 border-2 border-[#080808] bg-[#FFE500] px-4 py-2 text-xs font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808] hover:bg-white"
            >
              Start Discovery Q&A →
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {decisions.map((dec) => (
              <div
                key={dec.id}
                className="flex flex-col gap-2 border-2 border-[#080808] bg-[#F8F6EC] p-3 shadow-[2px_2px_0px_#080808] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-[#080808]">
                    <span className="border border-[#080808] bg-white px-1.5 py-0.5 text-[10px]">
                      DEC-{String(dec.decision_number).padStart(3, "0")}
                    </span>
                    <span>{dec.topic}</span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-[#080808]/80">
                    {dec.decision}
                  </p>
                </div>
                <div className="border border-[#080808] bg-[#B7FF6A] px-2 py-0.5 text-[10px] font-black uppercase text-[#080808] shrink-0 self-start sm:self-center">
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
