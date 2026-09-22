import { z } from "zod";

export const PriorityActionSchema = z.object({
  priority: z.enum(["critical", "high", "medium", "low"]),
  evidence: z.string(),
  why_it_matters: z.string(),
  recommended_action: z.string(),
});

export const CategoryExplanationSchema = z.object({
  category: z.string(),
  score_explanation: z.string(),
  major_evidence: z.array(z.string()),
  why_it_matters: z.string(),
  next_steps: z.string(),
});

export const AuditAIReportSchema = z.object({
  summary: z.string(),
  key_findings: z.array(z.string()),
  priority_actions: z.array(PriorityActionSchema),
  category_explanations: z.array(CategoryExplanationSchema),
  business_context: z.string().optional(),
  limitations: z.string(),
});

export type PriorityAction = z.infer<typeof PriorityActionSchema>;
export type CategoryExplanation = z.infer<typeof CategoryExplanationSchema>;
export type AuditAIReportData = z.infer<typeof AuditAIReportSchema>;
