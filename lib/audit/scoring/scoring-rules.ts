/**
 * SiteLens Scoring Rules & Configuration
 * Scoring Version: v1
 */

export const SCORING_VERSION = "v1";

export const CATEGORY_WEIGHTS = {
  seo: 0.20,
  performance: 0.20,
  accessibility: 0.15,
  ux: 0.15,
  trust: 0.15,
  conversion: 0.15,
};

export type CategoryKey = keyof typeof CATEGORY_WEIGHTS;
