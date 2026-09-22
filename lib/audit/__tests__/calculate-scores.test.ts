import { calculateCategoryScores } from "../calculate-scores";
import { HTMLSignals, LighthouseMetrics } from "../types";

export function testScoreCalculations() {
  console.log("Running Score Calculation Unit Tests...");

  const mockSignals: HTMLSignals = {
    hasTitle: true,
    titleText: "Example Website - Professional Digital Intelligence",
    titleLength: 50,
    hasMetaDescription: true,
    metaDescriptionText: "SiteLens analyzes websites and digital media to identify problems, measure performance metrics, and provide actionable recommendations.",
    metaDescriptionLength: 136,
    hasCanonical: true,
    canonicalUrl: "https://example.com/",
    hasViewport: true,
    robotsDirective: "index, follow",
    hasH1: true,
    h1Count: 1,
    h1Text: "Welcome to Example Website",
    totalHeadingCount: 6,
    totalImageCount: 5,
    imagesMissingAltCount: 0,
    totalLinkCount: 12,
    brokenLinksDetected: 0,
    hasStructuredData: true,
    htmlLang: "en",

    hasNavElement: true,
    hasMainElement: true,
    hasFooterElement: true,
    hasEmptyButtonsOrLinks: false,
    textContentLength: 1200,

    isHttps: true,
    hasPrivacyLink: true,
    hasContactLink: true,
    hasTermsLink: true,

    formCount: 1,
    hasCallToActionLinks: true,
    hasMailtoLinks: false,
    hasTelLinks: false,
  };

  const mockLighthouse: LighthouseMetrics = {
    available: false,
  };

  // Test 1: Perfect website scores
  const scores1 = calculateCategoryScores(mockSignals, mockLighthouse, 200, 800);
  if (scores1.overallScore === null || scores1.overallScore < 90) {
    throw new Error(`Test 1 Failed: Expected high overall score, got ${scores1.overallScore}`);
  }
  if (scores1.seoScore !== 100) {
    throw new Error(`Test 1 Failed: Expected SEO score 100, got ${scores1.seoScore}`);
  }

  // Test 2: Non-200 HTTP Response
  const scores2 = calculateCategoryScores(mockSignals, mockLighthouse, 404, 800);
  if (scores2.overallScore !== 0 || scores2.seoScore !== 0) {
    throw new Error(`Test 2 Failed: Expected 0 score for HTTP 404, got ${scores2.overallScore}`);
  }

  // Test 3: Missing SEO elements deduction
  const badSeoSignals: HTMLSignals = {
    ...mockSignals,
    hasTitle: false,
    hasMetaDescription: false,
    hasH1: false,
  };
  const scores3 = calculateCategoryScores(badSeoSignals, mockLighthouse, 200, 800);
  if (scores3.seoScore! >= 60) {
    throw new Error(`Test 3 Failed: Expected low SEO score, got ${scores3.seoScore}`);
  }

  console.log("✓ All Score Calculation Tests Passed Successfully!");
}
