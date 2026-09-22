import { validateAndNormalizeUrl } from "./validate-url";
import { fetchWebsite } from "./fetch-site";
import { analyzeHTML } from "./analyze-html";
import { runLighthouseAnalysis } from "./lighthouse";
import { calculateDetailedScores } from "./calculate-scores";
import { generateAuditIssues } from "./generate-issues";
import { runFullUXAnalysis } from "./ux";
import { saveAuditResults } from "./save-audit";
import { AuditRunResult } from "./types";
import { createClient } from "@/lib/supabase/server";

import { extractFaviconUrl } from "./favicon";
import { extractKeywordIntelligence } from "./keywords";
import { captureAuditScreenshots } from "./screenshot";

export * from "./types";
export * from "./validate-url";
export * from "./scoring";
export * from "./ux";
export * from "./favicon";
export * from "./keywords";
export * from "./screenshot";

/**
 * Main orchestrator executing the deterministic website audit workflow
 */
export async function executeWebsiteAudit(
  auditId: string,
  targetUrl: string
): Promise<AuditRunResult> {
  const startedAt = new Date().toISOString();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // 1. Mark status as 'analyzing'
  await supabase
    .from("audits")
    .update({ status: "analyzing", started_at: startedAt })
    .eq("id", auditId);

  // 2. Validate URL & check SSRF protections
  const validation = await validateAndNormalizeUrl(targetUrl);
  if (!validation.isValid || !validation.normalizedUrl) {
    const errorMsg = validation.error || "Invalid website URL.";

    const fetchResult = {
      success: false,
      url: targetUrl,
      finalUrl: targetUrl,
      statusCode: 0,
      responseTimeMs: 0,
      error: errorMsg,
    };

    const emptyScores = {
      seoScore: null,
      performanceScore: null,
      accessibilityScore: null,
      uxScore: null,
      trustScore: null,
      conversionScore: null,
      overallScore: null,
    };

    const failedIssue = [
      {
        category: "seo" as const,
        severity: "critical" as const,
        title: "Target URL Validation Failed",
        description: errorMsg,
        evidence: `Submitted URL: ${targetUrl}`,
        recommendation: "Ensure the URL is a valid public HTTP or HTTPS web address.",
      },
    ];

    await saveAuditResults(auditId, fetchResult, null, emptyScores, failedIssue, startedAt);

    return {
      success: false,
      auditId,
      url: targetUrl,
      status: "failed",
      scores: emptyScores,
      issues: failedIssue,
      error: errorMsg,
    };
  }

  const normalizedUrl = validation.normalizedUrl;

  // 3. Fetch website HTML
  const fetchResult = await fetchWebsite(normalizedUrl);

  if (!fetchResult.success || !fetchResult.html) {
    const fetchError = fetchResult.error || "Failed to fetch website contents.";

    const failedScores = {
      seoScore: 0,
      performanceScore: 0,
      accessibilityScore: 0,
      uxScore: 0,
      trustScore: 0,
      conversionScore: 0,
      overallScore: 0,
    };

    const fetchIssues = [
      {
        category: "seo" as const,
        severity: "critical" as const,
        title: "Website unreachable or non-200 HTTP response",
        description: fetchError,
        evidence: `URL: ${normalizedUrl} | HTTP Status: ${fetchResult.statusCode}`,
        recommendation: "Verify the website is online and accessible publicly.",
      },
    ];

    await saveAuditResults(auditId, fetchResult, null, failedScores, fetchIssues, startedAt);

    return {
      success: false,
      auditId,
      url: normalizedUrl,
      status: "failed",
      scores: failedScores,
      issues: fetchIssues,
      error: fetchError,
    };
  }

  // 4. Extract Favicon URL
  const faviconUrl = extractFaviconUrl(fetchResult.html, fetchResult.finalUrl);
  if (faviconUrl) {
    await supabase.from("audits").update({ favicon_url: faviconUrl }).eq("id", auditId);
  }

  // 5. Extract HTML Signals & SEO Keyword Intelligence
  const signals = analyzeHTML(fetchResult.html, fetchResult.finalUrl);
  const keywords = extractKeywordIntelligence(fetchResult.html, fetchResult.finalUrl);

  // 6. Attempt Lighthouse checks where available
  const lighthouse = await runLighthouseAnalysis(fetchResult.finalUrl);

  // 7. Calculate category scores & detailed explanations
  const detailedScores = calculateDetailedScores(
    signals,
    lighthouse,
    fetchResult.statusCode,
    fetchResult.responseTimeMs
  );
  const scores = detailedScores.summary;

  // 8. Run UX Analysis & generate issues
  const uxAnalysis = runFullUXAnalysis(fetchResult.html, signals, lighthouse);
  const issues = generateAuditIssues(
    signals,
    fetchResult.statusCode,
    fetchResult.responseTimeMs,
    fetchResult.html
  );

  // 9. Attempt screenshot capture async in background
  if (user) {
    captureAuditScreenshots(auditId, user.id, fetchResult.finalUrl).catch(() => null);
  }

  // 10. Persist results to Supabase
  const saved = await saveAuditResults(
    auditId,
    fetchResult,
    signals,
    scores,
    issues,
    startedAt
  );

  return {
    success: saved,
    auditId,
    url: fetchResult.finalUrl,
    status: "completed",
    scores,
    detailedScores,
    issues,
    opportunities: uxAnalysis.opportunities,
    pageDetail: {
      url: fetchResult.finalUrl,
      title: signals.titleText,
      statusCode: fetchResult.statusCode,
      loadTimeMs: fetchResult.responseTimeMs,
    },
  };
}


