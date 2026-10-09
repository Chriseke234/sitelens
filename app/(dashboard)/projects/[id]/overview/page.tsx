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
  FileCode2,
  TrendingUp,
  Compass,
  Terminal,
  SearchCheck,
  Rocket,
} from "lucide-react";
import { Project } from "@/types";

export const metadata = {
  title: "Project Overview | Aigenstra",
  description: "Factual workspace status, verified build milestones, and guided next actions.",
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

  // Fetch actual project artifacts in parallel — ZERO FICTION DATA
  const [
    findingsRes,
    auditSnapshotsRes,
    decisionsRes,
    discoveryRes,
    productRes,
    archRes,
    promptsRes,
    checklistRes,
  ] = await Promise.all([
    supabase.from("audit_findings").select("*").eq("project_id", id),
    supabase.from("audit_snapshots").select("id, created_at, score").eq("project_id", id).order("created_at", { ascending: false }).limit(1),
    supabase.from("agent_decisions").select("*").eq("project_id", id).order("created_at", { ascending: false }).limit(3),
    supabase.from("discovery_qna").select("*").eq("project_id", id),
    supabase.from("product_specs").select("id").eq("project_id", id).limit(1),
    supabase.from("architecture_docs").select("id, storage").eq("project_id", id).limit(1),
    supabase.from("prompts").select("*").eq("project_id", id),
    supabase.from("production_checklists").select("id, is_checked").eq("project_id", id),
  ]);

  const findings = findingsRes.data || [];
  const hasAudit = (auditSnapshotsRes.data?.length || 0) > 0;
  const decisions = decisionsRes.data || [];
  const qnaList = discoveryRes.data || [];
  const hasProduct = (productRes.data?.length || 0) > 0;
  const archDoc = archRes.data?.[0];
  const storedTasks = (archDoc?.storage as any)?.tasks || [];
  const prompts = promptsRes.data || [];
  const checklist = checklistRes.data || [];

  const answeredCount = qnaList.filter((q) => q.answer && q.answer.trim().length > 0).length;
  const hasDiscovery = answeredCount >= 2;
  const verifiedChecks = checklist.filter((c) => c.is_checked).length;
  const totalChecks = checklist.length;

  const openIssues = {
    critical: findings.filter((f) => f.severity === "critical" && f.status === "open").length,
    high: findings.filter((f) => f.severity === "high" && f.status === "open").length,
    medium: findings.filter((f) => f.severity === "medium" && f.status === "open").length,
    low: findings.filter((f) => f.severity === "low" && f.status === "open").length,
  };

  // Real Milestone Completion (Zero arbitrary score points)
  const milestoneChecks = [
    hasDiscovery,
    hasProduct,
    prompts.length > 0,
    hasAudit,
    totalChecks > 0 && verifiedChecks === totalChecks,
  ];
  const completedMilestones = milestoneChecks.filter(Boolean).length;
  const milestoneProgressPct = Math.round((completedMilestones / 5) * 100);

  // Factual Next Recommended Action
  let nextAction = {
    stepNumber: "01",
    title: "Clarify Key Decisions",
    desc: `Answer essential questions (${answeredCount}/${qnaList.length || 4} decided) to shape your software blueprint.`,
    href: `/projects/${id}/discovery`,
    cta: "Start Discovery Q&A",
  };

  if (!hasProduct && hasDiscovery) {
    nextAction = {
      stepNumber: "02",
      title: "Synthesize Software Blueprint",
      desc: "Discovery requirements are ready. Generate your product specifications, data schema, and build map.",
      href: `/projects/${id}/product`,
      cta: "Generate Blueprint",
    };
  } else if (prompts.length === 0 && hasProduct) {
    nextAction = {
      stepNumber: "03",
      title: "Compile Coding Prompts",
      desc: `Compile precision prompt instructions specifically formatted for ${project.coding_environment || "your coding agent"}.`,
      href: `/projects/${id}/prompts`,
      cta: "Open Prompt Studio",
    };
  } else if (!hasAudit && prompts.length > 0) {
    nextAction = {
      stepNumber: "04",
      title: "Run Code & Security Audit",
      desc: "Verify what your AI agent built against your original blueprint specifications and security rules.",
      href: `/projects/${id}/audit`,
      cta: "Run First Audit",
    };
  } else if (hasAudit && (openIssues.critical > 0 || openIssues.high > 0)) {
    nextAction = {
      stepNumber: "04",
      title: "Address Critical Audit Findings",
      desc: `${openIssues.critical} Critical and ${openIssues.high} High severity issues detected. Generate targeted fix prompts.`,
      href: `/projects/${id}/audit`,
      cta: "View Audit & Fixes",
    };
  } else if (totalChecks > 0 && verifiedChecks < totalChecks) {
    nextAction = {
      stepNumber: "05",
      title: "Complete Release Checklist",
      desc: `${verifiedChecks} of ${totalChecks} production checks verified. Complete remaining items before launch.`,
      href: `/projects/${id}/readiness`,
      cta: "Check Readiness",
    };
  } else if (completedMilestones === 5) {
    nextAction = {
      stepNumber: "05",
      title: "Project Verified & Ready to Ship",
      desc: "All 5 development milestones and verification checks have been completed.",
      href: `/projects/${id}/readiness`,
      cta: "View Release State",
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
              <span>Next Recommended Action · Step {nextAction.stepNumber}</span>
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

        {/* Factual Milestone Progress Bar */}
        <div className="mt-6 border-t-2 border-[#080808] pt-4">
          <div className="flex items-center justify-between text-xs font-black uppercase text-[#080808] mb-2">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 stroke-[2.5]" />
              Factual Project Progress
            </span>
            <span className="border-2 border-[#080808] bg-white px-2 py-0.5 shadow-[2px_2px_0px_#080808]">
              {completedMilestones} OF 5 MILESTONES COMPLETED ({milestoneProgressPct}%)
            </span>
          </div>
          <div className="h-4 w-full border-2 border-[#080808] bg-white p-0.5 shadow-[2px_2px_0px_#080808]">
            <div
              className="h-full bg-[#080808] transition-all duration-300"
              style={{ width: `${milestoneProgressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. The 5 Core Bento Stage Cards (Zero Fiction Data) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#080808] flex items-center gap-2">
            <span className="border-2 border-[#080808] bg-[#080808] text-white px-1.5 py-0.5 text-[10px]">
              STAGES
            </span>
            The 5 Guided Bento Stages
          </h3>
          <span className="text-[10px] text-[#080808]/60 font-bold uppercase hidden sm:inline">
            Direct access to each stage
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
                  Clarify the core problem, user personas, and scope.
                </p>
              </div>

              <div className="border border-[#080808] bg-[#F8F6EC] p-2 text-[10px] font-bold">
                <div className="flex justify-between text-[#080808]">
                  <span>Decided:</span>
                  <span className="font-black">{answeredCount} of {qnaList.length || 4}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-[#080808]/15 flex items-center justify-between text-[11px] font-black uppercase">
              <span
                className={`border border-[#080808] px-1.5 py-0.5 text-[9px] ${
                  hasDiscovery ? "bg-[#B7FF6A] text-[#080808]" : answeredCount > 0 ? "bg-[#FFE500] text-[#080808]" : "bg-white text-[#080808]"
                }`}
              >
                {hasDiscovery ? "COMPLETED" : answeredCount > 0 ? "IN PROGRESS" : "NOT STARTED"}
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
                  Software Specs
                </h4>
                <p className="mt-1 text-[11px] font-medium text-[#080808]/75 leading-tight">
                  Screens, user journeys, data model, and architecture.
                </p>
              </div>

              <div className="border border-[#080808] bg-[#F8F6EC] p-2 text-[10px] font-bold">
                <div className="flex justify-between text-[#080808]">
                  <span>Blueprint State:</span>
                  <span className="font-black">{hasProduct ? "Synthesized" : "Not Generated"}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-[#080808]/15 flex items-center justify-between text-[11px] font-black uppercase">
              <span
                className={`border border-[#080808] px-1.5 py-0.5 text-[9px] ${
                  hasProduct ? "bg-[#B7FF6A] text-[#080808]" : "bg-white text-[#080808]"
                }`}
              >
                {hasProduct ? "COMPLETED" : "NOT STARTED"}
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
                  Agent Prompts
                </h4>
                <p className="mt-1 text-[11px] font-medium text-[#080808]/75 leading-tight">
                  High-precision prompt studio tailored for {project.coding_environment || "AI"}.
                </p>
              </div>

              <div className="border border-[#080808] bg-[#F8F6EC] p-2 text-[10px] font-bold">
                <div className="flex justify-between text-[#080808]">
                  <span>Compiled Prompts:</span>
                  <span className="font-black">{prompts.length}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-[#080808]/15 flex items-center justify-between text-[11px] font-black uppercase">
              <span
                className={`border border-[#080808] px-1.5 py-0.5 text-[9px] ${
                  prompts.length > 0 ? "bg-[#B7FF6A] text-[#080808]" : storedTasks.length > 0 ? "bg-[#FFE500] text-[#080808]" : "bg-white text-[#080808]"
                }`}
              >
                {prompts.length > 0 ? "COMPILED" : storedTasks.length > 0 ? "TASKS READY" : "NOT STARTED"}
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
                  Verify built code and generate targeted fix prompts.
                </p>
              </div>

              <div className="border border-[#080808] bg-[#F8F6EC] p-2 text-[10px] font-bold">
                <div className="flex justify-between text-[#080808]">
                  <span>Audit Status:</span>
                  <span className={`font-black ${hasAudit ? (openIssues.critical + openIssues.high > 0 ? "text-[#FF4F9A]" : "text-[#080808]") : "text-[#080808]/60"}`}>
                    {hasAudit ? `${findings.length} Findings` : "Not Run Yet"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-[#080808]/15 flex items-center justify-between text-[11px] font-black uppercase">
              <span
                className={`border border-[#080808] px-1.5 py-0.5 text-[9px] ${
                  hasAudit ? (openIssues.critical + openIssues.high > 0 ? "bg-[#FF4F9A] text-white" : "bg-[#B7FF6A] text-[#080808]") : "bg-white text-[#080808]"
                }`}
              >
                {hasAudit ? (openIssues.critical + openIssues.high > 0 ? "FIXES NEEDED" : "AUDITED") : "NOT RUN"}
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
                <Rocket className="h-4 w-4 stroke-[2.5] text-[#080808]" />
              </div>

              <div>
                <h4 className="text-sm font-black uppercase text-[#080808] group-hover:underline">
                  Release Checklist
                </h4>
                <p className="mt-1 text-[11px] font-medium text-[#080808]/75 leading-tight">
                  Security, reliability, and deployment verification.
                </p>
              </div>

              <div className="border border-[#080808] bg-[#F8F6EC] p-2 text-[10px] font-bold">
                <div className="flex justify-between text-[#080808]">
                  <span>Verified Checks:</span>
                  <span className="font-black">{verifiedChecks} of {totalChecks}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-[#080808]/15 flex items-center justify-between text-[11px] font-black uppercase">
              <span
                className={`border border-[#080808] px-1.5 py-0.5 text-[9px] ${
                  totalChecks > 0 && verifiedChecks === totalChecks ? "bg-[#B7FF6A] text-[#080808]" : verifiedChecks > 0 ? "bg-[#FFE500] text-[#080808]" : "bg-white text-[#080808]"
                }`}
              >
                {totalChecks > 0 && verifiedChecks === totalChecks ? "SHIP READY" : verifiedChecks > 0 ? "IN PROGRESS" : "NOT STARTED"}
              </span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2.5] transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </div>

      {/* 3. Real Decisions & ADR Block (Zero Placeholder) */}
      <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[5px_5px_0px_#080808]">
        <div className="flex items-center justify-between border-b-2 border-[#080808] pb-4">
          <div className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 stroke-[2.5] text-[#080808]" />
            <h3 className="text-sm font-black uppercase text-[#080808]">
              Product & Architecture Decisions
            </h3>
          </div>
          {decisions.length > 0 && (
            <Link
              href={`/projects/${id}/decisions`}
              className="border-2 border-[#080808] bg-[#F8F6EC] px-3 py-1 text-[11px] font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808] hover:bg-[#FFE500]"
            >
              View Decision Log →
            </Link>
          )}
        </div>

        {decisions.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center border-2 border-dashed border-[#080808] bg-[#F8F6EC] p-8 text-center text-xs">
            <Sparkles className="h-6 w-6 stroke-[2] text-[#080808]" />
            <p className="mt-2 font-black uppercase text-[#080808]">No decisions recorded yet</p>
            <p className="mt-1 max-w-sm text-[11px] font-medium text-[#080808]/70">
              Answer the discovery questions in Stage 01 to record your architectural decisions in Supabase.
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
