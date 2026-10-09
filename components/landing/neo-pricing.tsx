import React from "react";
import Link from "next/link";
import { Check, ArrowRight, Sparkles } from "lucide-react";

export function NeoPricing() {
  const tiers = [
    {
      name: "FREE TIER",
      price: "$0",
      cadence: "forever",
      description: "Everything you need to plan and structure your first AI projects.",
      features: [
        "Full project planning wizard",
        "Build blueprint generation",
        "Surgical prompt generation",
        "Basic website & UX audit",
        "Community support",
      ],
      cta: "Start free",
      ctaBg: "bg-white text-[#080808]",
      cardBg: "bg-white",
      highlight: false,
    },
    {
      name: "PRO VIBECODER",
      price: "$29",
      cadence: "/ month",
      description: "For active builders shipping multiple products and agents per week.",
      features: [
        "Unlimited project workspaces",
        "16-part surgical prompt engine",
        "Deep Supabase schema & RLS architect",
        "Comprehensive health & audit suite",
        "Closed-loop fix prompt generator",
        "Export to Antigravity, Claude & Cursor",
      ],
      cta: "Start building with Pro →",
      ctaBg: "bg-[#080808] text-white",
      cardBg: "bg-[#FFE500]",
      highlight: true,
    },
    {
      name: "TEAMS & STUDIOS",
      price: "$99",
      cadence: "/ month",
      description: "For agencies and development teams managing client AI projects.",
      features: [
        "Multi-member shared workspaces",
        "Centralized audit scorecards",
        "Custom architecture guardrails",
        "Priority AI engine processing",
        "Dedicated onboarding & Slack channel",
      ],
      cta: "Contact team",
      ctaBg: "bg-white text-[#080808]",
      cardBg: "bg-[#B7FF6A]",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="border-b-[3px] border-[#080808] bg-[#F8F6EC] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-block border-2 border-[#080808] bg-[#FFE500] px-3 py-1 font-mono text-xs font-black uppercase text-[#080808] shadow-[3px_3px_0px_#080808]">
            SIMPLE TRANSPARENT PRICING
          </div>
          <h2 className="mt-5 font-mono text-3xl font-black uppercase tracking-tight text-[#080808] sm:text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
            INVEST IN CONTEXT. <br />
            <span className="bg-[#FF4F9A] text-white px-2 py-0.5 border-2 border-[#080808] inline-block mt-1">
              SAVE ON TOKEN WASTE.
            </span>
          </h2>
          <p className="mt-6 text-base font-medium text-[#080808]/80 sm:text-lg max-w-2xl mx-auto">
            Transparent plans. No hidden costs. Pay for clarity, not infinite debugging loops.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col justify-between border-[3px] border-[#080808] ${tier.cardBg} p-6 sm:p-8 shadow-[6px_6px_0px_#080808] transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_#080808] ${
                tier.highlight ? "ring-2 ring-[#080808]" : ""
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b-2 border-[#080808] pb-4">
                  <span className="font-mono text-xs font-black uppercase tracking-wider text-[#080808]">
                    {tier.name}
                  </span>
                  {tier.highlight && (
                    <span className="border-2 border-[#080808] bg-[#080808] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-[#FFE500]">
                      POPULAR
                    </span>
                  )}
                </div>

                <div className="mt-6 flex items-baseline gap-1 font-mono">
                  <span className="text-4xl sm:text-5xl font-black text-[#080808]">
                    {tier.price}
                  </span>
                  <span className="text-xs font-bold uppercase text-[#080808]/70">
                    {tier.cadence}
                  </span>
                </div>

                <p className="mt-4 font-mono text-xs font-bold leading-relaxed text-[#080808]/80">
                  {tier.description}
                </p>

                <ul className="mt-8 space-y-3 font-mono text-xs text-[#080808]">
                  {tier.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 shrink-0 text-[#080808] stroke-[3] mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-10 pt-4 border-t-2 border-[#080808]">
                <Link
                  href="/projects/new"
                  className={`w-full inline-flex items-center justify-center gap-2 border-2 border-[#080808] ${tier.ctaBg} px-6 py-3 font-mono text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#080808] transition-all hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1`}
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
