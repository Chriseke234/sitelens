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
      title: "Main Navigation Menu Is Hard for Tools to Recognize",
      description: "Your website navigation links are not placed inside a recognized navigation section. Visitors using accessibility tools or keyboard navigation will find it frustrating to jump straight to other pages.",
      evidence: "No semantic <nav> landmark element was found around your site header links.",
      recommendation: "Wrap your website menu links inside a standard navigation bar element so browsers and assistive tools handle it smoothly.",
    });
  }

  if (navigation.emptyNavLinkCount > 0) {
    issues.push({
      category: "ux",
      severity: "medium",
      title: "Menu Links Without Words or Readable Labels",
      description: `${navigation.emptyNavLinkCount} menu link(s) don't have readable text (such as icon buttons). Screen reader users will hear a blank link and won't know where clicking leads.`,
      evidence: `${navigation.emptyNavLinkCount} empty link(s) detected in the top navigation.`,
      recommendation: "Give every menu item an unambiguous word label or an accessibility tag so its destination is crystal clear.",
    });
  }

  // 2. Heading & Content Structure Issues & Opportunities
  if (!signals.hasH1) {
    issues.push({
      category: "ux",
      severity: "high",
      title: "No Clear Main Headline to Greet Visitors",
      description: "When people arrive on your page, there is no main headline explaining what your product or service actually does. First-time visitors might bounce away in confusion within seconds.",
      evidence: "Zero primary <h1> heading tags detected in the page document.",
      recommendation: "Add an eye-catching main headline at the top of the page clearly stating your core offer.",
    });
  } else if (signals.h1Count > 1) {
    issues.push({
      category: "ux",
      severity: "medium",
      title: "Multiple Main Headlines Competing for Attention",
      description: `Your page has ${signals.h1Count} primary headlines. Having multiple main titles confuses readers and dilutes your core marketing message.`,
      evidence: `${signals.h1Count} main headline tags found (First one: "${signals.h1Text}").`,
      recommendation: "Feature one primary main headline at the top, and format other sub-topics as secondary subheadings.",
    });
  }

  // 3. CTA & Conversion Issues & Opportunities
  if (!cta.hasPrimaryCTA) {
    issues.push({
      category: "conversion",
      severity: "high",
      title: "Missing Call-to-Action Button (Visitors Don't Know How to Buy)",
      description: "There is no prominent, obvious action button (like 'Get Started', 'Schedule a Call', or 'Buy Now') on the page. Interested visitors might browse without knowing how to take the next step.",
      evidence: "No primary action buttons detected matching standard conversion phrases.",
      recommendation: "Add a bright, unmistakable action button near the top of the page prompting visitors to take action immediately.",
    });
  } else if (cta.ctaCount === 1) {
    opportunities.push({
      category: "conversion",
      observation: `Primary action button identified: "${cta.ctaElements[0]?.text}".`,
      opportunity: "Consider adding a low-commitment secondary choice (like 'Learn More', 'Watch Demo', or 'Chat With Us') for visitors who aren't ready to purchase right away.",
      evidence: `Single main action button found: "${cta.ctaElements[0]?.text}".`,
    });
  }

  // 4. Form Issues & Opportunities
  if (forms.totalUnlabeledInputs > 0) {
    issues.push({
      category: "ux",
      severity: "high",
      title: "Form Input Fields Lack Explanatory Labels",
      description: `${forms.totalUnlabeledInputs} input box(es) do not have descriptive labels above them. Customers may not understand what information you are asking for, causing them to abandon the form.`,
      evidence: `${forms.totalUnlabeledInputs} form input(s) detected without associated text labels.`,
      recommendation: "Add an explicit label above or beside each field (e.g. 'Your Work Email', 'Phone Number') so filling out the form is frictionless.",
    });
  }

  if (forms.hasContactForm) {
    opportunities.push({
      category: "conversion",
      observation: "A lead capture or contact form is present on this page.",
      opportunity: "Keep the form fields as short as possible (name and email are often enough). Every extra field reduces form completions by up to 10%.",
      evidence: `Form with ${forms.forms[0]?.fieldCount || 0} fields detected.`,
    });
  } else if (signals.hasContactLink) {
    opportunities.push({
      category: "conversion",
      observation: "A link to your contact page was found in the text or footer.",
      opportunity: "Make getting in touch even easier by adding a quick inquiry form or scheduling button directly on your main page.",
      evidence: "Contact link found without an embedded form on the homepage.",
    });
  }

  // 5. Mobile Readiness Issues
  if (!mobile.hasViewportTag) {
    issues.push({
      category: "ux",
      severity: "critical",
      title: "Website Does Not Adjust for Mobile Phones",
      description: "Your page lacks mobile responsiveness instructions. Smartphone users will see a tiny, unreadable desktop version that forces them to zoom in and scroll sideways, driving mobile shoppers away.",
      evidence: "Mobile viewport meta tag is missing from the page header.",
      recommendation: "Add standard mobile viewport tags so your layout automatically adapts to any smartphone screen.",
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
