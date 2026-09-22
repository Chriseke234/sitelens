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
import { FinalCTA } from "@/components/landing/final-cta";

export const metadata: Metadata = {
  title: "SiteLens — Website Intelligence & Digital Media Analysis",
  description:
    "Analyze your website, uncover problems, and get practical recommendations. SiteLens also helps assess digital media authenticity using available evidence and provenance signals.",
  openGraph: {
    title: "SiteLens — Website Intelligence & Digital Media Analysis",
    description:
      "Analyze your website, uncover problems, and get practical recommendations. SiteLens also helps assess digital media authenticity using available evidence and provenance signals.",
    url: "https://sitelens.io",
    siteName: "SiteLens",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SiteLens — Website Intelligence & Digital Media Analysis",
    description:
      "Analyze your website, uncover problems, and get practical recommendations.",
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

        {/* 3. What SiteLens Analyzes (6 categories) */}
        <FeaturesGrid />

        {/* 4. How It Works (3-step progression) */}
        <HowItWorks />

        {/* 5. Media Authenticity & Provenance Preview */}
        <MediaAnalysisPreview />

        {/* 6. Actionable Reports Showcase */}
        <ReportPreview />

        {/* 7. Who It Is For (Target Audiences) */}
        <AudienceSection />

        {/* 8. Final Conversion CTA */}
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
