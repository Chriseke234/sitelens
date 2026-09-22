import { createClient } from "@/lib/supabase/server";
import { CategoryScores, GeneratedIssue, FetchSiteResult } from "./types";
import { HTMLSignals } from "./types";

/**
 * Safely persists audit results, audit pages, and generated issues to Supabase
 */
export async function saveAuditResults(
  auditId: string,
  fetchResult: FetchSiteResult,
  signals: HTMLSignals | null,
  scores: CategoryScores,
  issues: GeneratedIssue[],
  startedAt: string
): Promise<boolean> {
  const supabase = await createClient();
  const completedAt = new Date().toISOString();

  try {
    // 1. Update audit master record
    const { error: auditError } = await supabase
      .from("audits")
      .update({
        status: fetchResult.success ? "completed" : "failed",
        overall_score: scores.overallScore,
        seo_score: scores.seoScore,
        performance_score: scores.performanceScore,
        accessibility_score: scores.accessibilityScore,
        ux_score: scores.uxScore,
        trust_score: scores.trustScore,
        conversion_score: scores.conversionScore,
        scoring_version: "v1",
        started_at: startedAt,
        completed_at: completedAt,
      })
      .eq("id", auditId);

    if (auditError) {
      console.error("Supabase audit update error:", auditError);
      return false;
    }

    // 2. Insert audit_pages record
    const pageTitle = signals?.titleText || fetchResult.finalUrl;

    const { data: pageRecord, error: pageError } = await supabase
      .from("audit_pages")
      .insert({
        audit_id: auditId,
        url: fetchResult.finalUrl || fetchResult.url,
        title: pageTitle,
        status_code: fetchResult.statusCode,
        load_time: fetchResult.responseTimeMs,
        screenshot_url: null,
      })
      .select("id")
      .single();

    if (pageError) {
      console.error("Supabase audit_pages error:", pageError);
    }

    const pageId = pageRecord?.id || null;

    // 3. Bulk insert audit_issues records
    if (issues.length > 0) {
      const issueRecords = issues.map((issue) => ({
        audit_id: auditId,
        page_id: pageId,
        category: issue.category,
        severity: issue.severity,
        title: issue.title,
        description: issue.description,
        evidence: issue.evidence,
        recommendation: issue.recommendation,
      }));

      const { error: issuesError } = await supabase
        .from("audit_issues")
        .insert(issueRecords);

      if (issuesError) {
        console.error("Supabase audit_issues bulk insert error:", issuesError);
      }
    }

    return true;
  } catch (err) {
    console.error("Failed to persist audit results to Supabase:", err);
    return false;
  }
}
