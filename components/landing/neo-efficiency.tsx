import React from "react";
import { ArrowDown, AlertCircle, Sparkles, Check, Repeat } from "lucide-react";

export function NeoEfficiency() {
  return (
    <section className="border-b-[3px] border-[#080808] bg-[#F8F6EC] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-block border-2 border-[#080808] bg-[#FFE500] px-3 py-1 font-mono text-xs font-black uppercase text-[#080808] shadow-[3px_3px_0px_#080808]">
            CONTEXT RETENTION
          </div>
          <h2 className="mt-5 font-mono text-3xl font-black uppercase tracking-tight text-[#080808] sm:text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
            STOP WASTING TOKENS <br />
            <span className="bg-[#FF4F9A] text-white px-2 py-0.5 border-2 border-[#080808] inline-block mt-1">
              EXPLAINING YOURSELF.
            </span>
          </h2>
          <p className="mt-6 text-base font-medium text-[#080808]/80 sm:text-lg max-w-2xl mx-auto">
            Bad context creates bad iterations. Aigenstra structures the work before your coding agent starts,
            helping reduce unnecessary back-and-forth and keeping each AI interaction focused on a specific outcome.
          </p>
        </div>

        {/* Visual Token Comparison */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          
          {/* BAD: The Endless Loop */}
          <div className="flex flex-col justify-between border-[3px] border-[#080808] bg-white p-6 sm:p-8 shadow-[6px_6px_0px_#080808]">
            <div>
              <div className="flex items-center justify-between border-b-2 border-[#080808] pb-3 font-mono">
                <span className="bg-red-500 text-white px-2 py-0.5 text-xs font-black uppercase">
                  UNSTRUCTURED VIBE CODING
                </span>
                <span className="text-xs font-bold text-red-600">Context Burn Loop</span>
              </div>

              <div className="mt-6 flex flex-col items-center space-y-3 font-mono text-xs font-bold text-center">
                <div className="w-full border-2 border-[#080808] bg-[#F8F6EC] p-3 text-[#080808]">
                  &ldquo;Build everything at once.&rdquo;
                </div>

                <ArrowDown className="h-4 w-4 text-red-500 stroke-[3]" />

                <div className="w-full border-2 border-red-500 bg-red-50 p-3 text-red-700">
                  FAILED ITERATION: Hallucinated dependencies
                </div>

                <ArrowDown className="h-4 w-4 text-red-500 stroke-[3]" />

                <div className="w-full border-2 border-[#080808] bg-[#F8F6EC] p-3 text-[#080808]">
                  Explain again with frantic new prompts
                </div>

                <ArrowDown className="h-4 w-4 text-red-500 stroke-[3]" />

                <div className="w-full border-2 border-red-500 bg-red-50 p-3 text-red-700">
                  Try again → Modifies unrelated components
                </div>

                <ArrowDown className="h-4 w-4 text-red-500 stroke-[3]" />

                <div className="w-full border-2 border-[#080808] bg-red-600 p-3 text-white font-black">
                  EXPENSIVE TOKENS WASTED + CODEBASE REGRESSION
                </div>
              </div>
            </div>

            <div className="mt-6 border-t-2 border-[#080808] pt-3 font-mono text-xs text-[#080808]/70">
              Every failed iteration floods your context window with dead code and repetitive error traces.
            </div>
          </div>

          {/* GOOD: The Aigenstra Path */}
          <div className="flex flex-col justify-between border-[3px] border-[#080808] bg-[#B7FF6A] p-6 sm:p-8 shadow-[6px_6px_0px_#080808]">
            <div>
              <div className="flex items-center justify-between border-b-2 border-[#080808] pb-3 font-mono">
                <span className="bg-[#080808] text-[#B7FF6A] px-2 py-0.5 text-xs font-black uppercase">
                  AIGENSTRA WORKFLOW
                </span>
                <span className="text-xs font-black text-[#080808]">Linear Progress</span>
              </div>

              <div className="mt-6 flex flex-col items-center space-y-2 font-mono text-xs font-black text-center">
                <div className="w-full border-2 border-[#080808] bg-white p-2.5 text-[#080808] shadow-[2px_2px_0px_#080808]">
                  UNDERSTAND: Clarify goals &amp; tech choices
                </div>

                <ArrowDown className="h-4 w-4 text-[#080808] stroke-[2.5]" />

                <div className="w-full border-2 border-[#080808] bg-white p-2.5 text-[#080808] shadow-[2px_2px_0px_#080808]">
                  PLAN: Break project into atomic tasks
                </div>

                <ArrowDown className="h-4 w-4 text-[#080808] stroke-[2.5]" />

                <div className="w-full border-2 border-[#080808] bg-white p-2.5 text-[#080808] shadow-[2px_2px_0px_#080808]">
                  TASK 01: Scoped prompt execution
                </div>

                <ArrowDown className="h-4 w-4 text-[#080808] stroke-[2.5]" />

                <div className="w-full border-2 border-[#080808] bg-white p-2.5 text-[#080808] shadow-[2px_2px_0px_#080808]">
                  TASK 02: Next task with locked context
                </div>

                <ArrowDown className="h-4 w-4 text-[#080808] stroke-[2.5]" />

                <div className="w-full border-2 border-[#080808] bg-[#FFE500] p-3 text-[#080808] shadow-[3px_3px_0px_#080808]">
                  VERIFY: Clear acceptance check &amp; ship
                </div>
              </div>
            </div>

            <div className="mt-6 border-t-2 border-[#080808] pt-3 font-mono text-xs font-bold text-[#080808]">
              Each prompt does exactly one thing right. Your agent gets clean context and succeeds on attempt one.
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
