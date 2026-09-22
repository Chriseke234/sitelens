import { HTMLSignals, LighthouseMetrics, CategoryScores, DetailedScores } from "./types";
import { calculateAllScores } from "./scoring";

/**
 * Calculates detailed scores and explanations across all categories
 */
export function calculateDetailedScores(
  signals: HTMLSignals,
  lighthouse: LighthouseMetrics,
  statusCode: number,
  loadTimeMs: number
): DetailedScores {
  return calculateAllScores(signals, lighthouse, statusCode, loadTimeMs);
}

/**
 * Legacy/Convenience entry point for overall & category score calculation
 */
export function calculateCategoryScores(
  signals: HTMLSignals,
  lighthouse: LighthouseMetrics,
  statusCode: number,
  loadTimeMs: number
): CategoryScores {
  const detailed = calculateAllScores(signals, lighthouse, statusCode, loadTimeMs);
  return detailed.summary;
}
