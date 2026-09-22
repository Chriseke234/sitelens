import { LighthouseMetrics, CategoryScoreDetails } from "../types";

/**
 * Calculates Performance Score deterministically from Lighthouse metrics or HTTP response speed
 */
export function calculatePerformanceScore(
  lighthouse: LighthouseMetrics,
  statusCode: number,
  responseTimeMs: number
): CategoryScoreDetails {
  const majorDeductions: string[] = [];
  const availableEvidence: string[] = [];

  const measurableInputs: Record<string, string | number | boolean | null> = {
    statusCode,
    responseTimeMs,
    lighthouseAvailable: lighthouse.available,
    performanceScore: lighthouse.performanceScore ?? null,
    largestContentfulPaintMs: lighthouse.largestContentfulPaintMs ?? null,
    cumulativeLayoutShift: lighthouse.cumulativeLayoutShift ?? null,
    totalBlockingTimeMs: lighthouse.totalBlockingTimeMs ?? null,
    firstContentfulPaintMs: lighthouse.firstContentfulPaintMs ?? null,
    speedIndexMs: lighthouse.speedIndexMs ?? null,
  };

  // Status check for non-200
  if (statusCode < 200 || statusCode >= 400) {
    return {
      score: 0,
      status: "measured",
      measurableInputs,
      majorDeductions: [`HTTP status ${statusCode} returned`],
      availableEvidence: [`Server responded with status code ${statusCode}`],
    };
  }

  // If Lighthouse is available, use exact Lighthouse performance score
  if (lighthouse.available && typeof lighthouse.performanceScore === "number") {
    availableEvidence.push(`Lighthouse Performance Score: ${lighthouse.performanceScore}/100`);

    if (lighthouse.largestContentfulPaintMs != null) {
      availableEvidence.push(`Largest Contentful Paint (LCP): ${(lighthouse.largestContentfulPaintMs / 1000).toFixed(2)}s`);
      if (lighthouse.largestContentfulPaintMs > 2500) {
        majorDeductions.push(`LCP exceeds 2.5s benchmark (${(lighthouse.largestContentfulPaintMs / 1000).toFixed(2)}s)`);
      }
    }

    if (lighthouse.cumulativeLayoutShift != null) {
      availableEvidence.push(`Cumulative Layout Shift (CLS): ${lighthouse.cumulativeLayoutShift.toFixed(3)}`);
      if (lighthouse.cumulativeLayoutShift > 0.1) {
        majorDeductions.push(`CLS exceeds 0.1 benchmark (${lighthouse.cumulativeLayoutShift.toFixed(3)})`);
      }
    }

    if (lighthouse.totalBlockingTimeMs != null) {
      availableEvidence.push(`Total Blocking Time (TBT): ${lighthouse.totalBlockingTimeMs}ms`);
      if (lighthouse.totalBlockingTimeMs > 200) {
        majorDeductions.push(`TBT exceeds 200ms benchmark (${lighthouse.totalBlockingTimeMs}ms)`);
      }
    }

    if (lighthouse.firstContentfulPaintMs != null) {
      availableEvidence.push(`First Contentful Paint (FCP): ${(lighthouse.firstContentfulPaintMs / 1000).toFixed(2)}s`);
    }

    if (lighthouse.speedIndexMs != null) {
      availableEvidence.push(`Speed Index: ${(lighthouse.speedIndexMs / 1000).toFixed(2)}s`);
    }

    return {
      score: lighthouse.performanceScore,
      status: "measured",
      measurableInputs,
      majorDeductions,
      availableEvidence,
    };
  }

  // Fallback speed calculation based on initial HTTP response time
  let score = 100;
  availableEvidence.push(`Initial response time: ${responseTimeMs}ms (Lighthouse execution unavailable)`);

  if (responseTimeMs > 3000) {
    score -= 40;
    majorDeductions.push(`Response time is slow (${responseTimeMs}ms > 3000ms limit) (-40 pts)`);
  } else if (responseTimeMs > 1500) {
    score -= 20;
    majorDeductions.push(`Response time is moderate (${responseTimeMs}ms > 1500ms limit) (-20 pts)`);
  } else if (responseTimeMs > 800) {
    score -= 10;
    majorDeductions.push(`Response time slightly elevated (${responseTimeMs}ms > 800ms) (-10 pts)`);
  }

  return {
    score: Math.max(0, score),
    status: "measured",
    measurableInputs,
    majorDeductions,
    availableEvidence,
  };
}
