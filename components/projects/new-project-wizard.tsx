"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Rocket,
  SearchCheck,
  Code2,
  Terminal,
  Target,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import { ProductType, CodingEnvironment, ProjectMode } from "@/types";

interface NewProjectWizardProps {
  onSuccess?: (projectId: string) => void;
}

export function NewProjectWizard({ onSuccess }: NewProjectWizardProps) {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    product_type: "SaaS" as ProductType,
    target_audience: "",
    problem_statement: "",
    raw_idea: "",
    stage: "idea",
    coding_environment: "Cursor" as CodingEnvironment,
    tech_stack: "Next.js 15, Supabase, Tailwind CSS",
    goal: "",
    mode: "build" as ProjectMode,
    repo_url: "",
  });

  const productTypes: ProductType[] = [
    "SaaS",
    "Marketplace",
    "Web App",
    "Mobile App",
    "Internal Tool",
    "E-commerce",
    "AI Product",
    "API",
    "Landing Page",
    "Other",
  ];

  const environments: Array<{ value: CodingEnvironment; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { value: "Cursor", label: "Cursor", icon: Terminal },
    { value: "Antigravity", label: "Google Antigravity", icon: Sparkles },
    { value: "Claude Code", label: "Claude Code", icon: Code2 },
    { value: "Replit", label: "Replit", icon: Wrench },
    { value: "Lovable", label: "Lovable", icon: Rocket },
    { value: "v0", label: "v0 by Vercel", icon: Target },
    { value: "Other", label: "Other Environment", icon: Code2 },
  ];

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Please provide a name for your project workspace.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.raw_idea.trim()) {
      setError("Please describe what you want to build.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          goal: formData.goal || `Build and ship verified ${formData.product_type} product.`,
          description: formData.description || formData.raw_idea.slice(0, 160),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create project workspace.");
      }

      if (onSuccess) {
        onSuccess(data.project.id);
      } else {
        router.push(`/projects/${data.project.id}/overview`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl border-[3px] border-[#080808] bg-white p-6 shadow-[8px_8px_0px_#080808] md:p-8">
      {/* Header & Step Indicator */}
      <div className="border-b-[3px] border-[#080808] pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="inline-flex items-center gap-2 border-2 border-[#080808] bg-[#FFE500] px-3 py-1 font-mono text-[10px] font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808]">
            <Sparkles className="h-3.5 w-3.5 stroke-[2.5]" />
            AIGENSTRA WORKSPACE WIZARD
          </div>

          <div className="flex items-center gap-2 font-mono text-xs font-black uppercase text-[#080808]">
            <span
              className={`flex h-6 w-6 items-center justify-center border-2 border-[#080808] ${
                step === 1 ? "bg-[#FFE500] shadow-[1.5px_1.5px_0px_#080808]" : "bg-[#B7FF6A]"
              }`}
            >
              1
            </span>
            <span>Basics</span>
            <span>──</span>
            <span
              className={`flex h-6 w-6 items-center justify-center border-2 border-[#080808] ${
                step === 2 ? "bg-[#FFE500] shadow-[1.5px_1.5px_0px_#080808]" : "bg-white"
              }`}
            >
              2
            </span>
            <span>Idea</span>
          </div>
        </div>

        <h1 className="mt-4 font-mono text-2xl font-black uppercase tracking-tight text-[#080808] md:text-3xl">
          {step === 1 ? "Step 1 — Project Basics" : "Step 2 — What are you building?"}
        </h1>
        <p className="mt-1 font-mono text-xs font-bold text-[#080808]/70">
          {step === 1
            ? "Define your project parameters, product type, target audience, and environment."
            : "Describe your idea in your own words. Rough or unstructured thoughts are completely welcome."}
        </p>
      </div>

      {error && (
        <div className="mt-6 flex items-center gap-3 border-2 border-[#080808] bg-red-100 p-4 font-mono text-xs font-bold text-red-950 shadow-[3px_3px_0px_#080808]">
          <ShieldAlert className="h-5 w-5 shrink-0 text-red-600 stroke-[2.5]" />
          <p>{error}</p>
        </div>
      )}

      {/* STEP 1: PROJECT BASICS */}
      {step === 1 && (
        <form onSubmit={handleNext} className="mt-6 space-y-6">
          {/* Mode Selector */}
          <div>
            <label className="block font-mono text-xs font-black uppercase tracking-wider text-[#080808]">
              Workspace Mode
            </label>
            <div className="mt-2.5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, mode: "build" })}
                className={`flex items-start gap-3.5 border-2 p-4 text-left transition-all ${
                  formData.mode === "build"
                    ? "border-[#080808] bg-[#FFE500] shadow-[4px_4px_0px_#080808] translate-y-[-1px]"
                    : "border-[#080808] bg-white hover:bg-[#F8F6EC]"
                }`}
              >
                <div className="border-2 border-[#080808] bg-white p-2 text-[#080808] shrink-0">
                  <Rocket className="h-4 w-4 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-mono text-sm font-black uppercase text-[#080808]">
                    MODE A — PROMPT BUILDER
                    {formData.mode === "build" && (
                      <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                    )}
                  </div>
                  <p className="mt-1 font-mono text-xs font-bold text-[#080808]/80 leading-snug">
                    Idea → Discovery → Blueprint → Build Map → Context → Coding Prompts.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, mode: "audit" })}
                className={`flex items-start gap-3.5 border-2 p-4 text-left transition-all ${
                  formData.mode === "audit"
                    ? "border-[#080808] bg-[#B7FF6A] shadow-[4px_4px_0px_#080808] translate-y-[-1px]"
                    : "border-[#080808] bg-white hover:bg-[#F8F6EC]"
                }`}
              >
                <div className="border-2 border-[#080808] bg-white p-2 text-[#080808] shrink-0">
                  <SearchCheck className="h-4 w-4 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-mono text-sm font-black uppercase text-[#080808]">
                    MODE B — PROJECT AUDIT
                    {formData.mode === "audit" && (
                      <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                    )}
                  </div>
                  <p className="mt-1 font-mono text-xs font-bold text-[#080808]/80 leading-snug">
                    Existing Repo / URL → Multi-Agent Audit → Fix Queue → Verification.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Project Name */}
          <div>
            <label htmlFor="name" className="block font-mono text-xs font-black uppercase text-[#080808]">
              Project Name <span className="text-red-600">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              placeholder="e.g. TaskFlow SaaS, Sitelens, StripeBilling Engine"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-2 w-full border-2 border-[#080808] bg-[#F8F6EC] p-3 font-mono text-xs font-bold text-[#080808] shadow-[2px_2px_0px_#080808] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
            />
          </div>

          {/* Product Type Buttons */}
          <div>
            <label className="block font-mono text-xs font-black uppercase text-[#080808]">
              Product Type
            </label>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {productTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, product_type: type })}
                  className={`border-2 px-3 py-1.5 font-mono text-xs font-black uppercase transition-all ${
                    formData.product_type === type
                      ? "border-[#080808] bg-[#FFE500] text-[#080808] shadow-[2px_2px_0px_#080808] -translate-y-0.5"
                      : "border-[#080808] bg-white text-[#080808]/80 hover:bg-[#F8F6EC]"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Environment Selector */}
          <div>
            <label className="block font-mono text-xs font-black uppercase text-[#080808]">
              Primary AI Coding Environment
            </label>
            <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {environments.map((env) => {
                const IconComp = env.icon;
                const isSelected = formData.coding_environment === env.value;
                return (
                  <button
                    key={env.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, coding_environment: env.value })}
                    className={`flex items-center gap-2 border-2 p-2.5 font-mono text-left transition-all ${
                      isSelected
                        ? "border-[#080808] bg-[#FFE500] shadow-[2px_2px_0px_#080808] -translate-y-0.5"
                        : "border-[#080808] bg-white hover:bg-[#F8F6EC]"
                    }`}
                  >
                    <IconComp className="h-4 w-4 shrink-0 stroke-[2.5]" />
                    <span className="text-[11px] font-black uppercase text-[#080808]">
                      {env.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 1 Actions */}
          <div className="flex justify-end pt-4 border-t-2 border-[#080808]">
            <button
              type="submit"
              className="inline-flex items-center gap-2 border-2 border-[#080808] bg-[#FFE500] px-6 py-3 font-mono text-xs font-black uppercase tracking-wider text-[#080808] shadow-[4px_4px_0px_#080808] transition-all hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1"
            >
              <span>Continue to Product Idea</span>
              <ArrowRight className="h-4 w-4 stroke-[3]" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: RAW PRODUCT IDEA */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label htmlFor="raw_idea" className="block font-mono text-xs font-black uppercase text-[#080808]">
              Describe What You Want to Build <span className="text-red-600">*</span>
            </label>
            <p className="mt-1 font-mono text-xs font-bold text-[#080808]/70">
              Write as much or as little as you want. Rough notes, bullet points, or unstructured text are completely welcome.
            </p>
            <textarea
              id="raw_idea"
              required
              rows={9}
              placeholder="e.g. I want to build a platform where customers can request laundry pickups from local vendors, track status in real-time, and make payments securely..."
              value={formData.raw_idea}
              onChange={(e) => setFormData({ ...formData, raw_idea: e.target.value })}
              className="mt-3 w-full border-2 border-[#080808] bg-[#F8F6EC] p-4 font-mono text-xs font-bold leading-relaxed text-[#080808] shadow-[3px_3px_0px_#080808] placeholder:text-[#080808]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
            />
          </div>

          <div className="border-2 border-[#080808] bg-[#FFE500]/20 p-4 font-mono text-xs font-bold text-[#080808] shadow-[2px_2px_0px_#080808]">
            <span className="font-black uppercase">Aigenstra Guide:</span> We store your raw idea first. Aigenstra will guide you through prioritized discovery questions, formulate a complete Software Blueprint, and build precision prompts for your coding AI.
          </div>

          {/* Step 2 Actions */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-[#080808]">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 border-2 border-[#080808] bg-white px-4 py-2 font-mono text-xs font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808] hover:bg-[#F8F6EC]"
            >
              <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
              <span>Back to Basics</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 border-2 border-[#080808] bg-[#FFE500] px-6 py-3 font-mono text-xs font-black uppercase tracking-wider text-[#080808] shadow-[4px_4px_0px_#080808] transition-all hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin stroke-[2.5]" />
                  <span>Creating Workspace...</span>
                </>
              ) : (
                <>
                  <span>Create Project Workspace</span>
                  <ArrowRight className="h-4 w-4 stroke-[3]" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
