"use client";

import React, { useState } from "react";
import { Copy, Check, Terminal, FileCode, CheckCircle2, ShieldAlert } from "lucide-react";
import { AgentArchitectCharacter } from "@/components/landing/characters";

export function NeoBlueprint() {
  const [copied, setCopied] = useState(false);

  const samplePrompt = `TASK 07: DATABASE ARCHITECTURE & WORKSPACE RELATIONSHIPS

[CONTEXT]
- Project: Aigenstra Workspace Platform
- Backend: Existing Supabase PostgreSQL project detected.
- Target Table: public.projects, public.workspace_members

[DO NOT CHANGE]
- auth.users table and existing Supabase auth triggers.
- Existing user profiles table schema in public.profiles.
- Existing session cookies & middleware token verification.

[IMPLEMENT]
1. Create public.workspaces and public.workspace_members tables.
2. Add foreign key relationships from projects.workspace_id -> workspaces.id.
3. Establish Postgres Row-Level Security (RLS) policies:
   - Users can only read workspaces they are members of.
   - Only workspace owners can update or delete projects.

[VERIFICATION CRITERIA]
- Querying projects with a non-member session returns empty array [].
- Direct SQL insert without workspace_id triggers explicit constraint check error.
- All RLS policies are enabled and verified with test scripts.

[EXPECTED RESULT]
Clean Supabase migration SQL file with idempotency checks (IF NOT EXISTS) and rollback instructions.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(samplePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="blueprint" className="border-b-[3px] border-[#080808] bg-[#F8F6EC] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-block border-2 border-[#080808] bg-[#FF4F9A] px-3 py-1 font-mono text-xs font-black uppercase text-white shadow-[3px_3px_0px_#080808]">
            SURGICAL INSTRUCTIONS
          </div>
          <h2 className="mt-5 font-mono text-3xl font-black uppercase tracking-tight text-[#080808] sm:text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
            YOUR AI CODING AGENT <br />
            <span className="bg-[#FFE500] px-2 py-0.5 border-2 border-[#080808] inline-block mt-1">
              DOESN&apos;T NEED A LONGER PROMPT.
            </span> <br />
            IT NEEDS A BETTER ONE.
          </h2>
          <p className="mt-4 text-sm font-bold text-[#080808]/80 font-mono max-w-xl mx-auto">
            Clear constraints, explicit change boundaries, and precision context blocks that stop AI regressions.
          </p>
        </div>

        {/* Large Neo-Brutalist Prompt Card with Character Badge */}
        <div className="relative mt-14 mx-auto max-w-4xl">
          
          {/* Floating Character Callout on Desktop */}
          <div className="hidden lg:flex absolute -right-20 -top-14 z-20 items-center gap-2 border-2 border-[#080808] bg-[#B7FF6A] p-2 shadow-[4px_4px_0px_#080808] rotate-3 hover:rotate-0 transition-transform">
            <AgentArchitectCharacter className="w-16 h-16" />
            <div className="font-mono text-[10px] leading-tight">
              <span className="font-black uppercase text-[#080808] block">ARCHITECT SPEC</span>
              <span className="text-[#080808]/80">Context-locked</span>
            </div>
          </div>

          <div className="border-[3px] border-[#080808] bg-white shadow-[8px_8px_0px_#080808] transition-transform hover:-translate-y-0.5 hover:shadow-[10px_10px_0px_#080808]">
            {/* Card Top Banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b-[3px] border-[#080808] bg-[#080808] p-4 text-white">
              <div className="flex items-center gap-3 font-mono">
                <span className="bg-[#FFE500] px-2.5 py-1 text-xs font-black uppercase text-[#080808] shadow-[1px_1px_0px_#FFF]">
                  TASK 07
                </span>
                <span className="text-sm font-black uppercase tracking-wide text-white">
                  DATABASE ARCHITECTURE &amp; WORKSPACE RELATIONSHIPS
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 border-2 border-white bg-white px-3.5 py-1.5 font-mono text-xs font-black uppercase tracking-wider text-[#080808] shadow-[2px_2px_0px_#FFE500] transition-all hover:bg-[#FFE500] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-700 stroke-[3]" />
                    <span>Copied to clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 stroke-[2.5]" />
                    <span>Copy prompt →</span>
                  </>
                )}
              </button>
            </div>

            {/* Prompt Body with Visual Sections */}
            <div className="p-6 sm:p-8 space-y-6 font-mono text-xs sm:text-sm">
              
              {/* CONTEXT */}
              <div className="border-2 border-[#080808] bg-[#F8F6EC] p-4 shadow-[3px_3px_0px_#080808]">
                <div className="font-black uppercase text-[#080808] flex items-center gap-2">
                  <span className="bg-[#080808] text-white px-1.5 py-0.5 text-[10px]">01</span>
                  <span>CONTEXT &amp; ENVIRONMENT</span>
                </div>
                <p className="mt-2 text-[#080808]/90 font-medium leading-relaxed">
                  Existing Supabase PostgreSQL project detected. Schema migration required for workspace isolation.
                </p>
              </div>

              {/* DO NOT CHANGE */}
              <div className="border-2 border-[#080808] bg-red-50 p-4 shadow-[3px_3px_0px_#080808]">
                <div className="font-black uppercase text-red-800 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-red-600 stroke-[2.5]" />
                  <span className="bg-red-700 text-white px-1.5 py-0.5 text-[10px]">GUARDRAILS</span>
                  <span>DO NOT CHANGE</span>
                </div>
                <ul className="mt-2 list-disc list-inside text-red-950 font-bold space-y-1">
                  <li>Existing authentication flows &amp; <code className="bg-red-100 px-1 text-[11px]">auth.users</code> references.</li>
                  <li>Existing user profiles schema in <code className="bg-red-100 px-1 text-[11px]">public.profiles</code>.</li>
                  <li>Session cookies and SSR auth middleware verification logic.</li>
                </ul>
              </div>

              {/* IMPLEMENT */}
              <div className="border-2 border-[#080808] bg-[#FFE500]/20 p-4 shadow-[3px_3px_0px_#080808]">
                <div className="font-black uppercase text-[#080808] flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-[#080808] stroke-[2.5]" />
                  <span className="bg-[#FFE500] border border-[#080808] text-[#080808] px-1.5 py-0.5 text-[10px]">ACTION</span>
                  <span>IMPLEMENT</span>
                </div>
                <p className="mt-2 text-[#080808] font-medium leading-relaxed">
                  Project and workspace relationships. Create <code className="border border-[#080808] bg-white px-1 font-bold">public.workspaces</code> and assign Row-Level Security policies ensuring tenant boundaries cannot leak cross-account queries.
                </p>
              </div>

              {/* VERIFY & EXPECTED RESULT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border-2 border-[#080808] bg-[#B7FF6A]/20 p-4 shadow-[3px_3px_0px_#080808]">
                  <div className="font-black uppercase text-[#080808] flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#080808] stroke-[2.5]" />
                    <span>VERIFICATION CHECKS</span>
                  </div>
                  <p className="mt-2 text-[11px] font-bold text-[#080808]/90 leading-normal">
                    - RLS queries reject non-tenant sessions<br />
                    - Migration runs idempotently<br />
                    - Type generation verified via Supabase CLI
                  </p>
                </div>

                <div className="border-2 border-[#080808] bg-white p-4 shadow-[3px_3px_0px_#080808]">
                  <div className="font-black uppercase text-[#080808] flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-[#080808] stroke-[2.5]" />
                    <span>EXPECTED RESULT</span>
                  </div>
                  <p className="mt-2 text-[11px] font-bold text-[#080808]/90 leading-normal">
                    Single, reproducible migration SQL file with rollback instructions and updated TypeScript schema types.
                  </p>
                </div>
              </div>

            </div>

            {/* Footer note */}
            <div className="border-t-2 border-[#080808] bg-[#F8F6EC] px-6 py-3 font-mono text-[11px] font-bold uppercase text-[#080808]/70 flex items-center justify-between">
              <span>Contextual implementation instruction generated by Aigenstra</span>
              <span className="hidden sm:inline">16-Part Blueprint Protocol</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
