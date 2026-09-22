import { HTMLSignals, CategoryScoreDetails } from "../types";

/**
 * Calculates Conversion Score deterministically from action pathways & conversion signals
 */
export function calculateConversionScore(signals: HTMLSignals): CategoryScoreDetails {
  let score = 100;
  const majorDeductions: string[] = [];
  const availableEvidence: string[] = [];

  const detectedCTAWords = signals.detectedCTAWords || [];

  const measurableInputs: Record<string, string | number | boolean | null> = {
    formCount: signals.formCount,
    hasSignupForm: signals.hasSignupForm ?? false,
    hasContactForm: signals.hasContactForm ?? false,
    hasCallToActionLinks: signals.hasCallToActionLinks,
    detectedCTAWordsCount: detectedCTAWords.length,
    hasMailtoLinks: signals.hasMailtoLinks,
    hasTelLinks: signals.hasTelLinks,
    hasWhatsAppLink: signals.hasWhatsAppLink ?? false,
  };

  let conversionPathwaysCount = 0;

  // 1. Interactive Form Pathways
  if (signals.formCount > 0) {
    conversionPathwaysCount++;
    availableEvidence.push(`${signals.formCount} interactive form(s) detected on page`);
  } else {
    score -= 20;
    majorDeductions.push("No interactive forms (contact, lead, or signup) detected on page (-20 pts)");
  }

  // 2. Action Language / CTA Buttons
  if (signals.hasCallToActionLinks) {
    conversionPathwaysCount++;
    if (detectedCTAWords.length > 0) {
      availableEvidence.push(`CTA action language detected: "${detectedCTAWords.slice(0, 4).join('", "')}"`);
    } else {
      availableEvidence.push("Action-oriented links/buttons detected");
    }
  } else {
    score -= 25;
    majorDeductions.push("No clear Call-To-Action (CTA) link or button text detected (-25 pts)");
  }

  // 3. Direct Contact Pathways (Phone, Email, WhatsApp)
  const directPathways: string[] = [];
  if (signals.hasMailtoLinks) directPathways.push("Direct email (mailto:)");
  if (signals.hasTelLinks) directPathways.push("Direct phone (tel:)");
  if (signals.hasWhatsAppLink) directPathways.push("WhatsApp chat link");

  if (directPathways.length > 0) {
    conversionPathwaysCount++;
    availableEvidence.push(`Direct contact pathways: ${directPathways.join(", ")}`);
  } else {
    score -= 15;
    majorDeductions.push("No direct communication links (phone tel:, email mailto:, or messaging) detected (-15 pts)");
  }

  // General conversion pathway assessment
  if (conversionPathwaysCount === 0) {
    score -= 20;
    majorDeductions.push("No obvious conversion or response pathway detected on the analyzed page (-20 pts)");
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
