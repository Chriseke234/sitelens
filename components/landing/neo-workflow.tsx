import React from "react";
import Link from "next/link";
import { ArrowRight, HelpCircle, FileSpreadsheet, Send, Terminal, ShieldAlert } from "lucide-react";

export function NeoWorkflow() {
  const steps = [
    {
      num: "01",
      title: "Tell Aigenstra what you're building.",
      description: "Paste an idea, paste a GitHub repo link, or describe a feature you want to add to your app.",
    },
    {
      num: "02",
      title: "Answer a few important questions.",
      description: "Aigenstra identifies missing architecture decisions, user auth edge cases, and technical trade-offs.",
    },
    {
      num: "03",
      title: "Aigenstra creates your build blueprint.",
      description: "Get a breakdown of database schemas, component hierarchies, security policies, and user journeys.",
    },
    {
      num: "04",
      title: "Generate implementation prompts.",
      description: "Get 16-part surgical, context-aware prompt blocks scoped down to isolated tasks with clear constraints.",
    },
    {
      num: "05",
      title: "Give those prompts to your AI coding agent.",
      description: "Feed prompts straight into Google Antigravity, Claude Code, Codex, Lovable, or Replit with zero guesswork.",
    },
    {
      num: "06",
      title: "Return to Aigenstra to audit and verify.",
      description: "Upload code or paste your live URL to audit against UX, performance, and security before you ship.",
    },
  ];

  return (
    <section id="how-it-works" className="border-b-[3px] border-[#080808] bg-[#F8F6EC] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-block border-2 border-[#080808] bg-[#FFE500] px-3 py-1 font-mono text-xs font-black uppercase text-[#080808] shadow-[3px_3px_0px_#080808]">
            THE COMPLETE JOURNEY
          </div>
          <h2 className="mt-5 font-mono text-3xl font-black uppercase tracking-tight text-[#080808] sm:text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
            FROM &ldquo;I HAVE AN IDEA&rdquo; <br />
            <span className="bg-[#B7FF6A] px-2 py-0.5 border-2 border-[#080808] inline-block mt-1">
              TO &ldquo;IT&apos;S READY TO SHIP.&rdquo;
            </span>
          </h2>
          <p className="mt-6 text-base font-medium text-[#080808]/80 sm:text-lg max-w-2xl mx-auto">
            A linear, repeatable process that removes guesswork from vibe coding.
          </p>
        </div>

        {/* 6-Step Visual Process Grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.num}
              className="relative flex flex-col justify-between border-[3px] border-[#080808] bg-white p-6 shadow-[5px_5px_0px_#080808] transition-transform hover:-translate-y-1 hover:shadow-[7px_7px_0px_#080808]"
            >
              <div>
                <div className="flex items-center justify-between border-b-2 border-[#080808] pb-3">
                  <span className="font-mono text-3xl font-black text-[#080808]">
                    {step.num}
                  </span>
                  <span className="border-2 border-[#080808] bg-[#F8F6EC] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-[#080808]">
                    PHASE {step.num}
                  </span>
                </div>

                <h3 className="mt-4 font-mono text-base font-black uppercase text-[#080808]">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs font-medium leading-relaxed text-[#080808]/80 font-sans">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-dashed border-[#080808]/20 pt-3">
                <span className="font-mono text-[10px] font-bold uppercase text-[#080808]/50">
                  Ready for step {parseInt(step.num, 10) < 6 ? `0${parseInt(step.num, 10) + 1}` : "Production"}
                </span>
                <ArrowRight className="h-4 w-4 text-[#080808]/60" />
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-14 flex justify-center">
          <Link
            href="/projects/new"
            className="inline-flex items-center justify-center gap-3 border-[3px] border-[#080808] bg-[#FFE500] px-8 py-4 font-mono text-sm font-black uppercase tracking-wider text-[#080808] shadow-[6px_6px_0px_#080808] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_#080808] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none"
          >
            <span>Start my project</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
