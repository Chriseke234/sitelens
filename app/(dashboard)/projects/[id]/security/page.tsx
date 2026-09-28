"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ShieldAlert,
  Sparkles,
  Loader2,
  CheckCircle2,
  Lock,
  Key,
  Database,
  FileCheck,
  AlertTriangle,
  Code2,
} from "lucide-react";
import { SecurityPlan } from "@/types";

export default function SecurityPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [secPlan, setSecPlan] = useState<SecurityPlan | null>(null);

  useEffect(() => {
    fetchSecurity();
  }, [projectId]);

  const fetchSecurity = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/security`);
      const data = await res.json();
      if (res.ok && data.secPlan) {
        setSecPlan(data.secPlan);
      }
    } catch (err) {
      console.error("Failed to load security plan:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSecurity = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/security`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.secPlan) {
        setSecPlan(data.secPlan);
      }
    } catch (err) {
      console.error("Generate security plan error:", err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const renderSecurityGroup = (
    title: string,
    icon: any,
    items: Array<{ requirement: string; why: string; where: string; verify: string }>
  ) => {
    const IconComp = icon;
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
          <IconComp className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
        </div>

        <div className="mt-4 space-y-4">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  WHAT: {item.requirement}
                </span>
                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-extrabold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  Pre-Code Requirement
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                <div>
                  <span className="font-semibold text-slate-500">WHY:</span>{" "}
                  <span className="text-slate-700 dark:text-slate-300">{item.why}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">WHERE:</span>{" "}
                  <span className="font-mono text-blue-600 dark:text-blue-400">{item.where}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">HOW TO VERIFY:</span>{" "}
                  <span className="text-emerald-700 font-medium dark:text-emerald-300">{item.verify}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <ShieldAlert className="h-3.5 w-3.5" />
              Pre-Code Security Threat Modeling
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              Security Architecture & Controls
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Pre-implementation threat modeling detailing WHAT, WHY, WHERE, and HOW TO VERIFY security requirements.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateSecurity}
            disabled={generating}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-rose-700 active:scale-95 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Modeling Threats...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {secPlan ? "Re-Model Security Controls" : "Generate Security Plan"}
              </>
            )}
          </button>
        </div>
      </div>

      {!secPlan ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <ShieldAlert className="h-10 w-10 text-rose-600 dark:text-rose-400" />
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            Security Plan Not Generated Yet
          </h2>
          <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Click the button above to run your AI Security Engineer and formulate authz, RLS, input validation, and verification procedures before writing code.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {renderSecurityGroup("Authentication & Session Protection", Lock, secPlan.authentication_rules)}
          {renderSecurityGroup("Server-Side Authorization & IDOR Defense", Key, secPlan.authorization_rules)}
          {renderSecurityGroup("Database Security & Row Level Security (RLS)", Database, secPlan.database_security)}
          {renderSecurityGroup("API Security & Zod Payload Validation", Code2, secPlan.api_security)}
          {renderSecurityGroup("Untrusted Content & Prompt Injection Defense", ShieldAlert, secPlan.input_validation)}
          {renderSecurityGroup("Secret & Environment Management", FileCheck, secPlan.secret_management)}

          {/* Threat Modeling Card */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm dark:border-amber-950/50 dark:bg-slate-900">
            <div className="flex items-center gap-2 border-b border-amber-100 pb-3 dark:border-amber-950">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
                Threat Modeling & Vulnerability Mitigation Matrix
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              {secPlan.threat_model.map((tm, idx) => (
                <div key={idx} className="rounded-xl border border-amber-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Threat: {tm.threat}
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Impact: {tm.impact}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    Mitigation: {tm.mitigation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
