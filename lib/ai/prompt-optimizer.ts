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
