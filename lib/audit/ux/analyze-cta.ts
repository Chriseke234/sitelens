import * as cheerio from "cheerio";

export interface CTAElementEvidence {
  tagName: string;
  text: string;
  href?: string;
  type?: string;
}

export interface CTAAnalysisResult {
  hasPrimaryCTA: boolean;
  ctaCount: number;
  detectedActionWords: string[];
  ctaElements: CTAElementEvidence[];
  observations: string[];
}

export const CTA_ACTION_KEYWORDS = [
  "contact us",
  "contact",
  "get started",
  "start free",
  "sign up",
  "register",
  "book",
  "buy",
  "purchase",
  "request a demo",
  "request demo",
  "request quote",
  "learn more",
  "schedule",
  "download",
  "try now",
  "subscribe",
];

export function analyzeCTA($: cheerio.CheerioAPI): CTAAnalysisResult {
  const ctaElements: CTAElementEvidence[] = [];
  const detectedActionWordsSet = new Set<string>();

  $("a, button, input[type='submit'], input[type='button']").each((_, el) => {
    const text = $(el).text().trim() || $(el).attr("value")?.trim() || $(el).attr("aria-label")?.trim() || "";
    const href = $(el).attr("href")?.trim();
    const tagName = el.name.toLowerCase();

    if (!text) return;

    const textLower = text.toLowerCase();

    const matchedKeyword = CTA_ACTION_KEYWORDS.find((kw) => textLower.includes(kw));

    if (matchedKeyword) {
      detectedActionWordsSet.add(matchedKeyword);
      ctaElements.push({
        tagName,
        text,
        href,
        type: $(el).attr("type"),
      });
    }
  });

  const ctaCount = ctaElements.length;
  const hasPrimaryCTA = ctaCount > 0;
  const detectedActionWords = Array.from(detectedActionWordsSet);
  const observations: string[] = [];

  if (hasPrimaryCTA) {
    observations.push(`Detected ${ctaCount} Call-To-Action element(s) matching action keywords ("${detectedActionWords.slice(0, 5).join('", "')}").`);
  } else {
    observations.push("No explicit Call-To-Action (CTA) buttons or links matching standard action keywords were detected.");
  }

  return {
    hasPrimaryCTA,
    ctaCount,
    detectedActionWords,
    ctaElements: ctaElements.slice(0, 10), // Limit top 10 evidence items
    observations,
  };
}
