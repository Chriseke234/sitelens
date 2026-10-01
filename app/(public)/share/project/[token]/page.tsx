"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Loader2,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function PublicProjectSharePage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShareData();
  }, [token]);

  const fetchShareData = async () => {
    try {
      const res = await fetch(`/api/share/${token}`);
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        setError(json.error || "Invalid or expired share link.");
      }
    } catch (err) {
      console.error("Failed to load public share data:", err);
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center dark:bg-slate-950">
        <Lock className="h-12 w-12 text-slate-400" />
        <h1 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">
          Link Expired or Inaccessible
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm">
          {error || "This read-only project report is no longer active."}
        </p>
        <Link
          href="/"
          className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-all"
        >
          Return to Aigenstra Home
        </Link>
      </div>
    );
  }

  const { project, productSpec, decisions, findings, checklist } = data;
  const resolvedFindings = (findings || []).filter((f: any) => f.lifecycle_status === "resolved");
  const openFindings = (findings || []).filter((f: any) => f.lifecycle_status !== "resolved");

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 dark:bg-slate-950 print:p-0 print:bg-white">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Top Navbar */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 font-black text-white text-xs">
              A
            </span>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              Aigenstra Verified Report
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Read-Only Client View
            </span>
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

        {/* Report Document Sheet */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:border-none print:shadow-none print:p-0 space-y-10">
          {/* Header */}
          <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
              {project?.name}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              {project?.description || project?.raw_idea}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                Product Type: {project?.product_type || "SaaS"}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Verified on {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* 1. Requirements & Personas */}
          <section className="space-y-4">
            <h2 className="text-base font-black text-slate-900 dark:text-white border-b border-slate-100 pb-2 dark:border-slate-800">
              1. Product Requirements & Personas
            </h2>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {productSpec?.problem_statement || "Structured scope formulated in Aigenstra Product Studio."}
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

          {/* 2. Architecture Decisions */}
          <section className="space-y-4">
            <h2 className="text-base font-black text-slate-900 dark:text-white border-b border-slate-100 pb-2 dark:border-slate-800">
              2. Architecture Decision Records (ADRs)
            </h2>
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

          {/* 3. Findings & Security */}
          <section className="space-y-4">
            <h2 className="text-base font-black text-slate-900 dark:text-white border-b border-slate-100 pb-2 dark:border-slate-800">
              3. Audit & Security Verification
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 dark:border-emerald-950 dark:bg-slate-950">
                <div className="font-bold text-emerald-800 dark:text-emerald-300">Verified Fixes ({resolvedFindings.length})</div>
                <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                  {resolvedFindings.map((rf: any) => (
                    <li key={rf.id}>✓ [{rf.finding_code}] {rf.title}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="font-bold text-slate-800 dark:text-slate-300">Remaining Action Items ({openFindings.length})</div>
                <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                  {openFindings.map((of: any) => (
                    <li key={of.id}>• [{of.finding_code}] {of.title} ({of.severity})</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Footer Callout */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 text-center text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 print:hidden">
            <p className="font-bold text-slate-900 dark:text-white">
              Generated by Aigenstra — AI Product Engineering & Audit Platform
            </p>
            <p className="mt-1">
              Reduce blind spots before you ship. Build with an AI product team of specialized agents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
