import { HTMLSignals, CategoryScoreDetails } from "../types";

/**
 * Calculates UX Score deterministically from measurable page signals
 */
export function calculateUxScore(signals: HTMLSignals): CategoryScoreDetails {
  let score = 100;
  const majorDeductions: string[] = [];
  const availableEvidence: string[] = [];

  const measurableInputs: Record<string, string | number | boolean | null> = {
    hasNavElement: signals.hasNavElement,
    hasMainElement: signals.hasMainElement,
    hasFooterElement: signals.hasFooterElement,
    hasH1Heading: signals.hasH1,
    h1Count: signals.h1Count,
    totalHeadings: signals.totalHeadingCount,
    hasViewport: signals.hasViewport,
    textContentLength: signals.textContentLength,
    hasEmptyButtonsOrLinks: signals.hasEmptyButtonsOrLinks,
    hasCallToAction: signals.hasCallToActionLinks,
    hasContactPathway: signals.hasContactLink || signals.hasMailtoLinks || signals.hasTelLinks,
  };

  // Structural Navigation
  if (!signals.hasNavElement) {
    score -= 15;
    majorDeductions.push("No semantic <nav> or navigation landmark element detected (-15 pts)");
  } else {
    availableEvidence.push("Semantic navigation structure detected");
  }

  // Main Content Structure
  if (!signals.hasMainElement) {
    score -= 10;
    majorDeductions.push("No semantic <main> content landmark detected (-10 pts)");
  } else {
    availableEvidence.push("Semantic <main> content container present");
  }

  // Heading Clarity & Hierarchy
  if (!signals.hasH1) {
    score -= 15;
    majorDeductions.push("No primary <h1> heading to establish page topic hierarchy (-15 pts)");
  } else if (signals.h1Count > 1) {
    score -= 5;
    majorDeductions.push(`Multiple <h1> headings (${signals.h1Count}) may dilute primary topic clarity (-5 pts)`);
  } else {
    availableEvidence.push(`Primary page heading: "${signals.h1Text}"`);
  }

  // Text Content Volume
  if (signals.textContentLength < 100) {
    score -= 25;
    majorDeductions.push(`Extremely sparse page text content (${signals.textContentLength} chars) (-25 pts)`);
  } else if (signals.textContentLength < 300) {
    score -= 10;
    majorDeductions.push(`Thin text content detected (${signals.textContentLength} chars) (-10 pts)`);
  } else {
    availableEvidence.push(`Sufficient textual content detected (${signals.textContentLength} characters)`);
  }

  // Interactive Naming / Usability
  if (signals.hasEmptyButtonsOrLinks) {
    score -= 10;
    majorDeductions.push("Interactive buttons/links detected lacking clear label or text (-10 pts)");
  }

  // Action / Contact Pathway Clarity
  if (!signals.hasCallToActionLinks) {
    score -= 10;
    majorDeductions.push("No obvious action button or Call-To-Action link language detected (-10 pts)");
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
