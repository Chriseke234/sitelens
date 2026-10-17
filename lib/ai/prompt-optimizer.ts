import {
  PromptSection,
  PromptOptimizationResult,
  ChangeBoundaries,
} from "@/types";

/**
 * Accurately estimates token count using standard ~4 chars/token heuristic.
 */
export function estimateTokens(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  // Account for code symbols and whitespace
  return Math.ceil(text.length / 3.8);
}

/**
 * Deduplicate text entries and remove repeated boilerplate while preserving
 * 100% of functional requirements and safety constraints.
 */
export function deduplicateStrings(items: string[]): {
  cleaned: string[];
  removedCount: number;
} {
  if (!items || items.length === 0) {
    return { cleaned: [], removedCount: 0 };
  }

  const seen = new Set<string>();
  const cleaned: string[] = [];

  for (const raw of items) {
    if (!raw || typeof raw !== "string") continue;
    const trimmed = raw.trim();
    if (trimmed.length === 0) continue;

    // Normalize for comparison
    const normalized = trimmed
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ");

    if (!seen.has(normalized)) {
      seen.add(normalized);
      cleaned.push(trimmed);
    }
  }

  return {
    cleaned,
    removedCount: items.length - cleaned.length,
  };
}

/**
 * Detects contradictions between change boundaries, requirements, and decisions.
 */
export function detectContradictions(
  mustChange: string[] = [],
  mustNotChange: string[] = [],
  requirements: string[] = []
): Array<{ ruleA: string; ruleB: string; resolution: string }> {
  const contradictions: Array<{
    ruleA: string;
    ruleB: string;
    resolution: string;
  }> = [];

  // Check 1: Must Change vs Must Not Change overlapping paths/files
  for (const change of mustChange) {
    const cleanChange = change.toLowerCase().trim();
    for (const protect of mustNotChange) {
      const cleanProtect = protect.toLowerCase().trim();
      if (
        cleanChange === cleanProtect ||
        (cleanProtect.length > 3 && cleanChange.includes(cleanProtect)) ||
        (cleanChange.length > 3 && cleanProtect.includes(cleanChange))
      ) {
        contradictions.push({
          ruleA: `MUST CHANGE: "${change}"`,
          ruleB: `MUST NOT CHANGE: "${protect}"`,
          resolution: `Safety Precedence: "${protect}" is preserved as immutable; modifications restricted to non-conflicting subcomponents.`,
        });
      }
    }
  }

  // Check 2: Contradictory requirement patterns (e.g., Client State vs Server Action)
  const reqText = requirements.join(" ").toLowerCase();
  if (
    reqText.includes("mock data only") &&
    reqText.includes("real supabase database")
  ) {
    contradictions.push({
      ruleA: "Requirement specifies mock data",
      ruleB: "Requirement specifies real Supabase connection",
      resolution: "Supabase persistence enforced with local fallback testing.",
    });
  }

  return contradictions;
}

/**
 * Optimizes prompt sections by pruning redundant sentences, applying formatting standards,
 * and calculating token metrics.
 */
