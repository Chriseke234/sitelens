import React from "react";
import { ArrowDown, XCircle, CheckCircle2, AlertTriangle, Zap, Check } from "lucide-react";
import { ConfusedAgentCharacter, AgentArchitectCharacter } from "@/components/landing/characters";

export function NeoProblem() {
  return (
    <section className="border-b-[3px] border-[#080808] bg-[#F8F6EC] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header - Concise & Punchy */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-block border-2 border-[#080808] bg-[#FF4F9A] px-3 py-1 font-mono text-xs font-black uppercase text-white shadow-[3px_3px_0px_#080808]">
            THE REAL BOTTLENECK
          </div>
          <h2 className="mt-4 font-mono text-3xl font-black uppercase tracking-tight text-[#080808] sm:text-4xl md:text-5xl leading-[1.05]">
            AI CAN BUILD FAST. <br />
            <span className="bg-[#FFE500] px-2 py-0.5 border-2 border-[#080808] inline-block mt-1">
              DON&apos;T FEED IT
            </span>{" "}
            POOR CONTEXT.
          </h2>
          <p className="mt-4 text-base font-bold text-[#080808]/80 font-mono">
            Vague prompts break apps and burn tokens. Aigenstra structures the plan first.
          </p>
        </div>

        {/* Visual Striking Comparison */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          
          {/* LEFT: WITHOUT AIGENSTRA */}
          <div className="group flex flex-col justify-between border-[3px] border-[#080808] bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#080808] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[10px_10px_0px_#080808]">
            <div>
              <div className="flex items-center justify-between border-b-[3px] border-[#080808] pb-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-6 w-6 text-[#FF4F9A] stroke-[2.5]" />
                  <span className="font-mono text-lg font-black uppercase text-[#080808]">
                    WITHOUT AIGENSTRA
                  </span>
                </div>
                <span className="border-2 border-[#080808] bg-[#FF4F9A]/20 px-2.5 py-0.5 font-mono text-[11px] font-black uppercase text-[#080808]">
                  Vague &amp; Chaotic
                </span>
              </div>

              {/* Character Illustration Badge */}
              <div className="my-4 flex items-center justify-center p-2 bg-[#F8F6EC] border-2 border-dashed border-[#080808]">
                <ConfusedAgentCharacter className="w-24 h-24" />
              </div>

              <div className="flex flex-col items-center space-y-3 font-mono text-center">
                
                {/* Step 1 */}
                <div className="w-full border-2 border-[#080808] bg-red-50 p-2.5 text-xs font-bold text-[#080808]">
                  &ldquo;Build me a complete SaaS dashboard with billing and auth.&rdquo;
                </div>
                
                <ArrowDown className="h-4 w-4 text-[#080808]/50 stroke-[2.5] animate-bounce" />

                {/* Step 2 */}
                <div className="w-full border-2 border-[#080808] bg-white p-2.5 text-xs font-bold text-[#080808]">
                  AI guesses requirements &amp; picks random packages
                </div>

                <ArrowDown className="h-4 w-4 text-[#080808]/50 stroke-[2.5] animate-bounce" />

                {/* Step 3 */}
                <div className="w-full border-2 border-[#080808] bg-white p-2.5 text-xs font-bold text-[#080808]">
                  Agent touches unrelated files and breaks core features
                </div>

                <ArrowDown className="h-4 w-4 text-[#080808]/50 stroke-[2.5] animate-bounce" />

                {/* Step 4 */}
                <div className="w-full border-2 border-[#080808] bg-red-100 p-2.5 text-xs font-black text-red-900 border-dashed">
                  Burned tokens → Broken app → Endless manual fixing
                </div>

              </div>
            </div>

            <div className="mt-6 border-t-2 border-[#080808] pt-3 font-mono text-xs font-black text-[#FF4F9A]">
              Result: Frustration, regressions, and hesitation to ship.
            </div>
          </div>

          {/* RIGHT: WITH AIGENSTRA */}
          <div className="group flex flex-col justify-between border-[3px] border-[#080808] bg-[#FFE500] p-6 sm:p-8 shadow-[8px_8px_0px_#080808] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[10px_10px_0px_#080808]">
            <div>
              <div className="flex items-center justify-between border-b-[3px] border-[#080808] pb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-[#080808] stroke-[2.5]" />
                  <span className="font-mono text-lg font-black uppercase text-[#080808]">
                    WITH AIGENSTRA
                  </span>
                </div>
                <span className="border-2 border-[#080808] bg-white px-2.5 py-0.5 font-mono text-[11px] font-black uppercase text-[#080808]">
                  Structured &amp; Verified
                </span>
              </div>

              {/* Character Illustration Badge */}
              <div className="my-4 flex items-center justify-center p-2 bg-[#F8F6EC] border-2 border-dashed border-[#080808]">
                <AgentArchitectCharacter className="w-24 h-24" />
              </div>

              <div className="flex flex-col items-center space-y-2 font-mono text-center">
                
                {/* Sequential Flow */}
                <div className="w-full border-2 border-[#080808] bg-white p-2.5 text-xs font-black text-[#080808] shadow-[2px_2px_0px_#080808] transition-transform hover:scale-102">
                  01. RAW IDEA / SPECS
                </div>

                <ArrowDown className="h-4 w-4 text-[#080808] stroke-[2.5]" />

                <div className="w-full border-2 border-[#080808] bg-white p-2.5 text-xs font-black text-[#080808] shadow-[2px_2px_0px_#080808] transition-transform hover:scale-102">
                  02. CONTEXT &amp; DECISION REASONING
                </div>

                <ArrowDown className="h-4 w-4 text-[#080808] stroke-[2.5]" />

                <div className="w-full border-2 border-[#080808] bg-white p-2.5 text-xs font-black text-[#080808] shadow-[2px_2px_0px_#080808] transition-transform hover:scale-102">
                  03. STRUCTURED BUILD BLUEPRINT
                </div>

                <ArrowDown className="h-4 w-4 text-[#080808] stroke-[2.5]" />

                <div className="w-full border-2 border-[#080808] bg-white p-2.5 text-xs font-black text-[#080808] shadow-[2px_2px_0px_#080808] transition-transform hover:scale-102">
                  04. SURGICAL AGENT IMPLEMENTATION PROMPT
                </div>

                <ArrowDown className="h-4 w-4 text-[#080808] stroke-[2.5]" />

                <div className="w-full border-2 border-[#080808] bg-white p-2.5 text-xs font-black text-[#080808] shadow-[2px_2px_0px_#080808] transition-transform hover:scale-102">
                  05. FOCUSED BUILD (ONE TASK AT A TIME)
                </div>

                <ArrowDown className="h-4 w-4 text-[#080808] stroke-[2.5]" />

                <div className="w-full border-2 border-[#080808] bg-[#B7FF6A] p-3 text-xs font-black text-[#080808] shadow-[3px_3px_0px_#080808] transition-transform hover:scale-102">
                  06. AUDIT, VERIFY &amp; CONFIDENTLY SHIP
                </div>

              </div>
            </div>

            <div className="mt-6 border-t-2 border-[#080808] pt-4 font-mono text-xs font-bold text-[#080808]">
              Result: Zero context pollution, surgical pull requests, and total clarity.
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
