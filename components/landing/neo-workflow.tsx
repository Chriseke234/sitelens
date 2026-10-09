"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Compass, FileCode2, Terminal, SearchCheck, Rocket } from "lucide-react";
import { PromptPilotCharacter } from "@/components/landing/characters";

export function NeoWorkflow() {
  const steps = [
    {
      num: "01",
      icon: Compass,
      tag: "UNDERSTAND",
      title: "Tell Aigenstra what you're building",
      desc: "Paste your raw idea, existing repo, or new feature request.",
      color: "bg-[#FFE500]",
    },
    {
      num: "02",
      icon: FileCode2,
      tag: "BLUEPRINT",
      title: "Synthesize software blueprint",
      desc: "Get schemas, component trees, auth rules, and user journeys.",
      color: "bg-[#B7FF6A]",
    },
    {
      num: "03",
      icon: Terminal,
      tag: "PROMPT",
      title: "Generate precision agent prompts",
      desc: "Context-optimized 12-section instructions with strict boundaries.",
      color: "bg-[#FFE500]",
    },
    {
      num: "04",
      icon: SearchCheck,
      tag: "AUDIT",
      title: "Verify what your AI agent built",
      desc: "Detect regressions, missing security policies, and broken flows.",
      color: "bg-[#FF4F9A]",
      textColor: "text-white",
    },
    {
      num: "05",
      icon: Rocket,
      tag: "SHIP",
      title: "Deploy with complete confidence",
      desc: "Sign off on launch checklist and verified production readiness.",
      color: "bg-[#B7FF6A]",
    },
  ];

  return (
    <section id="how-it-works" className="border-b-[3px] border-[#080808] bg-[#F8F6EC] py-16 md:py-20 font-mono">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with PromptPilot Mascot */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-10 border-b-[3px] border-[#080808]">
          <div className="space-y-3 max-w-2xl text-center md:text-left">
            <div className="inline-block border-2 border-[#080808] bg-[#FFE500] px-3 py-0.5 text-xs font-black uppercase text-[#080808] shadow-[2px_2px_0px_#080808]">
              HOW IT WORKS
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-[#080808] sm:text-4xl md:text-5xl leading-[1.05]">
              FROM IDEA TO <br />
              <span className="bg-[#B7FF6A] px-2 py-0.5 border-2 border-[#080808] inline-block mt-1">
                VERIFIED SHIP.
              </span>
            </h2>
            <p className="text-xs sm:text-sm font-bold text-[#080808]/75">
              The 5-stage thinking layer that stops bad AI prompts before they happen.
            </p>
          </div>

          {/* Interactive Mascot with Hover Motion */}
          <div className="shrink-0 p-3 border-2 border-[#080808] bg-white shadow-[4px_4px_0px_#080808] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#080808]">
            <PromptPilotCharacter className="w-28 h-28" />
            <span className="text-[10px] font-black uppercase text-center block mt-1 text-[#080808]">
              STAGE NAVIGATOR
            </span>
          </div>
        </div>

        {/* 5-Step Bento Process Grid (Punchy, Zero Bloat) */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="group flex flex-col justify-between border-[3px] border-[#080808] bg-white p-5 shadow-[4px_4px_0px_#080808] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#080808]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b-2 border-[#080808] pb-2">
                    <span className="text-2xl font-black text-[#080808]">
                      {step.num}
                    </span>
                    <span className={`border border-[#080808] ${step.color} ${step.textColor || "text-[#080808]"} px-2 py-0.5 text-[9px] font-black uppercase shadow-[1.5px_1.5px_0px_#080808]`}>
                      {step.tag}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 stroke-[2.5] text-[#080808] shrink-0" />
                    <h3 className="text-xs font-black uppercase text-[#080808] leading-snug">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-[11px] font-medium leading-relaxed text-[#080808]/75">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-[#080808]/15 flex items-center justify-between text-[10px] font-black text-[#080808]/60 uppercase">
                  <span>Step {step.num}</span>
                  <ArrowRight className="h-3 w-3 stroke-[2.5] transition-transform group-hover:translate-x-1 text-[#080808]" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/projects/new"
            className="inline-flex items-center justify-center gap-2 border-[3px] border-[#080808] bg-[#FFE500] px-8 py-3.5 text-xs font-black uppercase tracking-wider text-[#080808] shadow-[5px_5px_0px_#080808] transition-all hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_#080808] active:translate-y-0.5"
          >
            <span>Start Building with Aigenstra →</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
