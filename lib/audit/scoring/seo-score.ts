import { HTMLSignals, LighthouseMetrics, CategoryScoreDetails } from "../types";

/**
 * Calculates SEO Score deterministically with full explanation
 */
export function calculateSeoScore(
  signals: HTMLSignals,
  lighthouse: LighthouseMetrics
): CategoryScoreDetails {
  let score = 100;
  const majorDeductions: string[] = [];
  const availableEvidence: string[] = [];

  const measurableInputs: Record<string, string | number | boolean | null> = {
    titleExists: signals.hasTitle,
    titleLength: signals.titleLength,
    metaDescriptionExists: signals.hasMetaDescription,
    metaDescriptionLength: signals.metaDescriptionLength,
    canonicalExists: signals.hasCanonical,
    h1Count: signals.h1Count,
    headingStructureValid: signals.headingHierarchyValid ?? true,
    viewportExists: signals.hasViewport,
    robotsDirective: signals.robotsDirective || "None",
    imageAltCoveragePct:
      signals.totalImageCount > 0
        ? Math.round(
            ((signals.totalImageCount - signals.imagesMissingAltCount) /
              signals.totalImageCount) *
              100
          )
        : 100,
    hasInternalLinks: (signals.internalLinkCount ?? signals.totalLinkCount) > 0,
    hasStructuredData: signals.hasStructuredData,
    isHttps: signals.isHttps,
    lighthouseSeoScore: lighthouse.available ? lighthouse.seoScore ?? null : null,
  };

  // Title checks
  if (!signals.hasTitle) {
    score -= 25;
    majorDeductions.push("Missing <title> tag (-25 pts)");
  } else {
    availableEvidence.push(`Title found: "${signals.titleText}" (${signals.titleLength} chars)`);
    if (signals.titleLength < 30 || signals.titleLength > 60) {
      score -= 5;
      majorDeductions.push(`Title length is non-optimal (${signals.titleLength} chars, target 30–60) (-5 pts)`);
    }
  }

  // Meta description checks
  if (!signals.hasMetaDescription) {
    score -= 20;
    majorDeductions.push("Missing meta description (-20 pts)");
  } else {
    availableEvidence.push(`Meta description found (${signals.metaDescriptionLength} chars)`);
    if (signals.metaDescriptionLength < 120 || signals.metaDescriptionLength > 160) {
      score -= 5;
      majorDeductions.push(`Meta description length is non-optimal (${signals.metaDescriptionLength} chars, target 120–160) (-5 pts)`);
    }
  }

  // Heading checks
  if (!signals.hasH1) {
    score -= 15;
    majorDeductions.push("No <h1> heading detected on the page (-15 pts)");
  } else if (signals.h1Count > 1) {
    score -= 10;
    majorDeductions.push(`Multiple <h1> headings detected (${signals.h1Count} found) (-10 pts)`);
    availableEvidence.push(`Primary H1: "${signals.h1Text}"`);
  } else {
    availableEvidence.push(`Single H1 found: "${signals.h1Text}"`);
  }

  // Viewport & Mobile Indexing
  if (!signals.hasViewport) {
    score -= 15;
    majorDeductions.push("Missing mobile viewport meta tag (-15 pts)");
  }

  // Image alt coverage
  if (signals.totalImageCount > 0 && signals.imagesMissingAltCount > 0) {
    const missingPct = Math.round((signals.imagesMissingAltCount / signals.totalImageCount) * 100);
    const deduction = Math.min(15, Math.ceil(missingPct / 10));
    score -= deduction;
    majorDeductions.push(`${signals.imagesMissingAltCount} of ${signals.totalImageCount} images missing alt attributes (-${deduction} pts)`);
  } else if (signals.totalImageCount > 0) {
    availableEvidence.push(`All ${signals.totalImageCount} images include alt text`);
  }

  // Canonical tag
  if (signals.hasCanonical) {
    availableEvidence.push(`Canonical URL present: ${signals.canonicalUrl}`);
  } else {
    score -= 5;
    majorDeductions.push("Missing canonical link tag (-5 pts)");
  }

  // Structured Data signal
  if (signals.hasStructuredData) {
    availableEvidence.push("Structured data (JSON-LD) detected");
  } else {
    availableEvidence.push("No JSON-LD structured data detected (Signal observation)");
  }

  // Integrate Lighthouse SEO score if available
  if (lighthouse.available && typeof lighthouse.seoScore === "number") {
    availableEvidence.push(`Lighthouse SEO score: ${lighthouse.seoScore}/100`);
    score = Math.round(score * 0.5 + lighthouse.seoScore * 0.5);
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
