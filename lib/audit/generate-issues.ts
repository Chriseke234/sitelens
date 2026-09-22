import { HTMLSignals, GeneratedIssue } from "./types";
import { runFullUXAnalysis } from "./ux";

/**
 * Converts deterministic measurements into actionable audit issues with real evidence
 */
export function generateAuditIssues(
  signals: HTMLSignals,
  statusCode: number,
  loadTimeMs: number,
  html?: string
): GeneratedIssue[] {
  const issues: GeneratedIssue[] = [];

  // Non-200 HTTP response check
  if (statusCode !== 200) {
    issues.push({
      category: "seo",
      severity: "critical",
      title: "Non-200 HTTP response code",
      description: "The website server did not return a successful 200 OK status code.",
      evidence: `Target URL returned HTTP status code ${statusCode}.`,
      recommendation: "Ensure the web server responds with a 200 OK status for legitimate requests.",
    });
    return issues;
  }

  // 1. SEO ISSUES
  if (!signals.hasTitle) {
    issues.push({
      category: "seo",
      severity: "high",
      title: "Missing page title tag",
      description: "The page does not contain a <title> HTML element.",
      evidence: "No <title> tag was found in the page header.",
      recommendation: "Add a concise, descriptive <title> tag summarizing the page contents.",
    });
  } else if (signals.titleLength < 10 || signals.titleLength > 70) {
    issues.push({
      category: "seo",
      severity: "medium",
      title: "Suboptimal title tag length",
      description: "Page title should ideally be between 30 and 60 characters for search snippet optimization.",
      evidence: `Title length is currently ${signals.titleLength} characters ("${signals.titleText.substring(0, 45)}...").`,
      recommendation: "Adjust title length to be between 30 and 60 characters.",
    });
  }

  if (!signals.hasMetaDescription) {
    issues.push({
      category: "seo",
      severity: "high",
      title: "Missing meta description tag",
      description: "The page does not contain a <meta name=\"description\"> tag.",
      evidence: "No meta description element was found in the page HTML.",
      recommendation: "Add a concise meta description summarizing the page value for search engines.",
    });
  }

  if (!signals.hasH1) {
    issues.push({
      category: "seo",
      severity: "high",
      title: "Missing H1 main heading",
      description: "The page does not contain a primary <h1> heading tag.",
      evidence: "No <h1> element was detected in the document hierarchy.",
      recommendation: "Add a single primary <h1> heading tag to establish content hierarchy.",
    });
  } else if (signals.h1Count > 1) {
    issues.push({
      category: "seo",
      severity: "medium",
      title: "Multiple H1 headings detected",
      description: "Pages should ideally contain only one primary <h1> heading tag.",
      evidence: `Page contains ${signals.h1Count} separate <h1> tags.`,
      recommendation: "Consolidate your main page title into a single <h1> and use <h2>/<h3> tags for sub-sections.",
    });
  }

  if (!signals.hasCanonical) {
    issues.push({
      category: "seo",
      severity: "low",
      title: "Missing canonical URL link tag",
      description: "Canonical tags prevent duplicate content issues across search engines.",
      evidence: "No <link rel=\"canonical\"> tag was found.",
      recommendation: "Add a canonical URL tag pointing to the authoritative URL of this page.",
    });
  }

  // 2. ACCESSIBILITY ISSUES
  if (!signals.htmlLang) {
    issues.push({
      category: "accessibility",
      severity: "high",
      title: "Missing document language attribute",
      description: "The <html> tag does not specify a lang attribute.",
      evidence: "HTML tag is missing the lang attribute (e.g. <html lang=\"en\">).",
      recommendation: "Add an explicit lang attribute to the <html> tag to support screen readers.",
    });
  }

  if (signals.imagesMissingAltCount > 0) {
    issues.push({
      category: "accessibility",
      severity: "high",
      title: "Images missing alt text attributes",
      description: "Screen readers rely on alt text attributes to describe visual images.",
      evidence: `${signals.imagesMissingAltCount} out of ${signals.totalImageCount} image(s) on the page are missing alt text attributes.`,
      recommendation: "Add descriptive alt attributes to all non-decorative <img> tags.",
    });
  }

  if (signals.hasEmptyButtonsOrLinks) {
    issues.push({
      category: "accessibility",
      severity: "medium",
      title: "Buttons or links missing accessible names",
      description: "Interactive elements must have visible text or an aria-label.",
      evidence: "One or more <a> or <button> tags contain no text, aria-label, or title attributes.",
      recommendation: "Ensure all buttons and link elements contain descriptive inner text or aria-label attributes.",
    });
  }

  // 3. PERFORMANCE ISSUES
  if (loadTimeMs > 2500) {
    issues.push({
      category: "performance",
      severity: loadTimeMs > 4000 ? "high" : "medium",
      title: "Slow server response time",
      description: "Initial page document response time exceeds 2.5 seconds.",
      evidence: `Server HTML response time was ${loadTimeMs}ms.`,
      recommendation: "Optimize server-side response times, database queries, and caching headers.",
    });
  }

  // 4. TRUST ISSUES
  if (!signals.isHttps) {
    issues.push({
      category: "trust",
      severity: "critical",
      title: "Website not using secure HTTPS connection",
      description: "HTTP connections expose user data to interception and trigger browser security warnings.",
      evidence: "URL uses unencrypted HTTP protocol instead of HTTPS.",
      recommendation: "Migrate website to HTTPS and enforce SSL redirection across all pages.",
    });
  }

  if (!signals.hasPrivacyLink) {
    issues.push({
      category: "trust",
      severity: "medium",
      title: "Missing privacy policy link",
      description: "Privacy links establish credibility and comply with privacy regulations.",
      evidence: "No link containing 'privacy' was detected in page navigation or footer links.",
      recommendation: "Add a visible Privacy Policy link to your website footer.",
    });
  }

  if (!signals.hasContactLink && !signals.hasMailtoLinks && !signals.hasTelLinks) {
    issues.push({
      category: "trust",
      severity: "medium",
      title: "Missing contact information or link",
      description: "Visitors need straightforward channels to reach customer support or sales.",
      evidence: "No link containing 'contact', phone number (tel:), or email (mailto:) was detected.",
      recommendation: "Add clear contact information or a dedicated Contact page link.",
    });
  }

  // 5. UX & CONVERSION ISSUES (Integrated from UX Engine)
  if (html) {
    const uxAnalysis = runFullUXAnalysis(html, signals);
    // Deduplicate and append issues derived from UX Engine
    for (const uxIssue of uxAnalysis.issues) {
      if (!issues.some((existing) => existing.title === uxIssue.title)) {
        issues.push(uxIssue);
      }
    }
  }

  return issues;
}