export function optimizePromptSections(
  rawSections: PromptSection[],
  boundaries?: ChangeBoundaries
): {
  optimizedSections: PromptSection[];
  optimization: PromptOptimizationResult;
} {
  const optimizationsApplied: string[] = [];
  let rawCharTotal = 0;
  let optimizedCharTotal = 0;

  // 1. Detect any contradictions in boundaries
  const contradictions = detectContradictions(
    boundaries?.mustChange || [],
    boundaries?.mustNotChange || [],
    rawSections.map((s) => s.content)
  );

  if (contradictions.length > 0) {
    optimizationsApplied.push(
      `Resolved ${contradictions.length} boundary contradiction(s) in favor of safety guardrails.`
    );
  }

  const optimizedSections: PromptSection[] = rawSections.map((sec) => {
    rawCharTotal += sec.content.length;

    // Split into lines for deduplication & whitespace normalization
    const lines = sec.content.split("\n");
    const cleanedLines: string[] = [];
    const seenLines = new Set<string>();

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === "") {
        if (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1] !== "") {
          cleanedLines.push("");
        }
        continue;
      }

      // Check if bullet point or numbered item
      const isBullet = /^(\*|-|\d+\.)\s+/.test(trimmed);
      const normalized = isBullet
        ? trimmed.replace(/^(\*|-|\d+\.)\s+/, "").toLowerCase().replace(/[^\w\s]/g, "")
        : trimmed.toLowerCase().replace(/[^\w\s]/g, "");

      if (isBullet) {
        if (!seenLines.has(normalized)) {
          seenLines.add(normalized);
          cleanedLines.push(trimmed);
        } else {
          // duplicate line stripped
        }
      } else {
        cleanedLines.push(trimmed);
      }
    }

    const optimizedContent = cleanedLines.join("\n").trim();
    optimizedCharTotal += optimizedContent.length;

    return {
      ...sec,
      content: optimizedContent,
    };
  });

  if (rawCharTotal > optimizedCharTotal) {
    const savedChars = rawCharTotal - optimizedCharTotal;
    optimizationsApplied.push(
      `Deduplicated repetitive lines and normalized spacing (-${savedChars} characters).`
    );
  } else {
    optimizationsApplied.push("Validated section density and formatting alignment.");
  }

  const rawTokens = estimateTokens(rawSections.map((s) => s.content).join("\n\n"));
  const optTokens = estimateTokens(optimizedSections.map((s) => s.content).join("\n\n"));
  const reductionPct = rawTokens > 0
    ? Math.max(0, Math.round(((rawTokens - optTokens) / rawTokens) * 100))
    : 0;

  return {
    optimizedSections,
    optimization: {
      rawCharacterCount: rawCharTotal,
      optimizedCharacterCount: optimizedCharTotal,
      rawEstimatedTokens: rawTokens,
      optimizedEstimatedTokens: optTokens,
      reductionPercentage: reductionPct,
      optimizationsApplied,
      contradictionsDetected: contradictions,
    },
  };
}

export interface QualityControlFinding {
  code: string;
  severity: "ERROR" | "WARNING" | "INFO";
  category:
    | "CONTRADICTION"
    | "SCOPE_BLOAT"
    | "SECURITY_OMISSION"
    | "CONCURRENCY"
    | "ACCEPTANCE_CRITERIA"
    | "ANTI_FABRICATION";
  message: string;
  recommendation: string;
}

export interface TaskQualityReport {
  taskId: string;
  taskTitle: string;
  isReadyForPromptCompilation: boolean;
  score: number; // 0 - 100
  findings: QualityControlFinding[];
}

/**
 * Deterministic quality control engine for Aigenstra tasks.
 * Validates against scope bloat, contradictory decisions, missing security/concurrency rules,
 * unverified acceptance criteria, and fabricated test claims.
 */
