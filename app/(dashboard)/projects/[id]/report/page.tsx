"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  FileText,
  Loader2,
  Printer,
  Share2,
  Check,
  Link as LinkIcon,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Code,
  CheckSquare,
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
      <div className="flex h-64 items-center justify-center border-[3px] border-[#080808] bg-white shadow-[6px_6px_0px_#080808]">
        <Loader2 className="h-8 w-8 animate-spin text-[#080808]" />
      </div>
    );
  }

  const { project, productSpec, userJourney, architectureDoc, securityPlan, decisions, prompts, findings, checklist } = reportData || {};
  const resolvedFindings = (findings || []).filter((f: any) => f.lifecycle_status === "resolved");
  const openFindings = (findings || []).filter((f: any) => f.lifecycle_status !== "resolved");

  return (
    <div className="space-y-6 print:p-0 print:space-y-4">
      {/* Action Bar (Hidden during Print) */}
      <div className="border-[3px] border-[#080808] bg-white p-6 shadow-[5px_5px_0px_#080808] print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-block border-2 border-[#080808] bg-[#FFE500] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-[#080808] shadow-[1.5px_1.5px_0px_#080808]">
              EXECUTIVE SPEC & AUDIT REPORT
            </div>
            <h1 className="font-sans text-2xl font-black uppercase tracking-tight text-[#080808] sm:text-3xl">
              Project Engineering & Audit Report
            </h1>
            <p className="font-sans text-xs sm:text-sm font-medium text-[#080808]/80 max-w-2xl">
              Complete formal specification, architecture decisions, verified code audit findings, and launch readiness checklist.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {shareToken ? (
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="inline-flex items-center gap-1.5 border-2 border-[#080808] bg-[#B7FF6A] px-4 py-2 font-mono text-xs font-black uppercase text-[#080808] shadow-[2.5px_2.5px_0px_#080808] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                {copiedShare ? (
                  <>
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>Copied Share Link!</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>Copy Read-Only Link</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreateShareLink}
                disabled={generatingShare}
                className="inline-flex items-center gap-1.5 border-2 border-[#080808] bg-white px-4 py-2 font-mono text-xs font-black uppercase text-[#080808] shadow-[2.5px_2.5px_0px_#080808] hover:bg-[#F8F6EC] transition-all"
              >
                <Share2 className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Generate Share Link</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 border-2 border-[#080808] bg-[#FFE500] px-4 py-2 font-mono text-xs font-black uppercase text-[#080808] shadow-[2.5px_2.5px_0px_#080808] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <Printer className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Document Body */}
      <div className="border-[3px] border-[#080808] bg-white p-6 sm:p-10 shadow-[6px_6px_0px_#080808] print:border-none print:shadow-none print:p-0 space-y-8 font-sans text-[#080808]">
        {/* Document Header */}
        <div className="border-b-2 border-[#080808] pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-lg text-[#080808] uppercase tracking-tight">
              <span className="flex h-7 w-7 items-center justify-center border-2 border-[#080808] bg-[#FFE500] text-[#080808] text-xs font-mono font-black shadow-[1.5px_1.5px_0px_#080808]">
                A
              </span>
              Aigenstra Project Engineering & Audit Report
            </div>
            <span className="font-mono text-xs font-bold text-[#080808]/60">
              Date: {new Date().toLocaleDateString()}
            </span>
          </div>

          <div className="mt-5 space-y-2">
            <h2 className="font-sans text-3xl font-black uppercase tracking-tight text-[#080808]">
              {project?.name || "Project Workspace"}
            </h2>
            <p className="font-sans text-sm font-medium text-[#080808]/85 max-w-3xl leading-relaxed">
              {project?.description || project?.raw_idea || "AI-assisted product engineering workspace."}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="border border-[#080808] bg-[#F8F6EC] px-2.5 py-0.5 font-mono text-xs font-bold text-[#080808] shadow-[1px_1px_0px_#080808]">
                Type: {project?.product_type || "SaaS"}
              </span>
              <span className="border border-[#080808] bg-[#F8F6EC] px-2.5 py-0.5 font-mono text-xs font-bold text-[#080808] shadow-[1px_1px_0px_#080808]">
                Environment: {project?.coding_environment || "Cursor"}
              </span>
            </div>
          </div>
        </div>

        {/* 1. Executive Summary & Product Spec */}
        <section className="space-y-4">
          <div className="border-b-2 border-[#080808] pb-2">
            <h3 className="font-sans text-lg font-black uppercase tracking-tight text-[#080808]">
              1. What This Product Solves & Core Personas
            </h3>
          </div>
          <div className="border-2 border-[#080808] bg-[#F8F6EC] p-4 shadow-[2px_2px_0px_#080808]">
            <span className="font-mono text-[10px] font-black uppercase text-[#080808] block mb-1">
              Core Problem Solved:
            </span>
            <p className="font-sans text-xs sm:text-sm font-medium text-[#080808] leading-relaxed">
              {productSpec?.problem_statement || "Formulated during project discovery stage."}
            </p>
          </div>

          {productSpec?.personas && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {productSpec.personas.map((p: any, idx: number) => (
                <div key={idx} className="border-2 border-[#080808] bg-white p-4 shadow-[3px_3px_0px_#080808] space-y-1.5 text-xs">
                  <div className="font-sans font-black text-sm text-[#080808] flex items-center justify-between border-b border-[#080808]/20 pb-1">
                    <span>{p.name}</span>
                    <span className="font-mono text-[10px] font-bold text-[#080808]/70">Tech Level: {p.technicalAbility}</span>
                  </div>
                  <div className="text-[#080808]/90 font-medium pt-1"><span className="font-bold">Goal:</span> {p.goal}</div>
                  <div className="text-[#080808]/80 font-medium"><span className="font-bold">Primary Action:</span> {p.primaryTask}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 2. Architecture Decisions (ADRs) */}
        <section className="space-y-4">
          <div className="border-b-2 border-[#080808] pb-2">
            <h3 className="font-sans text-lg font-black uppercase tracking-tight text-[#080808]">
              2. Key Architecture Decisions (ADRs)
            </h3>
          </div>
          <div className="space-y-3">
            {(decisions || []).map((dec: any, idx: number) => (
              <div key={idx} className="border-2 border-[#080808] bg-white p-4 shadow-[3px_3px_0px_#080808] text-xs space-y-1">
                <div className="flex items-center gap-2 border-b border-[#080808]/20 pb-1.5 mb-1.5">
                  <span className="font-mono text-xs font-black uppercase px-1.5 py-0.5 border border-[#080808] bg-[#FFE500]">
                    ADR-{String(dec.decision_number).padStart(3, "0")}
                  </span>
                  <span className="font-sans font-black text-sm text-[#080808]">{dec.topic}</span>
                </div>
                <p className="text-[#080808] font-bold"><span className="font-mono text-[10px] uppercase text-[#080808]/70 mr-1">Decision:</span> {dec.decision}</p>
                <p className="text-[#080808]/80 font-medium"><span className="font-mono text-[10px] uppercase text-[#080808]/70 mr-1">Rationale:</span> {dec.reason}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Audit & Security Findings */}
        <section className="space-y-4">
          <div className="border-b-2 border-[#080808] pb-2">
            <h3 className="font-sans text-lg font-black uppercase tracking-tight text-[#080808]">
              3. Codebase Audit & Security Status
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="border-2 border-[#080808] bg-[#B7FF6A]/20 p-4 shadow-[3px_3px_0px_#080808]">
              <div className="font-mono text-xs font-black uppercase text-[#080808] flex items-center gap-1.5 border-b-2 border-[#080808] pb-2 mb-2">
                <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                <span>Verified & Resolved Items ({resolvedFindings.length})</span>
              </div>
              <ul className="space-y-2 font-medium text-[#080808]">
                {resolvedFindings.map((rf: any) => (
                  <li key={rf.id} className="flex items-start gap-1.5">
                    <Check className="h-3.5 w-3.5 stroke-[2.5] shrink-0 mt-0.5" />
                    <span>[{rf.finding_code}] {rf.title}</span>
                  </li>
                ))}
                {resolvedFindings.length === 0 && (
                  <li className="font-mono text-[#080808]/60">No resolved findings recorded yet.</li>
                )}
              </ul>
            </div>

            <div className="border-2 border-[#080808] bg-[#FF4F9A]/15 p-4 shadow-[3px_3px_0px_#080808]">
              <div className="font-mono text-xs font-black uppercase text-[#080808] flex items-center gap-1.5 border-b-2 border-[#080808] pb-2 mb-2">
                <AlertTriangle className="h-4 w-4 stroke-[2.5]" />
                <span>Open Priority Items ({openFindings.length})</span>
              </div>
              <ul className="space-y-2 font-medium text-[#080808]">
                {openFindings.map((of: any) => (
                  <li key={of.id} className="flex items-start gap-1.5">
                    <span className="font-mono font-bold shrink-0">•</span>
                    <span>[{of.finding_code}] {of.title} ({of.severity})</span>
                  </li>
                ))}
                {openFindings.length === 0 && (
                  <li className="font-mono text-[#080808]/60">Zero open blockers remaining.</li>
                )}
              </ul>
            </div>
          </div>
        </section>

        {/* 4. Production Checklist Status */}
        <section className="space-y-4">
          <div className="border-b-2 border-[#080808] pb-2">
            <h3 className="font-sans text-lg font-black uppercase tracking-tight text-[#080808]">
              4. Production Launch Readiness
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {(checklist || []).map((chk: any) => (
              <div
                key={chk.id}
                className="border-2 border-[#080808] bg-white p-3 shadow-[2px_2px_0px_#080808] flex items-center gap-2.5"
              >
                <div
                  className={`h-4 w-4 flex items-center justify-center border-2 border-[#080808] text-[10px] font-mono font-black ${
                    chk.is_checked ? "bg-[#B7FF6A] text-[#080808]" : "bg-white text-transparent"
                  }`}
                >
                  {chk.is_checked ? "✓" : ""}
                </div>
                <span className={`font-sans font-medium ${chk.is_checked ? "text-[#080808] font-bold" : "text-[#080808]/70"}`}>
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
