import * as cheerio from "cheerio";

export interface ContentAnalysisResult {
  wordCount: number;
  paragraphCount: number;
  headingCount: number;
  contentToMarkupRatio: number;
  hasDescriptiveH1: boolean;
  hasValuePropositionKeywords: boolean;
  hasContactActionKeywords: boolean;
  observations: string[];
}

export function analyzeContent(
  $: cheerio.CheerioAPI,
  htmlLength: number
): ContentAnalysisResult {
  // Strip scripts, styles, and non-content tags
  const clone = $.load($.html());
  clone("script, style, noscript, svg, iframe, meta").remove();

  const bodyText = clone("body").text().replace(/\s+/g, " ").trim();
  const words = bodyText ? bodyText.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  const paragraphCount = clone("p").length;
  const headingCount = clone("h1, h2, h3, h4, h5, h6").length;

  const contentToMarkupRatio =
    htmlLength > 0 ? Math.round((bodyText.length / htmlLength) * 100) / 100 : 0;

  const h1Text = clone("h1").first().text().trim();
  const hasDescriptiveH1 = h1Text.length >= 10;

  const valuePropKeywords = [
    "platform",
    "solution",
    "service",
    "help",
    "build",
    "grow",
    "leading",
    "trusted",
    "fast",
    "easy",
    "secure",
    "software",
    "agency",
  ];

  const contactActionKeywords = [
    "contact",
    "email",
    "phone",
    "call",
    "talk to us",
    "get in touch",
    "schedule",
  ];

  const lowerText = bodyText.toLowerCase();

  const hasValuePropositionKeywords = valuePropKeywords.some((kw) =>
    lowerText.includes(kw)
  );
  const hasContactActionKeywords = contactActionKeywords.some((kw) =>
    lowerText.includes(kw)
  );

  const observations: string[] = [];

  observations.push(`Extracted approx. ${wordCount} words across ${paragraphCount} paragraph(s) and ${headingCount} heading(s).`);

  if (!hasDescriptiveH1) {
    if (h1Text) {
      observations.push(`Primary <h1> heading "${h1Text}" is concise (${h1Text.length} chars).`);
    } else {
      observations.push("No primary <h1> heading detected in document body.");
    }
  } else {
    observations.push(`Primary heading detected: "${h1Text}".`);
  }

  if (contentToMarkupRatio < 0.05) {
    observations.push(`Low text-to-HTML markup ratio (${(contentToMarkupRatio * 100).toFixed(1)}%), indicating heavy markup or script overhead.`);
  }

  return {
    wordCount,
    paragraphCount,
    headingCount,
    contentToMarkupRatio,
    hasDescriptiveH1,
    hasValuePropositionKeywords,
    hasContactActionKeywords,
    observations,
  };
}
