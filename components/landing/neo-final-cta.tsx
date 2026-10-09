import React from "react";
import Link from "next/link";
import { ArrowRight, Check, Sparkles, Terminal } from "lucide-react";

export function NeoFinalCTA() {
  const steps = [
    { title: "THINK", color: "bg-white text-[#080808]" },
    { title: "PLAN", color: "bg-[#FF4F9A] text-white" },
    { title: "PROMPT", color: "bg-[#080808] text-[#FFE500]" },
    { title: "BUILD", color: "bg-white text-[#080808]" },
    { title: "AUDIT", color: "bg-[#5C7CFF] text-white" },
    { title: "FIX", color: "bg-white text-[#080808]" },
    { title: "VERIFY", color: "bg-[#B7FF6A] text-[#080808]" },
    { title: "SHIP", color: "bg-[#FFE500] text-[#080808]" },
  ];

  return (
    <section className="border-b-[3px] border-[#080808] bg-[#F8F6EC] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section 10: Close The Loop Workflow */}
        <div className="mb-20 text-center">
          <div className="inline-block border-2 border-[#080808] bg-[#FFE500] px-3 py-1 font-mono text-xs font-black uppercase text-[#080808] shadow-[3px_3px_0px_#080808]">
            THE COMPLETE CIRCLE
          </div>
          <h2 className="mt-5 font-mono text-3xl font-black uppercase tracking-tight text-[#080808] sm:text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
            DON&apos;T JUST BUILD. <br />
            <span className="bg-[#B7FF6A] px-2 py-0.5 border-2 border-[#080808] inline-block mt-1">
              KNOW WHEN YOU&apos;RE READY TO SHIP.
            </span>
          </h2>
          <p className="mt-6 text-base font-medium text-[#080808]/80 sm:text-lg max-w-2xl mx-auto">
            From your very first idea prompt all the way to final verification checks,
            close the loop with confidence.
          </p>

          {/* Linear Sequential Badge Sequence */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {steps.map((st, i) => (
              <React.Fragment key={st.title}>
                <div
                  className={`border-[2.5px] border-[#080808] ${st.color} px-4 py-2 font-mono text-xs sm:text-sm font-black uppercase tracking-wider shadow-[3px_3px_0px_#080808] transition-transform hover:-translate-y-0.5`}
                >
                  {st.title}
                </div>
                {i < steps.length - 1 && (
                  <span className="font-mono text-base font-black text-[#080808]" aria-hidden="true">
                    →
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* FINAL CTA: Large Yellow Neo-Brutalist Panel */}
        <div className="border-[4px] border-[#080808] bg-[#FFE500] p-8 sm:p-12 md:p-16 shadow-[10px_10px_0px_#080808]">
          <div className="mx-auto max-w-4xl text-center">
            
            <div className="inline-block border-2 border-[#080808] bg-[#080808] px-3.5 py-1 font-mono text-xs font-black uppercase tracking-widest text-[#FFE500]">
              GET STARTED TODAY
            </div>

            <h3 className="mt-6 font-mono text-4xl font-black uppercase tracking-tight text-[#080808] sm:text-5xl md:text-6xl lg:text-7xl leading-[0.98]">
              YOU BRING THE IDEA. <br />
              AIGENSTRA HELPS YOU <br />
              BUILD IT RIGHT.
            </h3>

            <p className="mt-6 text-base sm:text-xl font-bold font-mono text-[#080808]">
              Stop guessing what to tell your AI coding agent. Start with a plan.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/projects/new"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 border-[3px] border-[#080808] bg-[#080808] px-8 py-4 font-mono text-sm font-black uppercase tracking-wider text-white shadow-[6px_6px_0px_#F8F6EC] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_#F8F6EC] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none"
              >
                <span>Start building →</span>
                <ArrowRight className="h-5 w-5 text-[#FFE500]" />
              </Link>

              <Link
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-[3px] border-[#080808] bg-white px-8 py-4 font-mono text-sm font-black uppercase tracking-wider text-[#080808] shadow-[5px_5px_0px_#080808] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#080808] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
              >
                <span>Explore the workflow</span>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 font-mono text-xs font-bold text-[#080808]">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 stroke-[3]" /> Free project workspace
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 stroke-[3]" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 stroke-[3]" /> Instant surgical prompts
              </span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
