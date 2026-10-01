"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  FileText,
  Loader2,
  Printer,
  Share2,
  Download,
  Check,
  Copy,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Sparkles,
  Link as LinkIcon,
  Globe,
} from "lucide-react";

export default function ProjectReportPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [generatingShare, setGeneratingShare] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    fetchReport();
    fetchShareToken();
  }, [projectId]);

  const fetchReport = async () => {
    try {
      const [projRes, prodRes, journeyRes, archRes, secRes, councilRes, promptsRes, findingsRes, checkRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/product`),
        fetch(`/api/projects/${projectId}/journey`),
        fetch(`/api/projects/${projectId}/architecture`),
        fetch(`/api/projects/${projectId}/security`),
        fetch(`/api/projects/${projectId}/council`),
        fetch(`/api/projects/${projectId}/prompts`),
        fetch(`/api/projects/${projectId}/fix-queue`),
        fetch(`/api/projects/${projectId}/readiness`),
      ]);

      const [proj, prod, journey, arch, sec, council, prompts, findings, checklist] = await Promise.all([
        projRes.json(),
        prodRes.json(),
        journeyRes.json(),
        archRes.json(),
        secRes.json(),
        councilRes.json(),
        promptsRes.json(),
        findingsRes.json(),
        checkRes.json(),
      ]);

      setReportData({
        project: proj.project,
        productSpec: prod.specDoc,
        userJourney: journey.journeyDoc,
        architectureDoc: arch.architectureDoc,
        securityPlan: sec.securityPlan,
        decisions: council.decisions || [],
        prompts: prompts.prompts || [],
        findings: findings.findings || [],
        checklist: checklist.checklist || [],
      });
    } catch (err) {
      console.error("Failed to load report data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchShareToken = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/share`);
      const data = await res.json();
      if (res.ok && data.share) {
        setShareToken(data.share.share_token);
      }
    } catch (err) {
      console.error("Failed to load share token:", err);
    }
  };

  const handleCreateShareLink = async () => {
    setGeneratingShare(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create" }),
      });
      const data = await res.json();
      if (res.ok && data.share) {
        setShareToken(data.share.share_token);
      }
    } catch (err) {
      console.error("Failed to generate share link:", err);
    } finally {
      setGeneratingShare(false);
    }
  };

  const handleCopyShareLink = () => {
    if (!shareToken) return;
    const url = `${window.location.origin}/share/project/${shareToken}`;
    navigator.clipboard.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const { project, productSpec, userJourney, architectureDoc, securityPlan, decisions, prompts, findings, checklist } = reportData || {};
  const resolvedFindings = (findings || []).filter((f: any) => f.lifecycle_status === "resolved");
  const openFindings = (findings || []).filter((f: any) => f.lifecycle_status !== "resolved");

  return (
    <div className="space-y-8 print:p-0 print:space-y-4">
      {/* Action Bar (Hidden during Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:hidden">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <FileText className="h-3.5 w-3.5" />
            Aigenstra Engineering Report
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Executive Engineering & Audit Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Complete formal specification, ADR decisions, 16-part prompts, audit findings, and production checklist.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {shareToken ? (
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-all dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300"
            >
              {copiedShare ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  Copied Share Link!
                </>
              ) : (
                <>
                  <LinkIcon className="h-3.5 w-3.5" />
                  Copy Read-Only Link
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreateShareLink}
              disabled={generatingShare}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            >
              <Share2 className="h-3.5 w-3.5" />
              Generate Share Link
            </button>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-all"
          >
            <Printer className="h-3.5 w-3.5" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Main Document Body */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:border-none print:shadow-none print:p-0 space-y-10 font-sans text-slate-800 dark:text-slate-200">
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-xl text-slate-900 dark:text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs">A</span>
              Aigenstra Project Engineering Report
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Date: {new Date().toLocaleDateString()}
            </span>
          </div>

          <div className="mt-6 space-y-1">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              {project?.name || "Project Workspace"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              {project?.description || project?.raw_idea || "AI-assisted product engineering workspace."}
            </p>
            <div className="flex flex-wrap gap-2 pt-2 text-xs">
              <span className="rounded bg-indigo-50 px-2 py-0.5 font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                Type: {project?.product_type || "SaaS"}
              </span>
              <span className="rounded bg-slate-100 px-2 py-0.5 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Environment: {project?.coding_environment || "Cursor"}
              </span>
            </div>
          </div>
        </div>

        {/* 1. Executive Summary & Product Spec */}
        <section className="space-y-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-100 pb-2 dark:border-slate-800">
            1. Product Requirements & Personas
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {productSpec?.problem_statement || "Problem statement formulated during discovery stage."}
          </p>

          {productSpec?.personas && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {productSpec.personas.map((p: any, idx: number) => (
                <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-950">
                  <div className="font-bold text-slate-900 dark:text-white">{p.name} (Tech Ability: {p.technicalAbility})</div>
                  <div className="text-slate-600 dark:text-slate-400 mt-1">Goal: {p.goal}</div>
                  <div className="text-slate-600 dark:text-slate-400">Primary Task: {p.primaryTask}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 2. Architecture Decisions (ADRs) */}
        <section className="space-y-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-100 pb-2 dark:border-slate-800">
            2. Architecture Decision Records (ADRs)
          </h3>
          <div className="space-y-3">
            {(decisions || []).map((dec: any, idx: number) => (
              <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    ADR-{String(dec.decision_number).padStart(3, "0")}:
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{dec.topic}</span>
                </div>
                <p className="mt-1 text-slate-700 dark:text-slate-300"><span className="font-bold">Decision:</span> {dec.decision}</p>
                <p className="mt-1 text-slate-500"><span className="font-bold">Reason:</span> {dec.reason}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Audit & Security Findings */}
        <section className="space-y-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-100 pb-2 dark:border-slate-800">
            3. 9-Agent Audit & Security Findings
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 dark:border-emerald-950 dark:bg-slate-950">
              <div className="font-bold text-emerald-800 dark:text-emerald-300">Verified & Resolved ({resolvedFindings.length})</div>
              <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                {resolvedFindings.map((rf: any) => (
                  <li key={rf.id}>✓ [{rf.finding_code}] {rf.title}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4 dark:border-amber-950 dark:bg-slate-950">
              <div className="font-bold text-amber-800 dark:text-amber-300">Open Items ({openFindings.length})</div>
              <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                {openFindings.map((of: any) => (
                  <li key={of.id}>• [{of.finding_code}] {of.title} ({of.severity})</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 4. Production Checklist Status */}
        <section className="space-y-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-100 pb-2 dark:border-slate-800">
            4. Production Launch Checklist Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {(checklist || []).map((chk: any) => (
              <div key={chk.id} className="flex items-center gap-2 py-1">
                <span className={chk.is_checked ? "text-emerald-600 font-bold" : "text-slate-400 font-bold"}>
                  {chk.is_checked ? "✓" : "○"}
                </span>
                <span className={chk.is_checked ? "text-slate-900 dark:text-white font-medium" : "text-slate-500"}>
                  {chk.title}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
