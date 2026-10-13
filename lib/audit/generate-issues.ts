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
      title: "Website Server Is Not Responding Properly",
      description: "When potential customers or search engines visit your website, the server returns an error code instead of loading your page. Visitors likely see an error screen or blank page, which immediately drives traffic away.",
      evidence: `The web server returned HTTP status code ${statusCode} instead of the expected 200 (Success).`,
      recommendation: "Check your website hosting provider, DNS setup, and domain routing to ensure your site loads normally for all visitors.",
    });
    return issues;
  }

  // 1. SEO ISSUES
  if (!signals.hasTitle) {
    issues.push({
      category: "seo",
      severity: "high",
      title: "Missing Page Title in Search Results",
      description: "Your page does not have a title tag. Search engines like Google use this title as the main clickable headline in search results. Without it, Google cannot describe your business accurately and your search ranking will drop.",
      evidence: "No <title> HTML tag was found in the page header.",
      recommendation: "Add a clear, catchy title (30–60 characters) summarizing what your business offers so customers recognize your site in Google search.",
    });
  } else if (signals.titleLength < 10 || signals.titleLength > 70) {
    issues.push({
      category: "seo",
      severity: "medium",
      title: "Page Title Needs Length Adjustment",
      description: `Your headline title is currently ${signals.titleLength} characters. Titles that are too short fail to tell customers what you do, while titles over 60 characters get abruptly cut off with '...' in Google search results.`,
      evidence: `Current page title has ${signals.titleLength} characters: "${signals.titleText.substring(0, 45)}...". Ideal range is 30 to 60 characters.`,
      recommendation: "Keep your page title between 30 and 60 characters so the full name and value proposition are cleanly readable on search results.",
    });
  }

  if (!signals.hasMetaDescription) {
    issues.push({
      category: "seo",
      severity: "high",
      title: "Missing Search Summary (Meta Description)",
      description: "Your page lacks a summary snippet for search engines. When your website appears on Google, visitors normally read this 1-2 sentence preview to decide whether to click your link.",
      evidence: "No meta description tag was found in the page header.",
      recommendation: "Write an engaging 1–2 sentence summary (about 120–155 characters) explaining why customers should choose your service.",
    });
  }

  if (!signals.hasH1) {
    issues.push({
      category: "seo",
      severity: "high",
      title: "Missing Main Headline on Page",
      description: "When people arrive on your page, there is no primary heading (H1) that immediately tells them what your website is about. Visitors might feel confused about what you offer within the first 3 seconds.",
      evidence: "No primary <h1> headline tag detected in the page content.",
      recommendation: "Add a prominent main headline at the top of your page clearly stating what your product or service provides.",
    });
  } else if (signals.h1Count > 1) {
    issues.push({
      category: "seo",
      severity: "medium",
      title: "Multiple Competing Main Headlines",
      description: "Your website contains more than one main headline tag. This can confuse search engine crawlers and website readers about what the primary focus of the page is.",
      evidence: `Page contains ${signals.h1Count} primary <h1> heading tags.`,
      recommendation: "Keep one single main headline at the top of the page, and change any secondary section titles to subheadings (H2 or H3).",
    });
  }

  if (!signals.hasCanonical) {
    issues.push({
      category: "seo",
      severity: "low",
      title: "Missing Preferred Address Tag (Canonical Link)",
      description: "Search engines might see duplicate copies of your website (e.g. 'http://', 'https://', or '?ref=' variations) and split your search authority instead of focusing on your main URL.",
      evidence: "No canonical link (<link rel='canonical'>) found in page header.",
      recommendation: "Add a canonical URL tag so search engines know which address is your official primary link.",
    });
  }

  // 2. ACCESSIBILITY ISSUES
  if (!signals.htmlLang) {
    issues.push({
      category: "accessibility",
      severity: "high",
      title: "Missing Language Setting for Screen Readers",
      description: "The website does not declare which language it is written in. Assistive tools and speech synthesizers used by visually impaired visitors cannot automatically select the right pronunciation.",
      evidence: "The top-level <html> tag is missing the 'lang' attribute (e.g., lang='en').",
      recommendation: "Specify your site's primary language (e.g. lang='en') so translation software and screen reading tools work seamlessly.",
    });
  }

  if (signals.imagesMissingAltCount > 0) {
    issues.push({
      category: "accessibility",
      severity: "high",
      title: "Images Missing Descriptions for Visually Impaired Visitors",
      description: `${signals.imagesMissingAltCount} image(s) on your website do not have text descriptions. People using screen-reading software will only hear 'image' with zero context, and search engines won't understand what the images show.`,
      evidence: `${signals.imagesMissingAltCount} out of ${signals.totalImageCount} image(s) lack an 'alt' text description attribute.`,
      recommendation: "Add a short, descriptive sentence or label to each image explaining what is shown in the picture.",
    });
  }

  if (signals.hasEmptyButtonsOrLinks) {
    issues.push({
      category: "accessibility",
      severity: "medium",
      title: "Buttons or Clickable Links Without Visible Names",
      description: "Some buttons or links on your site do not contain text or accessibility labels (often icon-only buttons). Visitors relying on assistive tools won't know where the button leads or what clicking it does.",
      evidence: "Clickable elements (<button> or <a>) were found with no readable label, text, or title.",
      recommendation: "Add clear labels or aria-label text to every button (e.g. 'Open Search', 'Close Menu') so its purpose is immediately clear.",
    });
  }

  // 3. PERFORMANCE ISSUES
  if (loadTimeMs > 2500) {
    issues.push({
      category: "performance",
      severity: loadTimeMs > 4000 ? "high" : "medium",
      title: "Website Takes Too Long to Start Loading",
      description: `Your server took ${(loadTimeMs / 1000).toFixed(1)} seconds just to send the first piece of page data. Research shows that more than half of mobile visitors abandon a website if it takes longer than 3 seconds to respond.`,
      evidence: `Initial server response time was ${loadTimeMs}ms (optimal threshold is under 800ms).`,
      recommendation: "Upgrade server hosting, enable page caching, or optimize database queries to make your site feel instant for visitors.",
    });
  }

  // 4. TRUST ISSUES
  if (!signals.isHttps) {
    issues.push({
      category: "trust",
      severity: "critical",
      title: "Connection Is Not Secure (Missing HTTPS / SSL)",
      description: "Your website is using an unencrypted connection. Modern browsers like Chrome and Safari will display a scary 'Not Secure' warning to visitors, severely hurting credibility and customer conversions.",
      evidence: "The website uses plain 'http://' instead of encrypted 'https://'.",
      recommendation: "Install an SSL security certificate and enable automatic HTTPS redirection for all website traffic.",
    });
  }

  if (!signals.hasPrivacyLink) {
    issues.push({
      category: "trust",
      severity: "medium",
      title: "No Visible Privacy Policy Found",
      description: "Prospective customers and modern advertising platforms look for a privacy policy to verify that your company is reputable and respects user data. Missing this hurts buyer trust.",
      evidence: "No link mentioning 'Privacy' was detected in the website navigation or footer.",
      recommendation: "Place a visible Privacy Policy link in your website footer to reassure customers and comply with standard regulations.",
    });
  }

  if (!signals.hasContactLink && !signals.hasMailtoLinks && !signals.hasTelLinks) {
    issues.push({
      category: "trust",
      severity: "medium",
      title: "Hard for Customers to Find Contact Details",
      description: "Visitors have no obvious way to reach out for sales inquiries or customer support. When contact details are hidden or missing, potential buyers often hesitate and leave without purchasing.",
      evidence: "No phone number, email address, or dedicated 'Contact' link was detected on the page.",
      recommendation: "Add clear contact information (such as an email, support form, or phone link) in your header or footer.",
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
