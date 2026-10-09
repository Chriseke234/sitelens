import type { Metadata } from "next";
import React from "react";
import { NeoNavbar } from "@/components/landing/neo-navbar";
import { NeoHero } from "@/components/landing/neo-hero";
import { NeoProblem } from "@/components/landing/neo-problem";
import { NeoCapabilities } from "@/components/landing/neo-capabilities";
import { NeoWorkflow } from "@/components/landing/neo-workflow";
import { NeoBlueprint } from "@/components/landing/neo-blueprint";
import { NeoEfficiency } from "@/components/landing/neo-efficiency";
import { NeoAudit } from "@/components/landing/neo-audit";
import { NeoAudience } from "@/components/landing/neo-audience";
import { NeoEcosystem } from "@/components/landing/neo-ecosystem";
import { NeoPricing } from "@/components/landing/neo-pricing";
import { NeoFinalCTA } from "@/components/landing/neo-final-cta";
import { NeoFooter } from "@/components/landing/neo-footer";

export const metadata: Metadata = {
  title: "Aigenstra — Think Before You Vibe | The AI Coding Thinking Layer",
  description:
    "Aigenstra turns your idea, product or codebase into a structured build plan and context-aware prompts for your AI coding agent — so you spend less time fixing bad instructions and more time shipping.",
  keywords: [
    "AI coding agent",
    "AI product builder",
    "AI coding prompts",
    "vibe coding",
    "AI development",
    "AI product planning",
    "AI code audit",
    "AI development workflow",
    "think before you vibe",
    "Google Antigravity",
    "Claude Code",
    "Codex",
    "Supabase architecture",
  ],
  authors: [{ name: "Aigenstra Engineering" }],
  creator: "Aigenstra",
  publisher: "Aigenstra",
  openGraph: {
    title: "Aigenstra — Think Before You Vibe",
    description:
      "The thinking layer between you and your AI coding agent. Plan, structure, prompt, audit, and ship without regression.",
    url: "https://aigenstra.vercel.app",
    siteName: "Aigenstra",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aigenstra — Think Before You Vibe",
    description:
      "The thinking layer between you and your AI coding agent. Plan, prompt, build, audit, verify, ship.",
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Aigenstra",
    headline: "Think Before You Vibe",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description:
      "Aigenstra turns your idea, product or codebase into a structured build plan and context-aware prompts for your AI coding agent.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F6EC] text-[#080808] selection:bg-[#FFE500] selection:text-[#080808] antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Header & Navigation */}
      <NeoNavbar />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <NeoHero />

        {/* 3. Section 2: The Problem */}
        <NeoProblem />

        {/* 4. Section 3: What Aigenstra Does */}
        <NeoCapabilities />

        {/* 5. Section 4: How It Works */}
        <NeoWorkflow />

        {/* 6. Section 5: The Build Blueprint */}
        <NeoBlueprint />

        {/* 7. Section 6: Token Efficiency */}
        <NeoEfficiency />

        {/* 8. Section 7: Audit & Verification */}
        <NeoAudit />

        {/* 9. Section 8: Who Aigenstra Is For */}
        <NeoAudience />

        {/* 10. Section 9: Works With Your Workflow */}
        <NeoEcosystem />

        {/* 11. Section: Simple Pricing */}
        <NeoPricing />

        {/* 12. Section 10 & Final CTA: Close The Loop */}
        <NeoFinalCTA />
      </main>

      {/* 13. Minimalist Neo-Brutalist Footer */}
      <NeoFooter />
    </div>
  );
}
