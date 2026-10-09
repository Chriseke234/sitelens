import React from "react";
import Link from "next/link";
import { ArrowRight, Check, Sparkles, Terminal } from "lucide-react";
import { RocketShipperCharacter } from "@/components/landing/characters";

export function NeoFinalCTA() {
  const steps = [
    { title: "THINK", color: "bg-white text-[#080808]" },
    { title: "PLAN", color: "bg-[#FF4F9A] text-white" },
    { title: "PROMPT", color: "bg-[#080808] text-[#FFE500]" },
    { title: "BUILD", color: "bg-white text-[#080808]" },
    { title: "AUDIT", color: "bg-[#B7FF6A] text-[#080808]" },
    { title: "SHIP", color: "bg-[#FFE500] text-[#080808]" },
  ];

  return (
    <section className="border-b-[3px] border-[#080808] bg-[#F8F6EC] py-16 md:py-24 font-mono">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section 10: Close The Loop Workflow */}
        <div className="mb-14 text-center">
          <div className="inline-block border-2 border-[#080808] bg-[#FFE500] px-3 py-1 text-xs font-black uppercase text-[#080808] shadow-[2.5px_2.5px_0px_#080808]">
            THE COMPLETE CIRCLE
          </div>
          <h2 className="mt-4 text-3xl font-black uppercase tracking-tight text-[#080808] sm:text-4xl md:text-5xl leading-[1.05]">
            DON&apos;T JUST BUILD. <br />
            <span className="bg-[#B7FF6A] px-2 py-0.5 border-2 border-[#080808] inline-block mt-1">
              KNOW WHEN TO SHIP.
            </span>
          </h2>
          <p className="mt-4 text-xs sm:text-sm font-bold text-[#080808]/80 max-w-xl mx-auto">
            From the first idea prompt to final verification checks, close the loop with confidence.
          </p>

          {/* Linear Sequential Badge Sequence */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {steps.map((st, i) => (
              <React.Fragment key={st.title}>
                <div
                  className={`border-[2.5px] border-[#080808] ${st.color} px-3.5 py-1.5 text-xs font-black uppercase tracking-wider shadow-[2.5px_2.5px_0px_#080808] transition-transform hover:-translate-y-0.5`}
                >
                  {st.title}
                </div>
                {i < steps.length - 1 && (
                  <span className="text-sm font-black text-[#080808]" aria-hidden="true">
                    →
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* FINAL CTA: Large Yellow Neo-Brutalist Panel with Rocket Mascot */}
        <div className="border-[4px] border-[#080808] bg-[#FFE500] p-8 sm:p-12 shadow-[8px_8px_0px_#080808]">
          <div className="mx-auto max-w-4xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            
            <div className="space-y-4 max-w-xl">
              <div className="inline-block border-2 border-[#080808] bg-[#080808] px-3 py-0.5 text-[11px] font-black uppercase tracking-widest text-[#FFE500]">
                GET STARTED TODAY
              </div>

              <h3 className="text-3xl font-black uppercase tracking-tight text-[#080808] sm:text-4xl md:text-5xl leading-[1.02]">
                YOU BRING THE IDEA. <br />
                AIGENSTRA HELPS YOU <br />
                BUILD IT RIGHT.
              </h3>

              <p className="text-xs sm:text-sm font-bold text-[#080808]">
                Stop guessing what to tell your AI coding agent. Start with a plan.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/projects/new"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-[3px] border-[#080808] bg-[#080808] px-7 py-3 text-xs font-black uppercase tracking-wider text-white shadow-[4px_4px_0px_#F8F6EC] transition-all hover:bg-white hover:text-[#080808] active:translate-y-0.5"
                >
                  <span>Start building now →</span>
                </Link>

                <Link
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-[3px] border-[#080808] bg-white px-6 py-3 text-xs font-black uppercase tracking-wider text-[#080808] shadow-[3px_3px_0px_#080808] hover:bg-[#F8F6EC] active:translate-y-0.5"
                >
                  <span>How it works</span>
                </Link>
              </div>
            </div>

            {/* Rocket Shipper Mascot with Hover Blast */}
            <div className="shrink-0 p-4 border-[3px] border-[#080808] bg-white shadow-[6px_6px_0px_#080808] transition-transform hover:-translate-y-2">
              <RocketShipperCharacter className="w-32 h-32 sm:w-36 sm:h-36" />
              <div className="border border-[#080808] bg-[#B7FF6A] mt-2 py-0.5 text-center text-[10px] font-black uppercase text-[#080808]">
                READY TO SHIP
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
