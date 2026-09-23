import { createClient } from "@/lib/supabase/server";
import { getGeminiApiKey, isAIConfigured } from "./client";
import { AuditAIReportSchema, AuditAIReportData } from "./schemas/audit-report";
import { SYSTEM_PROMPT, PROMPT_VERSION, DEFAULT_AI_MODEL } from "./prompts/audit-report";

export interface DBStoredAIReport extends AuditAIReportData {
  id: string;
  audit_id: string;
  user_id: string;
  model: string;
  prompt_version: string;
  created_at: string;
  updated_at: string;
}

/**
 * Retrieves an existing AI report for an audit or generates a new structured interpretation report.
 */
export async function getOrGenerateAIReport(
  auditId: string
): Promise<{ success: boolean; data?: DBStoredAIReport; error?: string }> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Unauthorized access." };
  }

  // 1. Check if AI report already exists in DB
  const { data: existingReport } = await supabase
    .from("audit_ai_reports")
    .select("*")
    .eq("audit_id", auditId)
    .eq("user_id", user.id)
    .single();

  if (existingReport) {
    return {
      success: true,
      data: existingReport as DBStoredAIReport,
    };
  }

  // 2. Fetch audit evidence
  const { data: audit, error: auditError } = await supabase
    .from("audits")
    .select("*")
    .eq("id", auditId)
    .eq("user_id", user.id)
    .single();

  if (auditError || !audit) {
    return { success: false, error: "Audit record not found or access denied." };
  }

  if (audit.status !== "completed") {
    return { success: false, error: "AI analysis is only available for completed audits." };
  }

  const { data: issues } = await supabase
    .from("audit_issues")
    .select("category, severity, title, description, evidence, recommendation")
    .eq("audit_id", auditId);

  const structuredEvidence = {
    url: audit.url,
    overallScore: audit.overall_score,
    categoryScores: {
      seo: audit.seo_score,
      performance: audit.performance_score,
      accessibility: audit.accessibility_score,
      ux: audit.ux_score,
      trust: audit.trust_score,
      conversion: audit.conversion_score,
    },
    scoringVersion: audit.scoring_version || "v1",
    detectedIssuesCount: issues?.length || 0,
    issues: issues || [],
  };

  // 3. Fallback generator if OPENAI_API_KEY is not configured
  if (!isAIConfigured()) {
    const fallbackReport = generateFallbackEvidenceReport(structuredEvidence);
    const { data: savedReport, error: saveError } = await supabase
      .from("audit_ai_reports")
      .insert({
        audit_id: auditId,
        user_id: user.id,
        summary: fallbackReport.summary,
        key_findings: fallbackReport.key_findings,
        priority_actions: fallbackReport.priority_actions,
        category_explanations: fallbackReport.category_explanations,
        business_context: fallbackReport.business_context,
        limitations: fallbackReport.limitations,
        model: "rule-based-fallback",
        prompt_version: PROMPT_VERSION,
      })
      .select()
      .single();

    if (saveError || !savedReport) {
      return { success: false, error: "Failed to persist fallback analysis." };
    }

    return { success: true, data: savedReport as DBStoredAIReport };
  }

  // 4. Call Google Gemini API for structured interpretation
  try {
    const apiKey = getGeminiApiKey();
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_AI_MODEL}:generateContent?key=${apiKey}`;

    const promptText = `Interpret this website audit evidence for ${audit.url}:\n${JSON.stringify(
      structuredEvidence,
      null,
      2
    )}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: promptText }],
          },
        ],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API call failed:", errText);
      return { success: false, error: `Gemini API returned status ${response.status}` };
    }

    const resData = await response.json();
    const rawContent = resData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawContent) {
      return { success: false, error: "Empty response from Gemini AI service." };
    }

    const parsedJson = JSON.parse(rawContent);

    // Validate structured output via Zod
    const validatedReport = AuditAIReportSchema.parse(parsedJson);

    // Save to database
    const { data: savedReport, error: saveError } = await supabase
      .from("audit_ai_reports")
      .insert({
        audit_id: auditId,
        user_id: user.id,
        summary: validatedReport.summary,
        key_findings: validatedReport.key_findings,
        priority_actions: validatedReport.priority_actions,
        category_explanations: validatedReport.category_explanations,
        business_context: validatedReport.business_context || null,
        limitations: validatedReport.limitations,
        model: DEFAULT_AI_MODEL,
        prompt_version: PROMPT_VERSION,
      })
      .select()
      .single();

    if (saveError || !savedReport) {
      console.error("Failed saving AI report:", saveError);
      return { success: false, error: "Failed to persist AI report to database." };
    }

    return { success: true, data: savedReport as DBStoredAIReport };
  } catch (err: any) {
    console.error("AI Report generation error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to generate AI report.",
    };
  }
}

