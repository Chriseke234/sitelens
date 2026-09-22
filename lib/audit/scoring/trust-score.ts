import { HTMLSignals, CategoryScoreDetails } from "../types";

/**
 * Calculates Trust Score deterministically from verifiable trust & security signals
 */
export function calculateTrustScore(signals: HTMLSignals): CategoryScoreDetails {
  let score = 100;
  const majorDeductions: string[] = [];
  const availableEvidence: string[] = [];

  const measurableInputs: Record<string, string | number | boolean | null> = {
    isHttps: signals.isHttps,
    hasPrivacyLink: signals.hasPrivacyLink,
    hasTermsLink: signals.hasTermsLink,
    hasContactLink: signals.hasContactLink,
    hasAboutLink: signals.hasAboutLink ?? false,
    hasMailtoOrTel: signals.hasMailtoLinks || signals.hasTelLinks,
    hasFooterElement: signals.hasFooterElement,
  };

  // 1. HTTPS Security
  if (!signals.isHttps) {
    score -= 40;
    majorDeductions.push("Website is served over unencrypted HTTP (-40 pts)");
  } else {
    availableEvidence.push("Website secured with HTTPS SSL/TLS encryption");
  }

  // 2. Privacy Policy Link
  if (!signals.hasPrivacyLink) {
    score -= 20;
    majorDeductions.push("No Privacy Policy link detected on the page (-20 pts)");
  } else {
    availableEvidence.push("Privacy Policy link detected");
  }

  // 3. Terms of Service Link
  if (!signals.hasTermsLink) {
    score -= 10;
    majorDeductions.push("No Terms of Service link detected (-10 pts)");
  } else {
    availableEvidence.push("Terms of Service / Terms & Conditions link detected");
  }

  // 4. Contact Pathway
  const hasDirectContact = signals.hasContactLink || signals.hasMailtoLinks || signals.hasTelLinks;
  if (!hasDirectContact) {
    score -= 15;
    majorDeductions.push("No obvious Contact link, mailto email, or tel phone number detected (-15 pts)");
  } else {
    const methods: string[] = [];
    if (signals.hasContactLink) methods.push("Contact link");
    if (signals.hasMailtoLinks) methods.push("Email link (mailto:)");
    if (signals.hasTelLinks) methods.push("Phone link (tel:)");
    availableEvidence.push(`Contact pathways detected: ${methods.join(", ")}`);
  }

  // 5. About Page / Business Information Signal
  if (signals.hasAboutLink) {
    availableEvidence.push("About Us / Company profile link detected");
  } else {
    availableEvidence.push("No explicit About Us page link detected (Signal observation)");
  }

  // 6. Semantic Footer
  if (!signals.hasFooterElement) {
    score -= 5;
    majorDeductions.push("No semantic <footer> container detected (-5 pts)");
  } else {
    availableEvidence.push("Semantic page footer present");
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
