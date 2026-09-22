import { AuditCategory, SeverityLevel, AuditStatus } from "@/types";

export interface URLValidationResult {
  isValid: boolean;
  normalizedUrl?: string;
  error?: string;
}

export interface FetchSiteResult {
  success: boolean;
  url: string;
  finalUrl: string;
  statusCode: number;
  responseTimeMs: number;
  html?: string;
  contentType?: string;
  error?: string;
}

export interface HTMLSignals {
  // Technical & SEO
  hasTitle: boolean;
  titleText: string;
  titleLength: number;
  hasMetaDescription: boolean;
  metaDescriptionText: string;
  metaDescriptionLength: number;
  hasCanonical: boolean;
  canonicalUrl: string;
  hasViewport: boolean;
  robotsDirective: string;
  hasH1: boolean;
  h1Count: number;
  h1Text: string;
  totalHeadingCount: number;
  headingHierarchyValid?: boolean;
  totalImageCount: number;
  imagesMissingAltCount: number;
  totalLinkCount: number;
  internalLinkCount?: number;
  externalLinkCount?: number;
  brokenLinksDetected: number;
  hasStructuredData: boolean;
  htmlLang: string;
  hasSitemap?: boolean;
  hasRobotsTxt?: boolean;
  duplicateIdCount?: number;

  // UX Signals
  hasNavElement: boolean;
  hasMainElement: boolean;
  hasFooterElement: boolean;
  hasEmptyButtonsOrLinks: boolean;
  textContentLength: number;
  paragraphCount?: number;

  // Trust Signals
  isHttps: boolean;
  hasPrivacyLink: boolean;
  hasContactLink: boolean;
  hasTermsLink: boolean;
  hasAboutLink?: boolean;

  // Conversion Signals
  formCount: number;
  hasCallToActionLinks: boolean;
  hasMailtoLinks: boolean;
  hasTelLinks: boolean;
  hasWhatsAppLink?: boolean;
  hasSignupForm?: boolean;
  hasContactForm?: boolean;
  detectedCTAWords?: string[];
  detectedFormInputs?: number;
  missingFormLabelsCount?: number;
}

export interface LighthouseMetrics {
  available: boolean;
  performanceScore?: number | null;
  accessibilityScore?: number | null;
  seoScore?: number | null;
  bestPracticesScore?: number | null;
  largestContentfulPaintMs?: number | null;
  cumulativeLayoutShift?: number | null;
  totalBlockingTimeMs?: number | null;
  firstContentfulPaintMs?: number | null;
  speedIndexMs?: number | null;
}

export interface CategoryScores {
  seoScore: number | null;
  performanceScore: number | null;
  accessibilityScore: number | null;
  uxScore: number | null;
  trustScore: number | null;
  conversionScore: number | null;
  overallScore: number | null;
}

export interface CategoryScoreDetails {
  score: number | null;
  status: "measured" | "unavailable" | "not_applicable";
  measurableInputs: Record<string, string | number | boolean | null>;
  majorDeductions: string[];
  availableEvidence: string[];
}

export interface DetailedScores {
  summary: CategoryScores;
  scoringVersion: string;
  details: {
    seo: CategoryScoreDetails;
    performance: CategoryScoreDetails;
    accessibility: CategoryScoreDetails;
    ux: CategoryScoreDetails;
    trust: CategoryScoreDetails;
    conversion: CategoryScoreDetails;
  };
}

export interface GeneratedIssue {
  category: AuditCategory;
  severity: SeverityLevel;
  title: string;
  description: string;
  evidence: string;
  recommendation: string;
}

export interface UXOpportunity {
  category: string;
  observation: string;
  opportunity: string;
  evidence: string;
}

export interface AuditRunResult {
  success: boolean;
  auditId?: string;
  url: string;
  status: AuditStatus;
  scores: CategoryScores;
  detailedScores?: DetailedScores;
  issues: GeneratedIssue[];
  opportunities?: UXOpportunity[];
  pageDetail?: {
    url: string;
    title?: string;
    statusCode: number;
    loadTimeMs: number;
  };
  error?: string;
}

