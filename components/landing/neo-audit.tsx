"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, AlertTriangle, CheckCircle, Shield, Gauge, Eye, Zap, RefreshCw, Terminal } from "lucide-react";
import { AuditorCharacter } from "@/components/landing/characters";

export function NeoAudit() {
  const [fixGenerated, setFixGenerated] = useState(false);

  return (
    <section className="border-b-[3px] border-[#080808] bg-[#F8F6EC] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-block border-2 border-[#080808] bg-[#B7FF6A] px-3 py-1 font-mono text-xs font-black uppercase text-[#080808] shadow-[3px_3px_0px_#080808]">
            VERIFICATION &amp; QA
          </div>
          <h2 className="mt-5 font-mono text-3xl font-black uppercase tracking-tight text-[#080808] sm:text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
            BUILDING ISN&apos;T <br />
            <span className="bg-[#FFE500] px-2 py-0.5 border-2 border-[#080808] inline-block mt-1">
              THE FINISH LINE.
            </span>
          </h2>
          <p className="mt-4 text-sm font-bold text-[#080808]/80 font-mono max-w-xl mx-auto">
            Verify what your agent built. Generate instant targeted fix prompts before shipping.
          </p>
        </div>

        {/* Large Audit Interface Box with Floating Auditor Character */}
        <div className="relative mt-16 mx-auto max-w-4xl">
          
          {/* Floating Auditor Callout Badge */}
          <div className="hidden lg:flex absolute -left-16 -top-12 z-20 items-center gap-2 border-2 border-[#080808] bg-[#FFE500] p-2 shadow-[4px_4px_0px_#080808] -rotate-3 hover:rotate-0 transition-transform">
            <AuditorCharacter className="w-16 h-16" />
            <div className="font-mono text-[10px] leading-tight">
              <span className="font-black uppercase text-[#080808] block">QA AUDITOR</span>
              <span className="text-[#080808]/80">Automated Scan</span>
            </div>
          </div>

          <div className="border-[3px] border-[#080808] bg-white shadow-[8px_8px_0px_#080808] transition-transform hover:-translate-y-0.5 hover:shadow-[10px_10px_0px_#080808]">
            {/* Audit Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b-[3px] border-[#080808] bg-[#080808] p-4 text-white">
              <div className="flex items-center gap-3 font-mono">
                <span className="bg-[#B7FF6A] text-[#080808] px-2.5 py-1 text-xs font-black uppercase shadow-[1px_1px_0px_#FFF]">
                  AIGENSTRA PRODUCT CHECK
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  AUDIT SUITE
                </span>
              </div>
              
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-white/60">OVERALL HEALTH:</span>
                <span className="border-2 border-white bg-[#FFE500] px-2.5 py-0.5 font-mono text-sm font-black text-[#080808] shadow-[2px_2px_0px_#FF4F9A]">
                  82 / 100
                </span>
              </div>
            </div>

            {/* Metrics Grid with Tactile Hover Effects */}
            <div className="grid grid-cols-2 border-b-2 border-[#080808] bg-[#F8F6EC] sm:grid-cols-3 lg:grid-cols-6 font-mono text-xs">
              <div className="border-r border-b sm:border-b-0 border-[#080808] p-3 text-center transition-colors hover:bg-white">
                <div className="text-[10px] font-bold text-[#080808]/60 uppercase">UX</div>
                <div className="text-lg font-black text-[#080808]">86</div>
              </div>
              <div className="border-r border-b sm:border-b-0 border-[#080808] p-3 text-center transition-colors hover:bg-white">
                <div className="text-[10px] font-bold text-[#080808]/60 uppercase">PERFORMANCE</div>
                <div className="text-lg font-black text-[#080808]">78</div>
              </div>
              <div className="border-r border-b sm:border-b-0 border-[#080808] p-3 text-center transition-colors hover:bg-white">
                <div className="text-[10px] font-bold text-[#080808]/60 uppercase">ACCESSIBILITY</div>
                <div className="text-lg font-black text-[#080808]">91</div>
              </div>
              <div className="border-r border-[#080808] p-3 text-center transition-colors hover:bg-white">
                <div className="text-[10px] font-bold text-[#080808]/60 uppercase">SECURITY</div>
                <div className="text-lg font-black text-[#080808]">84</div>
              </div>
              <div className="border-r border-[#080808] p-3 text-center transition-colors hover:bg-white">
                <div className="text-[10px] font-bold text-[#080808]/60 uppercase">SEO</div>
                <div className="text-lg font-black text-[#080808]">79</div>
              </div>
              <div className="p-3 text-center transition-colors hover:bg-white">
                <div className="text-[10px] font-bold text-[#080808]/60 uppercase">CONVERSION</div>
                <div className="text-lg font-black text-[#080808]">76</div>
              </div>
            </div>

            {/* Finding & Recommendation Card */}
            <div className="p-6 sm:p-8 space-y-6">
              
              <div className="border-2 border-[#080808] bg-yellow-50 p-5 shadow-[4px_4px_0px_#080808]">
                <div className="flex items-center gap-2 font-mono">
                  <AlertTriangle className="h-5 w-5 text-[#080808] stroke-[2.5]" />
                  <span className="bg-[#FFE500] border border-[#080808] px-2 py-0.5 text-xs font-black uppercase text-[#080808]">
                    ISSUE FOUND
                  </span>
                  <span className="font-mono text-xs font-black uppercase text-[#080808]">
                    Primary CTA lacks clarity &amp; feedback states
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                  <div>
                    <span className="font-black uppercase text-[#080808]">WHY IT MATTERS:</span>
                    <p className="mt-1 text-[#080808]/80 font-medium">
                      Users cannot tell whether clicking submits a query or enters a checkout flow, leading to bounce before conversion.
                    </p>
                  </div>
                  <div>
                    <span className="font-black uppercase text-[#080808]">RECOMMENDATION:</span>
                    <p className="mt-1 text-[#080808]/80 font-medium">
                      Rewrite button label, add explicit microcopy below, and implement active loading state.
                    </p>
                  </div>
                </div>

                {/* Fix Prompt Action with Micro-Motion */}
                <div className="mt-5 border-t border-[#080808]/20 pt-4 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setFixGenerated(!fixGenerated)}
                    className="inline-flex items-center gap-2 border-2 border-[#080808] bg-[#FFE500] px-4 py-2 font-mono text-xs font-black uppercase tracking-wider text-[#080808] shadow-[3px_3px_0px_#080808] transition-all hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1"
                  >
                    <Terminal className="h-4 w-4 stroke-[2.5]" />
                    <span>{fixGenerated ? "Hide fix prompt ↑" : "Generate fix prompt →"}</span>
                  </button>

                  <span className="font-mono text-[11px] font-bold text-[#080808]/60">
                    Ready to paste directly into your AI coding agent
                  </span>
                </div>

                {/* Fix Prompt Snippet Display */}
                {fixGenerated && (
                  <div className="mt-4 border-2 border-[#080808] bg-[#080808] p-4 text-[#B7FF6A] font-mono text-xs animate-fade-in shadow-[4px_4px_0px_#B7FF6A]">
                    <div className="text-white/60 mb-2 border-b border-white/20 pb-1">
                      &gt; GENERATED SURGICAL FIX PROMPT:
                    </div>
                    <code>
                      &ldquo;In components/landing/hero.tsx, update the primary CTA to &apos;Start building with Aigenstra&apos;. Add an explicit aria-label and ensure loading spinner is conditionally rendered without altering surrounding layout styles.&rdquo;
                    </code>
                  </div>
                )}
              </div>

              {/* Workflow Loop Indicator */}
              <div className="border-2 border-[#080808] bg-[#F8F6EC] p-4 font-mono shadow-[3px_3px_0px_#080808]">
                <div className="text-[11px] font-black uppercase text-[#080808] mb-2">
                  CLOSED-LOOP WORKFLOW:
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#080808]">
                  <span className="bg-white border border-[#080808] px-2 py-1 shadow-[1px_1px_0px_#080808]">AUDIT</span>
                  <span>→</span>
                  <span className="bg-[#FF4F9A] text-white border border-[#080808] px-2 py-1 shadow-[1px_1px_0px_#080808]">FIND PROBLEM</span>
                  <span>→</span>
                  <span className="bg-[#FFE500] border border-[#080808] px-2 py-1 shadow-[1px_1px_0px_#080808]">GENERATE FIX PROMPT</span>
                  <span>→</span>
                  <span className="bg-white border border-[#080808] px-2 py-1 shadow-[1px_1px_0px_#080808]">AI CODING AGENT</span>
                  <span>→</span>
                  <span className="bg-[#B7FF6A] border border-[#080808] px-2 py-1 shadow-[1px_1px_0px_#080808]">VERIFY</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
