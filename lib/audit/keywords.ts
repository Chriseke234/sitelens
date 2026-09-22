import * as cheerio from "cheerio";

export interface KeywordOpportunity {
  topic: string;
  category: "Primary topic" | "Secondary topic" | "Long-tail opportunity" | "Commercial intent" | "Informational intent";
  whyRelevant: string;
  suggestedUsage: string;
  pageEvidence: string;
}

export interface KeywordGap {
  topic: string;
  observation: string;
  opportunity: string;
}

export interface TitleOptimizationRecommendation {
  currentTitle: string;
  suggestedTitle: string;
  rationale: string;
  currentMetaDescription: string;
  suggestedMetaDescription: string;
}

export interface SEOKeywordIntelligence {
  detectedTopics: string[];
  keywordOpportunities: KeywordOpportunity[];
  keywordGaps: KeywordGap[];
  recommendations: TitleOptimizationRecommendation;
}

export function extractKeywordIntelligence(
  html: string,
  targetUrl: string
): SEOKeywordIntelligence {
  const $ = cheerio.load(html);

  const titleText = $("title").first().text().trim();
  const metaDescText = $('meta[name="description" i]').attr("content")?.trim() || "";
  const h1Text = $("h1").first().text().trim();

  // Extract all headings (H1-H4)
  const headings: string[] = [];
  $("h1, h2, h3, h4").each((_, el) => {
    const text = $(el).text().trim();
    if (text) headings.push(text);
  });

  // Extract body text words & phrases
  const clone = $.load(html);
  clone("script, style, noscript, svg, nav, footer").remove();
  const bodyText = clone("body").text().replace(/\s+/g, " ").trim().toLowerCase();

  const stopWords = new Set([
    "the", "and", "for", "that", "this", "with", "from", "you", "your", "are", "have", "will", "our", "all",
    "can", "has", "about", "more", "out", "was", "web", "site", "page", "home", "link", "view", "read"
  ]);

  const rawWords = bodyText.split(/[^a-zA-Z0-9]+/).filter((w) => w.length > 3 && !stopWords.has(w));

  const wordCounts: Record<string, number> = {};
  rawWords.forEach((w) => {
    wordCounts[w] = (wordCounts[w] || 0) + 1;
  });

  const topSingleWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([w]) => w);

  const detectedTopics: string[] = [];

  if (h1Text) detectedTopics.push(h1Text);
  headings.slice(1, 6).forEach((h) => {
    if (!detectedTopics.includes(h)) detectedTopics.push(h);
  });
  topSingleWords.slice(0, 5).forEach((w) => {
    if (!detectedTopics.some((t) => t.toLowerCase().includes(w))) {
      detectedTopics.push(w.charAt(0).toUpperCase() + w.slice(1));
    }
  });

  // Build evidence-based keyword opportunities
  const keywordOpportunities: KeywordOpportunity[] = [];

  if (h1Text) {
    keywordOpportunities.push({
      topic: h1Text,
      category: "Primary topic",
      whyRelevant: "Explicitly highlighted in the primary page <h1> heading tag.",
      suggestedUsage: "Page Title, H1 tag, and primary intro paragraph.",
      pageEvidence: `H1 tag text: "${h1Text}"`,
    });
  }

  headings.slice(1, 4).forEach((h) => {
    const isCommercial = /buy|order|price|service|cost|quote|hire|demo|solution/i.test(h);
    keywordOpportunities.push({
      topic: h,
      category: isCommercial ? "Commercial intent" : "Secondary topic",
      whyRelevant: `Featured as a sub-heading (H2/H3) within page structure.`,
      suggestedUsage: "Sub-section headings (H2/H3), supporting body text, and image alt text.",
      pageEvidence: `Heading text: "${h}"`,
    });
  });

  topSingleWords.slice(0, 3).forEach((w) => {
    if (wordCounts[w] >= 3) {
      keywordOpportunities.push({
        topic: w.charAt(0).toUpperCase() + w.slice(1),
        category: "Informational intent",
        whyRelevant: `Repeated frequently (${wordCounts[w]} occurrences) across visible page body text.`,
        suggestedUsage: "Supporting body content and internal link anchor text.",
        pageEvidence: `Term occurs ${wordCounts[w]} times in body content.`,
      });
    }
  });

  // Identify content & heading keyword gaps
  const keywordGaps: KeywordGap[] = [];

  if (headings.length < 3) {
    keywordGaps.push({
      topic: "Sub-topic Heading Structure",
      observation: `Only ${headings.length} heading tag(s) detected across page document.`,
      opportunity: "Add H2 and H3 sub-headings targeting key customer pain points to improve topic clarity and search scannability.",
    });
  }

  if (!metaDescText) {
    keywordGaps.push({
      topic: "Meta Description Topic Targeting",
      observation: "No meta description element found.",
      opportunity: "Include primary topic keywords in a custom meta description (120–160 characters) to optimize click-through rate.",
    });
  }

  // Generate grounded title & meta description optimization suggestions
  const domainName = new URL(targetUrl).hostname.replace(/^www\./, "");
  const primaryTopicStr = h1Text || titleText || domainName;

  const suggestedTitle = titleText
    ? titleText.length < 30 || titleText.length > 60
      ? `${primaryTopicStr} | Official Site`
      : titleText
    : `${primaryTopicStr} | Official Site`;

  const suggestedMetaDescription = metaDescText
    ? metaDescText
    : `Explore ${primaryTopicStr}. Discover key features, information, and solutions on ${domainName}.`;

  return {
    detectedTopics: detectedTopics.slice(0, 8),
    keywordOpportunities,
    keywordGaps,
    recommendations: {
      currentTitle: titleText || "Missing <title> tag",
      suggestedTitle,
      rationale: "Optimizes title tag character length (30–60 chars) while maintaining core topic relevance.",
      currentMetaDescription: metaDescText || "Missing meta description",
      suggestedMetaDescription,
    },
  };
}