/**
 * Deterministic fallback evidence synthesizer used when OpenAI API key is unavailable
 */
function generateFallbackEvidenceReport(evidence: any): AuditAIReportData {
  const issues = evidence.issues || [];
  const criticalIssues = issues.filter((i: any) => i.severity === "critical" || i.severity === "high");

  const summary = `SiteLens completed a deterministic audit for ${evidence.url} achieving an overall score of ${evidence.overallScore ?? "N/A"}/100. The engine identified ${evidence.detectedIssuesCount} total issue(s), of which ${criticalIssues.length} require immediate high-priority attention.`;

  const key_findings = [
    `Overall score measured at ${evidence.overallScore ?? "N/A"}/100 based on version ${evidence.scoringVersion}.`,
    `${criticalIssues.length} high/critical priority item(s) detected.`,
    `SEO score: ${evidence.categoryScores.seo ?? "N/A"}/100 | Performance score: ${evidence.categoryScores.performance ?? "N/A"}/100.`,
    `Trust score: ${evidence.categoryScores.trust ?? "N/A"}/100 | Conversion score: ${evidence.categoryScores.conversion ?? "N/A"}/100.`,
  ];

  const priority_actions = criticalIssues.slice(0, 5).map((issue: any) => ({
    priority: issue.severity as "critical" | "high" | "medium" | "low",
    evidence: issue.evidence,
    why_it_matters: issue.description,
    recommended_action: issue.recommendation,
  }));

  if (priority_actions.length === 0) {
    priority_actions.push({
      priority: "medium",
      evidence: "General audit evidence",
      why_it_matters: "Regular maintenance helps sustain website health.",
      recommended_action: "Review minor low/medium issues listed in the detailed issue table.",
    });
  }

  const category_explanations = [
    {
      category: "SEO",
      score_explanation: `SEO score is ${evidence.categoryScores.seo ?? "N/A"}/100 based on meta tags, canonical link, title, and heading structure.`,
      major_evidence: issues.filter((i: any) => i.category === "seo").map((i: any) => i.evidence),
      why_it_matters: "Proper search signals help search engine crawlers discover and index your web pages accurately.",
      next_steps: "Address missing titles, meta descriptions, or H1 headings identified in the SEO category.",
    },
    {
      category: "Performance",
      score_explanation: `Performance score is ${evidence.categoryScores.performance ?? "N/A"}/100 based on initial HTTP response timing and automated metrics.`,
      major_evidence: issues.filter((i: any) => i.category === "performance").map((i: any) => i.evidence),
      why_it_matters: "Fast loading pages reduce visitor bounce rates and improve engagement.",
      next_steps: "Optimize response times and asset payloads to accelerate page rendering.",
    },
  ];

  return {
    summary,
    key_findings,
    priority_actions,
    category_explanations,
    business_context: "Deterministic evidence synthesis fallback report (OpenAI API key unconfigured).",
    limitations: "This report is synthesized directly from deterministic automated audit signals and does not involve third-party LLM evaluation.",
  };
}
