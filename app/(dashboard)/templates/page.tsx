import React from "react";
import Link from "next/link";
import {
  Layers,
  Sparkles,
  Rocket,
  ArrowRight,
  Database,
  Smartphone,
  Globe,
  Terminal,
  Code2,
} from "lucide-react";

export const metadata = {
  title: "Project Templates | Aigenstra",
  description: "Jumpstart your product engineering with pre-structured Aigenstra templates.",
};

export default function TemplatesPage() {
  const templates = [
    {
      id: "saas-starter",
      title: "B2B SaaS Multi-Tenant Platform",
      category: "SaaS",
      description: "Complete B2B subscription workspace with organization tenancy, RBAC permissions, Stripe webhook stubs, and user activity logging.",
      techStack: "Next.js 15, Supabase Auth & Postgres, Tailwind",
      stages: ["Discovery", "User Journey", "DB Schema", "RLS Security"],
    },
    {
      id: "marketplace",
      title: "Two-Sided Service Marketplace",
      category: "Marketplace",
      description: "Service marketplace connecting consumers with vetted providers. Features booking flows, guest checkout tokens, and direct messaging.",
      techStack: "Next.js 15, Supabase, Tailwind, Gemini AI",
      stages: ["User Personas", "Journey", "Order Verification", "API Planning"],
    },
    {
      id: "ai-copilot",
      title: "AI Automation & Workflow Copilot",
      category: "AI Product",
      description: "Generative AI workspace featuring streaming responses, prompt injection defense, structured JSON schema validation, and token quotas.",
      techStack: "Next.js, Google Gemini 2.5 Flash, Supabase",
      stages: ["Prompt Engineering", "Security Threat Model", "Streaming UX"],
    },
    {
      id: "mobile-backend",
      title: "Mobile App API & Auth Backend",
      category: "Mobile App",
      description: "High-throughput REST backend with JWT bearer token verification, device session management, rate limiting, and push notification triggers.",
      techStack: "Next.js Route Handlers, Supabase Postgres",
      stages: ["API Specification", "Token Auth", "DB Constraints"],
    },
  ];

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
          <Layers className="h-3.5 w-3.5" />
          Pre-Structured Engineering Architectures
        </div>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Product Templates
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Start from battle-tested architecture foundations and jump straight into specialized AI agent council debates and build prompts.
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  {tpl.category}
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  {tpl.techStack}
                </span>
              </div>

              <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {tpl.title}
              </h3>

              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {tpl.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {tpl.stages.map((stg, idx) => (
                  <span
                    key={idx}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    • {stg}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
              <Link
                href={`/projects/new`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-900 transition-all group-hover:bg-indigo-600 group-hover:text-white dark:bg-slate-800 dark:text-slate-100"
              >
                Use Template
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
