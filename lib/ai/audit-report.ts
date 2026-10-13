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

  const overallRating =
    (evidence.overallScore ?? 0) >= 80
      ? "Strong Website Health"
      : (evidence.overallScore ?? 0) >= 50
      ? "Solid Foundation with Action Items"
      : "Needs Immediate Attention";

  const summary = `Aigenstra completed a comprehensive website audit for ${evidence.url}, awarding an overall health score of ${evidence.overallScore ?? "N/A"}/100 (${overallRating}). Our inspection uncovered ${evidence.detectedIssuesCount} improvement opportunity(ies), with ${criticalIssues.length} high-impact item(s) that directly affect how visitors experience your site, how easily you get discovered on Google, and how well you convert traffic into paying customers.`;

  const key_findings = [
    `Overall Website Health rated at ${evidence.overallScore ?? "N/A"}/100 (${overallRating}).`,
    `${criticalIssues.length} critical priority item(s) detected that require prompt attention to protect visitor trust and search ranking.`,
    `Search Engine Visibility (SEO): ${evidence.categoryScores.seo ?? "N/A"}/100 — determines how easily new customers discover you on Google.`,
    `Page Speed & Responsiveness: ${evidence.categoryScores.performance ?? "N/A"}/100 — impacts whether visitors stay or leave before the page loads.`,
    `Customer Trust & Security: ${evidence.categoryScores.trust ?? "N/A"}/100 — reassures buyers that your site is legitimate and protected.`,
    `Action & Conversion Potential: ${evidence.categoryScores.conversion ?? "N/A"}/100 — measures how easily interested visitors can buy or contact you.`,
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
      evidence: "Routine site observation",
      why_it_matters: "Regular maintenance helps keep your site fast, secure, and competitive in search results.",
      recommended_action: "Review minor optimization opportunities in the detailed findings section below.",
    });
  }

  const category_explanations = [
    {
      category: "Search Engine Optimization (SEO)",
      score_explanation: `Your site scored ${evidence.categoryScores.seo ?? "N/A"}/100 on Google search readiness based on headline structure, description snippets, and indexing tags.`,
      major_evidence: issues.filter((i: any) => i.category === "seo").map((i: any) => i.evidence),
      why_it_matters: "When your headlines, titles, and descriptions are properly set up, Google can understand what your business sells and show your links to people searching for your services.",
      next_steps: "Ensure your primary page headline (H1) and meta description snippet are filled out with clear, appealing language describing your value.",
    },
    {
      category: "Speed & Performance",
      score_explanation: `Your website scored ${evidence.categoryScores.performance ?? "N/A"}/100 based on initial response times and how quickly your content is sent to visitors.`,
      major_evidence: issues.filter((i: any) => i.category === "performance").map((i: any) => i.evidence),
      why_it_matters: "Over half of mobile shoppers leave a site if it takes longer than 3 seconds to respond. Fast load times keep customers engaged and improve sales conversions.",
      next_steps: "Optimize your web hosting response times and compress large images to speed up first-load speeds.",
    },
    {
      category: "Customer Trust & Security",
      score_explanation: `Your trust rating is ${evidence.categoryScores.trust ?? "N/A"}/100 based on encrypted connection (HTTPS), privacy policy visibility, and contact accessibility.`,
      major_evidence: issues.filter((i: any) => i.category === "trust").map((i: any) => i.evidence),
      why_it_matters: "Shoppers look for safety signals before entering credit card information or personal details. Missing trust elements increase visitor hesitation.",
      next_steps: "Confirm that SSL encryption is active and that your privacy policy and contact information are clearly linked in the footer.",
    },
    {
      category: "User Experience & Accessibility",
      score_explanation: `Accessibility scored ${evidence.categoryScores.accessibility ?? "N/A"}/100 and UX scored ${evidence.categoryScores.ux ?? "N/A"}/100 based on mobile viewport settings, screen-reader text, and navigation clarity.`,
      major_evidence: issues.filter((i: any) => i.category === "accessibility" || i.category === "ux").map((i: any) => i.evidence),
      why_it_matters: "An accessible, mobile-friendly design guarantees that anyone—regardless of device or physical ability—can browse and use your website effortlessly.",
      next_steps: "Add descriptive text labels to all images, verify that buttons have visible words, and ensure your layout smoothly adapts to smartphone screens.",
    },
  ];

  return {
    summary,
    key_findings,
    priority_actions,
    category_explanations,
    business_context: "Executive plain-language analysis synthesized from real website measurements.",
    limitations: "This report focuses on measurable front-end, SEO, speed, and trust signals. Ongoing user research and customer interviews provide additional qualitative insights.",
  };
}
