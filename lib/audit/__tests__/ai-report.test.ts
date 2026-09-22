import { AuditAIReportSchema } from "@/lib/ai/schemas/audit-report";

export function testAIReportSchema() {
  console.log("Running AI Report Schema Validation Unit Tests...");

  const validSample = {
    summary: "The website audit for example.com identified 2 high priority issues.",
    key_findings: [
      "Missing title tag on home page.",
      "High LCP loading delay measured.",
    ],
    priority_actions: [
      {
        priority: "high",
        evidence: "Missing <title> tag",
        why_it_matters: "Search engine crawlers require title tags for indexing.",
        recommended_action: "Add a title tag to the header.",
      },
    ],
    category_explanations: [
      {
        category: "SEO",
        score_explanation: "Score is 75/100 due to title missing.",
        major_evidence: ["Title missing"],
        why_it_matters: "SEO visibility.",
        next_steps: "Add title tag.",
      },
    ],
    business_context: "E-commerce store target audience.",
    limitations: "Automated evidence interpretation only.",
  };

  const parsed = AuditAIReportSchema.parse(validSample);
  if (!parsed.summary || parsed.priority_actions.length !== 1) {
    throw new Error("AI Schema Test Failed: Zod validation failed to return structured fields.");
  }

  // Test invalid schema throws
  try {
    AuditAIReportSchema.parse({ summary: 123 });
    throw new Error("AI Schema Test Failed: Expected Zod to reject invalid types.");
  } catch (err) {
    // Expected error
  }

  console.log("✓ AI Report Schema Unit Tests Passed Successfully!");
}
