"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Check, Sparkles, Terminal, FileCode, ShieldCheck, Eye, Layers } from "lucide-react";
import { VibecoderCharacter } from "@/components/landing/characters";

export function NeoHero() {
  return (
    <section className="relative overflow-hidden border-b-[3px] border-[#080808] bg-[#F8F6EC] py-16 md:py-24 lg:py-28">
      {/* Background Subtle Editorial Grid Accents */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#080808 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* Left Column: Editorial Headline & Actions (7 cols on lg) */}
          <div className="flex flex-col items-start lg:col-span-7">
            {/* Top Pill Label with subtle live pulse indicator */}
            <div className="inline-flex items-center gap-2 border-2 border-[#080808] bg-[#B7FF6A] px-3.5 py-1 text-xs font-mono font-black uppercase tracking-wider text-[#080808] shadow-[3px_3px_0px_#080808] transition-transform hover:scale-105">
              <span className="h-2 w-2 rounded-full bg-[#080808] animate-ping" />
              <span>THINK BEFORE YOU VIBE.</span>
            </div>

            {/* Oversized Editorial Headline */}
            <h1 className="mt-6 font-mono text-5xl font-black uppercase tracking-tight text-[#080808] sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95]">
              THINK BEFORE <br />
              YOU{" "}
              <span className="relative inline-block bg-[#FFE500] px-2 py-0.5 border-[3px] border-[#080808] shadow-[4px_4px_0px_#080808] -rotate-1 transition-transform hover:rotate-2 cursor-pointer">
                VIBE.
              </span>
            </h1>

            {/* Supporting Pitch - Punchy & Direct */}
            <p className="mt-6 text-xl sm:text-2xl font-black text-[#080808] font-mono leading-snug">
              Your AI coding agent can code. <br />
              <span className="bg-[#FFE500] border-2 border-[#080808] text-[#080808] px-2 py-0.5 inline-block mt-1 shadow-[2px_2px_0px_#080808]">
                Aigenstra tells it what to build.
              </span>
            </p>
            <p className="mt-3 text-sm sm:text-base font-bold text-[#080808]/80 font-mono">
              From raw idea to structured build blueprint and precision prompts.
            </p>

            {/* Primary & Secondary CTAs with Tactile Neo-Brutalist Micro-Motions */}
            <div className="mt-10 flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center">
              <Link
                href="/projects/new"
                className="group inline-flex items-center justify-center gap-3 border-[3px] border-[#080808] bg-[#FFE500] px-8 py-4 font-mono text-sm font-black uppercase tracking-wider text-[#080808] shadow-[6px_6px_0px_#080808] transition-all hover:-translate-y-1 hover:translate-x-[-1px] hover:shadow-[8px_8px_0px_#080808] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
              >
                <span>Start building with Aigenstra</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 border-[3px] border-[#080808] bg-white px-6 py-4 font-mono text-sm font-black uppercase tracking-wider text-[#080808] shadow-[4px_4px_0px_#080808] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#080808] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              >
                <span>See how it works</span>
              </Link>
            </div>

            {/* Bottom Row: Animated Character Badge & Workflow Ticker */}
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 border-2 border-[#080808] bg-white p-2.5 shadow-[3px_3px_0px_#080808] transition-all hover:scale-102">
                <div className="h-12 w-12 shrink-0">
                  <VibecoderCharacter className="w-12 h-12" />
                </div>
                <div className="font-mono text-[11px] leading-tight">
                  <span className="font-black uppercase text-[#080808] block">VIBECODER ACTIVE</span>
                  <span className="text-[#080808]/70">Zero hallucinated architecture</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-2 border-[#080808] bg-white p-3 font-mono text-xs font-black uppercase tracking-wider text-[#080808] shadow-[3px_3px_0px_#080808]">
                <span className="text-[#FF4F9A] hover:underline">PLAN</span>
                <span className="text-[#080808]/30">•</span>
                <span className="text-[#080808]">PROMPT</span>
                <span className="text-[#080808]/30">•</span>
                <span className="text-[#080808]">BUILD</span>
                <span className="text-[#080808]/30">•</span>
                <span className="text-[#080808]">AUDIT</span>
                <span className="text-[#080808]/30">•</span>
                <span className="text-[#B7FF6A] bg-[#080808] px-1.5 py-0.5 shadow-[1px_1px_0px_#FFE500]">VERIFY</span>
                <span className="text-[#080808]/30">•</span>
                <span className="text-[#FFE500] bg-[#080808] px-1.5 py-0.5 shadow-[1px_1px_0px_#B7FF6A]">SHIP</span>
              </div>
            </div>
          </div>

          {/* Right Column: Neo-Brutalist 5-Card Workflow Visual (5 cols on lg) */}
          <div className="relative mt-8 lg:col-span-5 lg:mt-0">
            <div className="relative mx-auto flex max-w-md flex-col space-y-4">
              
              {/* CARD 1: YOUR IDEA */}
              <div className="relative z-10 border-[3px] border-[#080808] bg-white p-4 shadow-[5px_5px_0px_#080808] -rotate-1 transition-transform duration-300 hover:rotate-0 hover:scale-102 hover:shadow-[7px_7px_0px_#080808]">
                <div className="flex items-center justify-between border-b-2 border-[#080808] pb-2 font-mono">
                  <span className="bg-[#080808] px-2 py-0.5 text-[10px] font-black uppercase text-[#FFE500]">
                    CARD 01
                  </span>
                  <span className="text-xs font-black uppercase text-[#080808]">YOUR IDEA</span>
                </div>
                <p className="mt-3 font-mono text-xs text-[#080808]">
                  &ldquo;Build a modern subscription marketplace with role-based auth and automated Stripe billing...&rdquo;
                </p>
              </div>

              {/* CARD 2: AIGENSTRA UNDERSTANDING */}
              <div className="relative z-20 border-[3px] border-[#080808] bg-[#FFE500] p-4 shadow-[6px_6px_0px_#080808] translate-x-2 rotate-1 transition-transform duration-300 hover:rotate-0 hover:scale-102 hover:shadow-[8px_8px_0px_#080808]">
                <div className="flex items-center justify-between border-b-2 border-[#080808] pb-2 font-mono">
                  <span className="bg-[#080808] px-2 py-0.5 text-[10px] font-black uppercase text-white">
                    CARD 02
                  </span>
                  <span className="text-xs font-black uppercase text-[#080808]">AIGENSTRA ANALYSIS</span>
                </div>
                <div className="mt-2 text-xs font-black uppercase text-[#080808]">
                  Understanding your product:
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1.5 font-mono text-[11px] font-bold text-[#080808]">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[#080808] stroke-[3]" />
                    <span>Requirements</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[#080808] stroke-[3]" />
                    <span>User Journey</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[#080808] stroke-[3]" />
                    <span>UX Patterns</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[#080808] stroke-[3]" />
                    <span>Architecture</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <Check className="h-3.5 w-3.5 text-[#080808] stroke-[3]" />
                    <span>Supabase Security & RLS</span>
                  </div>
                </div>
              </div>

              {/* CARD 3: BUILD BLUEPRINT */}
              <div className="relative z-30 border-[3px] border-[#080808] bg-white p-4 shadow-[6px_6px_0px_#080808] -translate-x-1 -rotate-0.5 transition-transform duration-300 hover:rotate-0 hover:scale-102 hover:shadow-[8px_8px_0px_#080808]">
                <div className="flex items-center justify-between border-b-2 border-[#080808] pb-2 font-mono">
                  <span className="bg-[#FF4F9A] px-2 py-0.5 text-[10px] font-black uppercase text-white">
                    CARD 03
                  </span>
                  <span className="text-xs font-black uppercase text-[#080808]">BUILD BLUEPRINT</span>
                </div>
                <div className="mt-2.5 space-y-1 font-mono text-[10px] font-bold text-[#080808]/90">
                  <div className="flex justify-between border-b border-dashed border-[#080808]/30 pb-0.5">
                    <span>01 Product specs</span>
                    <span className="text-[#080808]/60">Defined</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-[#080808]/30 pb-0.5">
                    <span>02 User flows</span>
                    <span className="text-[#080808]/60">Mapped</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-[#080808]/30 pb-0.5">
                    <span>03 UI & Design System</span>
                    <span className="text-[#080808]/60">Structured</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-[#080808]/30 pb-0.5">
                    <span>04 Frontend Components</span>
                    <span className="text-[#080808]/60">Planned</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-[#080808]/30 pb-0.5">
                    <span>05 Backend & Supabase</span>
                    <span className="text-[#080808]/60">Scoped</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-[#080808]/30 pb-0.5">
                    <span>06 Database Schema & RLS</span>
                    <span className="text-[#080808]/60">Locked</span>
                  </div>
                  <div className="flex justify-between font-black text-[#080808]">
                    <span>07 Security Guardrails</span>
                    <span className="bg-[#FFE500] px-1 text-[9px] shadow-[1px_1px_0px_#080808]">Ready</span>
                  </div>
                </div>
              </div>

              {/* CARD 4: AGENT PROMPT */}
              <div className="relative z-40 border-[3px] border-[#080808] bg-[#080808] p-4 text-white shadow-[6px_6px_0px_#FFE500] translate-x-2 rotate-1 transition-transform duration-300 hover:rotate-0 hover:scale-102">
                <div className="flex items-center justify-between border-b border-white/30 pb-2 font-mono">
                  <span className="bg-[#FFE500] px-2 py-0.5 text-[10px] font-black uppercase text-[#080808]">
                    CARD 04
                  </span>
                  <span className="text-xs font-black uppercase text-[#FFE500]">AGENT PROMPT #07</span>
                </div>
                <div className="mt-2.5 font-mono text-[11px] leading-tight text-[#B7FF6A]">
                  &gt; IMPLEMENT: Task 07 Database Architecture<br />
                  &gt; SCOPE: Create tables with RLS policies<br />
                  &gt; CONSTRAINT: Do NOT modify existing auth session logic
                </div>
              </div>

              {/* CARD 5: VERIFIED */}
              <div className="relative z-50 border-[3px] border-[#080808] bg-[#B7FF6A] p-4 shadow-[6px_6px_0px_#080808] -translate-x-1.5 -rotate-1 transition-transform duration-300 hover:rotate-0 hover:scale-102 hover:shadow-[8px_8px_0px_#080808]">
                <div className="flex items-center justify-between border-b-2 border-[#080808] pb-2 font-mono">
                  <span className="bg-[#080808] px-2 py-0.5 text-[10px] font-black uppercase text-[#B7FF6A]">
                    CARD 05
                  </span>
                  <span className="text-xs font-black uppercase text-[#080808]">VERIFIED & SHIP READY</span>
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-1.5 font-mono text-[11px] font-black text-[#080808]">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[#080808] stroke-[3]" />
                    <span>Requirements checked</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[#080808] stroke-[3]" />
                    <span>UX reviewed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[#080808] stroke-[3]" />
                    <span>Security reviewed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[#080808] stroke-[3]" />
                    <span>Ready for next task</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
