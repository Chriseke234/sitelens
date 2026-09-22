import { CategoryScores, CategoryScoreDetails } from "../types";
import { CATEGORY_WEIGHTS, SCORING_VERSION } from "./scoring-rules";

/**
 * Calculates the overall weighted audit score from category details, dynamically adjusting weights
 * if any category is unavailable.
 */
export function calculateOverallScore(details: {
  seo: CategoryScoreDetails;
  performance: CategoryScoreDetails;
  accessibility: CategoryScoreDetails;
  ux: CategoryScoreDetails;
  trust: CategoryScoreDetails;
  conversion: CategoryScoreDetails;
}): CategoryScores {
  const categoryScores: CategoryScores = {
    seoScore: details.seo.score,
    performanceScore: details.performance.score,
    accessibilityScore: details.accessibility.score,
    uxScore: details.ux.score,
    trustScore: details.trust.score,
    conversionScore: details.conversion.score,
    overallScore: null,
  };

  let totalWeightedScore = 0;
  let totalAvailableWeight = 0;

  const categories = [
    { key: "seo", detail: details.seo, weight: CATEGORY_WEIGHTS.seo },
    { key: "performance", detail: details.performance, weight: CATEGORY_WEIGHTS.performance },
    { key: "accessibility", detail: details.accessibility, weight: CATEGORY_WEIGHTS.accessibility },
    { key: "ux", detail: details.ux, weight: CATEGORY_WEIGHTS.ux },
    { key: "trust", detail: details.trust, weight: CATEGORY_WEIGHTS.trust },
    { key: "conversion", detail: details.conversion, weight: CATEGORY_WEIGHTS.conversion },
  ];

  for (const cat of categories) {
    if (cat.detail.status === "measured" && typeof cat.detail.score === "number") {
      totalWeightedScore += cat.detail.score * cat.weight;
      totalAvailableWeight += cat.weight;
    }
  }

  if (totalAvailableWeight > 0) {
    categoryScores.overallScore = Math.round(totalWeightedScore / totalAvailableWeight);
  } else {
    categoryScores.overallScore = null;
  }

  return categoryScores;
}
