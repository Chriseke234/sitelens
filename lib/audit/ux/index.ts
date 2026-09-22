import * as cheerio from "cheerio";
import { HTMLSignals, LighthouseMetrics, GeneratedIssue, UXOpportunity } from "../types";
import { analyzeNavigation, NavigationAnalysisResult } from "./analyze-navigation";
import { analyzeContent, ContentAnalysisResult } from "./analyze-content";
import { analyzeCTA, CTAAnalysisResult } from "./analyze-cta";
import { analyzeForms, FormAnalysisResult } from "./analyze-forms";
import { analyzeMobile, MobileAnalysisResult } from "./analyze-mobile";

export * from "./analyze-navigation";
export * from "./analyze-content";
export * from "./analyze-cta";
export * from "./analyze-forms";
export * from "./analyze-mobile";

export interface CompleteUXAnalysis {
  navigation: NavigationAnalysisResult;
  content: ContentAnalysisResult;
  cta: CTAAnalysisResult;
  forms: FormAnalysisResult;
  mobile: MobileAnalysisResult;
  issues: GeneratedIssue[];
  opportunities: UXOpportunity[];
}

export function runFullUXAnalysis(
  html: string,
  signals: HTMLSignals,
  lighthouse?: LighthouseMetrics
): CompleteUXAnalysis {
  const $ = cheerio.load(html);

  const navigation = analyzeNavigation($);
  const content = analyzeContent($, html.length);
  const cta = analyzeCTA($);
  const forms = analyzeForms($);
  const mobile = analyzeMobile($, html, lighthouse);

  const issues: GeneratedIssue[] = [];
  const opportunities: UXOpportunity[] = [];

  // 1. Navigation Issues & Opportunities
  if (!navigation.hasNavElement) {
    issues.push({
      category: "ux",
      severity: "medium",
      title: "No semantic navigation element detected",
      description: "The page lacks a semantic <nav> or role='navigation' landmark element to assist user navigation.",
      evidence: "No <nav> element found in page document.",
      recommendation: "Wrap major site navigation links in a semantic <nav> element.",
    });
  }

  if (navigation.emptyNavLinkCount > 0) {
    issues.push({
      category: "ux",
      severity: "medium",
      title: "Empty or unlabeled navigation link(s) detected",
      description: `${navigation.emptyNavLinkCount} link(s) in navigation lack readable text or aria-labels.`,
      evidence: `${navigation.emptyNavLinkCount} empty <a> element(s) in header/nav.`,
      recommendation: "Provide clear text labels or descriptive aria-label attributes for all navigation links.",
    });
  }

  // 2. Heading & Content Structure Issues & Opportunities
  if (!signals.hasH1) {
    issues.push({
      category: "ux",
      severity: "high",
      title: "No primary heading detected",
      description: "The page does not feature an <h1> heading, making it harder for visitors to immediately understand page purpose.",
      evidence: "0 <h1> elements detected in HTML.",
      recommendation: "Add a clear, descriptive <h1> heading summarizing the main value proposition or page title.",
    });
  } else if (signals.h1Count > 1) {
    issues.push({
      category: "ux",
      severity: "medium",
      title: "Multiple primary headings detected",
      description: `Found ${signals.h1Count} <h1> headings on the page, which can dilute content hierarchy.`,
      evidence: `${signals.h1Count} <h1> headings found (First: "${signals.h1Text}").`,
      recommendation: "Use a single <h1> for the primary page header and <h2>-<h6> for sub-sections.",
    });
  }

  // 3. CTA & Conversion Issues & Opportunities
  if (!cta.hasPrimaryCTA) {
    issues.push({
      category: "conversion",
      severity: "high",
      title: "No obvious action element detected",
      description: "No prominent Call-To-Action buttons or links with explicit action language (e.g. 'Get started', 'Contact us', 'Book') were found.",
      evidence: "No CTA buttons/links matching standard conversion keywords.",
      recommendation: "Add a clear primary Call-To-Action button above the fold guiding visitors to take action.",
    });
  } else if (cta.ctaCount === 1) {
    opportunities.push({
      category: "conversion",
      observation: `Primary CTA detected: "${cta.ctaElements[0]?.text}".`,
      opportunity: "Consider secondary conversion pathways (such as direct email or chat) for visitors who are not ready for the primary CTA.",
      evidence: `Single primary action element found: "${cta.ctaElements[0]?.text}".`,
    });
  }

  // 4. Form Issues & Opportunities
  if (forms.totalUnlabeledInputs > 0) {
    issues.push({
      category: "ux",
      severity: "high",
      title: "Form input appears to lack an associated label",
      description: `${forms.totalUnlabeledInputs} input field(s) lack associated <label> elements or accessible names.`,
      evidence: `${forms.totalUnlabeledInputs} unlabeled form input(s) detected.`,
      recommendation: "Associate each input with an explicit <label for='input-id'> tag or aria-label attribute.",
    });
  }

  if (forms.hasContactForm) {
    opportunities.push({
      category: "conversion",
      observation: "An interactive contact or lead generation form is present on the page.",
      opportunity: "Ensure the form asks for minimal required fields to reduce friction for prospective leads.",
      evidence: `Form with ${forms.forms[0]?.fieldCount || 0} fields detected.`,
    });
  } else if (signals.hasContactLink) {
    opportunities.push({
      category: "conversion",
      observation: "A contact page link exists in navigation or body text.",
      opportunity: "Make the primary contact action easier to discover directly from the homepage above the fold.",
      evidence: "Contact page link detected without inline contact form.",
    });
  }

  // 5. Mobile Readiness Issues
  if (!mobile.hasViewportTag) {
    issues.push({
      category: "ux",
      severity: "critical",
      title: "Missing mobile viewport meta tag",
      description: "The page lacks a viewport meta tag, causing mobile browsers to display the desktop layout at scaled-down width.",
      evidence: "<meta name='viewport'> tag missing.",
      recommendation: "Add <meta name='viewport' content='width=device-width, initial-scale=1.0'> to <head>.",
    });
  } else if (!mobile.allowsUserZoom) {
    issues.push({
      category: "accessibility",
      severity: "medium",
      title: "Viewport restricts user zoom scaling",
      description: "The viewport meta tag sets user-scalable=no or maximum-scale=1.0, preventing users with vision impairments from zooming.",
      evidence: `Viewport tag content: "${mobile.viewportContent}"`,
      recommendation: "Allow pinch-to-zoom by removing user-scalable=no or maximum-scale restrictions.",
    });
  }

  return {
    navigation,
    content,
    cta,
    forms,
    mobile,
    issues,
    opportunities,
  };
}
