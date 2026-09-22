import { HTMLSignals, LighthouseMetrics, CategoryScoreDetails } from "../types";

/**
 * Calculates Accessibility Score deterministically from basic automated accessibility checks
 */
export function calculateAccessibilityScore(
  signals: HTMLSignals,
  lighthouse: LighthouseMetrics
): CategoryScoreDetails {
  let score = 100;
  const majorDeductions: string[] = [];
  const availableEvidence: string[] = [];

  const measurableInputs: Record<string, string | number | boolean | null> = {
    hasHtmlLang: signals.htmlLang.length > 0,
    htmlLangValue: signals.htmlLang || null,
    imagesMissingAltCount: signals.imagesMissingAltCount,
    totalImageCount: signals.totalImageCount,
    hasTitleTag: signals.hasTitle,
    hasEmptyButtonsOrLinks: signals.hasEmptyButtonsOrLinks,
    missingFormLabelsCount: signals.missingFormLabelsCount ?? 0,
    duplicateIdCount: signals.duplicateIdCount ?? 0,
    hasViewport: signals.hasViewport,
    lighthouseAccessibilityScore: lighthouse.available ? lighthouse.accessibilityScore ?? null : null,
  };

  // Missing lang attribute
  if (!signals.htmlLang) {
    score -= 20;
    majorDeductions.push("Missing lang attribute on <html> element (-20 pts)");
  } else {
    availableEvidence.push(`Document language specified: "${signals.htmlLang}"`);
  }

  // Missing title tag
  if (!signals.hasTitle) {
    score -= 15;
    majorDeductions.push("Missing document <title> tag (-15 pts)");
  }

  // Missing image alt attributes
  if (signals.imagesMissingAltCount > 0) {
    const deduction = Math.min(25, signals.imagesMissingAltCount * 5);
    score -= deduction;
    majorDeductions.push(`${signals.imagesMissingAltCount} image(s) missing alt attributes (-${deduction} pts)`);
  } else if (signals.totalImageCount > 0) {
    availableEvidence.push("All images contain non-empty alt text");
  }

  // Buttons or links lacking visible text or accessible labels
  if (signals.hasEmptyButtonsOrLinks) {
    score -= 15;
    majorDeductions.push("Buttons or links detected without visible text or aria-label (-15 pts)");
  } else {
    availableEvidence.push("All interactive elements have accessible names");
  }

  // Form input labels check
  if ((signals.missingFormLabelsCount ?? 0) > 0) {
    const deduction = Math.min(15, (signals.missingFormLabelsCount ?? 0) * 5);
    score -= deduction;
    majorDeductions.push(`${signals.missingFormLabelsCount} form input(s) appear to lack explicit associated labels (-${deduction} pts)`);
  }

  // Viewport accessibility check
  if (!signals.hasViewport) {
    score -= 10;
    majorDeductions.push("Viewport meta tag missing or limiting zoom accessibility (-10 pts)");
  }

  // Integrate Lighthouse accessibility score if available
  if (lighthouse.available && typeof lighthouse.accessibilityScore === "number") {
    availableEvidence.push(`Lighthouse Automated Accessibility Score: ${lighthouse.accessibilityScore}/100`);
    score = Math.round(score * 0.4 + lighthouse.accessibilityScore * 0.6);
  } else {
    availableEvidence.push("Evaluated using basic automated HTML accessibility checks");
  }

  const finalScore = Math.max(0, Math.min(100, score));

  return {
    score: finalScore,
    status: "measured",
    measurableInputs,
    majorDeductions,
    availableEvidence,
  };
}