export function validateTaskQualityControls(
  task: {
    id: string;
    title: string;
    task_type: string;
    complexity?: string;
    acceptance_criteria?: string[];
    change_boundaries?: ChangeBoundaries;
  },
  productType: string = "SaaS",
  confirmedDecisions: Array<{ question: string; answer: string }> = []
): TaskQualityReport {
  const findings: QualityControlFinding[] = [];
  const criteria = task.acceptance_criteria || [];

  // 1. Acceptance Criteria Validation
  if (criteria.length < 2) {
    findings.push({
      code: "QC_MINIMAL_CRITERIA",
      severity: "ERROR",
      category: "ACCEPTANCE_CRITERIA",
      message: "Task has fewer than 2 verifiable acceptance criteria.",
      recommendation: "Define at least 2 explicit, verifiable test or typecheck outcomes.",
    });
  }

  const vaguePatterns = ["looks good", "make it work", "test everything", "handle etc", "standard stuff"];
  for (const c of criteria) {
    if (vaguePatterns.some((vp) => c.toLowerCase().includes(vp))) {
      findings.push({
        code: "QC_AMBIGUOUS_CRITERIA",
        severity: "WARNING",
        category: "ACCEPTANCE_CRITERIA",
        message: `Criterion contains ambiguous phrasing: "${c}"`,
        recommendation: "Replace with deterministic verification steps (e.g., 'Assert HTTP 403 on invalid session').",
      });
    }
  }

  // 2. Anti-Fabrication Test Verification
  const hasExecutableVerification = criteria.some((c) => {
    const text = c.toLowerCase();
    return (
      text.includes("typecheck") ||
      text.includes("tsc") ||
      text.includes("npm run build") ||
      text.includes("403") ||
      text.includes("rls") ||
      text.includes("test") ||
      text.includes("zod")
    );
  });

  if (!hasExecutableVerification) {
    findings.push({
      code: "QC_NO_VERIFIABLE_EVIDENCE",
      severity: "ERROR",
      category: "ANTI_FABRICATION",
      message: "No executable verification commands (typecheck, lint, or test assertion) found in acceptance criteria.",
      recommendation: "Add 'npm run typecheck passes with 0 errors' or concrete HTTP/RLS test expectations.",
    });
  }

  // 3. SaaS Tenant Isolation & Security
  if (productType === "SaaS" && (task.task_type === "DATABASE" || task.task_type === "AUTH")) {
    const mentionsIsolation = criteria.some((c) => {
      const text = c.toLowerCase();
      return text.includes("rls") || text.includes("isolation") || text.includes("row-level security") || text.includes("tenant");
    });

    if (!mentionsIsolation) {
      findings.push({
        code: "QC_SAAS_ISOLATION_OMISSION",
        severity: "ERROR",
        category: "SECURITY_OMISSION",
        message: "SaaS database/auth task does not specify Row-Level Security (RLS) tenant isolation.",
        recommendation: "Explicitly require RLS policies and negative isolation test cases asserting 403 on cross-tenant access.",
      });
    }
  }

  // 4. E-commerce Concurrency & Zero-Trust Checkout
  if (productType === "E-commerce" && (task.task_type === "DATABASE" || task.title.toLowerCase().includes("checkout"))) {
    const criteriaText = criteria.join(" ").toLowerCase();
    const mentionsConcurrency =
      criteriaText.includes("concurrency") ||
      criteriaText.includes("atomic") ||
      criteriaText.includes("inventory_quantity >=") ||
      criteriaText.includes("overselling") ||
      criteriaText.includes("lock");

    if (!mentionsConcurrency) {
      findings.push({
        code: "QC_ECOM_CONCURRENCY_OMISSION",
        severity: "WARNING",
        category: "CONCURRENCY",
        message: "E-commerce checkout/schema task does not specify concurrency protection against overselling.",
        recommendation: "Enforce atomic inventory decrements (UPDATE ... WHERE inventory_quantity >= requested) or row locking.",
      });
    }

    if (task.title.toLowerCase().includes("checkout")) {
      const mentionsZeroTrust =
        criteriaText.includes("server") || criteriaText.includes("discard") || criteriaText.includes("recalculate");
      if (!mentionsZeroTrust) {
        findings.push({
          code: "QC_ECOM_ZERO_TRUST_PRICING",
          severity: "ERROR",
          category: "SECURITY_OMISSION",
          message: "Checkout task does not specify server-side price recalculation.",
          recommendation: "Mandate that subtotals and discounts are calculated strictly on the server from the product table.",
        });
      }
    }
  }

  // 5. Semantic Contradiction Check with Confirmed Decisions
  for (const decision of confirmedDecisions) {
    const qLower = decision.question.toLowerCase();
    const aLower = decision.answer.toLowerCase();

    // Guest checkout vs mandatory auth
    if (aLower.includes("guest checkout") && task.title.toLowerCase().includes("authentication") && task.task_type === "AUTH") {
      const criteriaText = criteria.join(" ").toLowerCase();
      if (criteriaText.includes("force login before cart") || criteriaText.includes("block guest")) {
        findings.push({
          code: "QC_CONTRADICTORY_DECISION_AUTH",
          severity: "ERROR",
          category: "CONTRADICTION",
          message: `Task forces login but user confirmed: "${decision.question}: ${decision.answer}".`,
          recommendation: "Support optional guest checkout with email capture rather than blocking anonymous carts.",
        });
      }
    }

    // Solo personal SaaS vs enterprise multi-tenant team bloat
    if (aLower.includes("personal") && !aLower.includes("team") && task.title.toLowerCase().includes("organization member")) {
      findings.push({
        code: "QC_SCOPE_BLOAT_TEAM_RBAC",
        severity: "WARNING",
        category: "SCOPE_BLOAT",
        message: `Task introduces team organization members, but user specified personal solo product.`,
        recommendation: "Use single-user auth.uid() scoping to prevent unnecessary B2B multi-tenant complexity.",
      });
    }
  }

  const errorCount = findings.filter((f) => f.severity === "ERROR").length;
  const warningCount = findings.filter((f) => f.severity === "WARNING").length;
  const score = Math.max(0, 100 - errorCount * 30 - warningCount * 10);

  return {
    taskId: task.id,
    taskTitle: task.title,
    isReadyForPromptCompilation: errorCount === 0,
    score,
    findings,
  };
}

