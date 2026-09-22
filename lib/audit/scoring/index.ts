import { HTMLSignals, LighthouseMetrics, DetailedScores } from "../types";
import { SCORING_VERSION } from "./scoring-rules";
import { calculateSeoScore } from "./seo-score";
import { calculatePerformanceScore } from "./performance-score";
import { calculateAccessibilityScore } from "./accessibility-score";
import { calculateUxScore } from "./ux-score";
import { calculateTrustScore } from "./trust-score";
import { calculateConversionScore } from "./conversion-score";
import { calculateOverallScore } from "./overall-score";

export * from "./scoring-rules";
export * from "./seo-score";
export * from "./performance-score";
export * from "./accessibility-score";
export * from "./ux-score";
export * from "./trust-score";
export * from "./conversion-score";
export * from "./overall-score";

/**
 * Calculates modular category scores and returns comprehensive explanations and summary
 */
export function calculateAllScores(
  signals: HTMLSignals,
  lighthouse: LighthouseMetrics,
  statusCode: number,
  responseTimeMs: number
): DetailedScores {
  if (statusCode < 200 || statusCode >= 400) {
    const zeroDetail = (categoryName: string) => ({
      score: 0,
      status: "measured" as const,
      measurableInputs: { statusCode },
      majorDeductions: [`HTTP Status ${statusCode} returned`],
      availableEvidence: [`Website server returned non-200 HTTP status code: ${statusCode}`],
    });

    const zeroScores = {
      seoScore: 0,
      performanceScore: 0,
      accessibilityScore: 0,
      uxScore: 0,
      trustScore: 0,
      conversionScore: 0,
      overallScore: 0,
    };

    return {
      summary: zeroScores,
      scoringVersion: SCORING_VERSION,
      details: {
        seo: zeroDetail("SEO"),
        performance: zeroDetail("Performance"),
        accessibility: zeroDetail("Accessibility"),
        ux: zeroDetail("UX"),
        trust: zeroDetail("Trust"),
        conversion: zeroDetail("Conversion"),
      },
    };
  }

  const seoDetails = calculateSeoScore(signals, lighthouse);
  const perfDetails = calculatePerformanceScore(lighthouse, statusCode, responseTimeMs);
  const a11yDetails = calculateAccessibilityScore(signals, lighthouse);
  const uxDetails = calculateUxScore(signals);
  const trustDetails = calculateTrustScore(signals);
  const convDetails = calculateConversionScore(signals);

  const details = {
    seo: seoDetails,
    performance: perfDetails,
    accessibility: a11yDetails,
    ux: uxDetails,
    trust: trustDetails,
    conversion: convDetails,
  };

  const summary = calculateOverallScore(details);

  return {
    summary,
    scoringVersion: SCORING_VERSION,
    details,
  };
}
