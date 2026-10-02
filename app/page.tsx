import type { Metadata } from "next";
import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/landing/hero";
import { ProblemSection } from "@/components/landing/problem-section";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { HowItWorks } from "@/components/landing/how-it-works";
import { MediaAnalysisPreview } from "@/components/landing/media-analysis-preview";
import { ReportPreview } from "@/components/landing/report-preview";
import { AudienceSection } from "@/components/landing/audience-section";
import { TemplatesPreview } from "@/components/landing/templates-preview";
import { FinalCTA } from "@/components/landing/final-cta";

export const metadata: Metadata = {
  title: "Aigenstra — AI Product Engineering & Audit Platform for Vibe Coders",
  description:
    "Think before you vibe. Plan, architect, debate with AI specialist agents, generate surgical 16-part implementation prompts, and audit your products with Aigenstra.",
  openGraph: {
    title: "Aigenstra — AI Product Engineering & Audit Platform",
    description:
      "Think before you vibe. Transform messy ideas into verified products with a multidisciplinary AI engineering council and comprehensive audit suite.",
    url: "https://aigenstra.vercel.app",
    siteName: "Aigenstra",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aigenstra — AI Product Engineering & Audit Platform",
    description:
      "Think before you vibe. AI-assisted product engineering and audit workspace for vibe coders.",
  },
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* 1. Hero & Example Audit Preview */}
        <Hero />

        {/* 2. Problem Section */}
        <ProblemSection />

        {/* 3. What Aigenstra Analyzes (6 categories) */}
        <FeaturesGrid />

        {/* 4. Starter Templates Showcase */}
        <TemplatesPreview />

        {/* 5. How It Works (3-step progression) */}
        <HowItWorks />

        {/* 6. Media Authenticity & Provenance Preview */}
        <MediaAnalysisPreview />

        {/* 7. Actionable Reports Showcase */}
        <ReportPreview />

        {/* 8. Who It Is For (Target Audiences) */}
        <AudienceSection />

        {/* 9. Final Conversion CTA */}
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
