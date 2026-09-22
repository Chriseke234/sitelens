import * as cheerio from "cheerio";
import { HTMLSignals } from "./types";

/**
 * Parses raw HTML string and extracts deterministic website signals
 */
export function analyzeHTML(html: string, finalUrl: string): HTMLSignals {
  const $ = cheerio.load(html);

  // SEO & Technical signals
  const titleText = $("title").first().text().trim() || "";
  const hasTitle = titleText.length > 0;
  const titleLength = titleText.length;

  const metaDescriptionText =
    $('meta[name="description" i]').attr("content")?.trim() || "";
  const hasMetaDescription = metaDescriptionText.length > 0;
  const metaDescriptionLength = metaDescriptionText.length;

  const canonicalUrl = $('link[rel="canonical" i]').attr("href")?.trim() || "";
  const hasCanonical = canonicalUrl.length > 0;

  const hasViewport = $('meta[name="viewport" i]').length > 0;
  const robotsDirective =
    $('meta[name="robots" i]').attr("content")?.trim() || "";

  const h1Elements = $("h1");
  const hasH1 = h1Elements.length > 0;
  const h1Count = h1Elements.length;
  const h1Text = h1Elements.first().text().trim() || "";

  const totalHeadingCount = $("h1, h2, h3, h4, h5, h6").length;

  const images = $("img");
  const totalImageCount = images.length;
  let imagesMissingAltCount = 0;
  images.each((_, el) => {
    const alt = $(el).attr("alt");
    if (alt === undefined || alt === null || alt.trim() === "") {
      imagesMissingAltCount++;
    }
  });

  const links = $("a");
  const totalLinkCount = links.length;

  const hasStructuredData =
    $('script[type="application/ld+json"]').length > 0;

  const htmlLang = $("html").attr("lang")?.trim() || "";

  // UX Signals
  const hasNavElement = $("nav").length > 0 || $('[role="navigation"]').length > 0;
  const hasMainElement = $("main").length > 0 || $('[role="main"]').length > 0;
  const hasFooterElement = $("footer").length > 0 || $('[role="contentinfo"]').length > 0;

  let hasEmptyButtonsOrLinks = false;
  $("button, a").each((_, el) => {
    const text = $(el).text().trim();
    const ariaLabel = $(el).attr("aria-label")?.trim();
    const title = $(el).attr("title")?.trim();
    const hasImgChild = $(el).find("img, svg").length > 0;

    if (!text && !ariaLabel && !title && !hasImgChild) {
      hasEmptyButtonsOrLinks = true;
    }
  });

  const textContentLength = $("body").text().replace(/\s+/g, " ").trim().length;

  // Trust Signals
  const isHttps = finalUrl.toLowerCase().startsWith("https://");

  let hasPrivacyLink = false;
  let hasContactLink = false;
  let hasTermsLink = false;

  links.each((_, el) => {
    const href = ($(el).attr("href") || "").toLowerCase();
    const text = $(el).text().toLowerCase();

    if (href.includes("privacy") || text.includes("privacy")) {
      hasPrivacyLink = true;
    }
    if (
      href.includes("contact") ||
      text.includes("contact") ||
      href.startsWith("mailto:")
    ) {
      hasContactLink = true;
    }
    if (href.includes("terms") || text.includes("terms")) {
      hasTermsLink = true;
    }
  });

  // Conversion Signals
  const formCount = $("form").length;

  let hasCallToActionLinks = false;
  let hasMailtoLinks = false;
  let hasTelLinks = false;

  const ctaKeywords = [
    "sign up",
    "get started",
    "buy",
    "purchase",
    "contact",
    "try now",
    "subscribe",
    "book",
    "demo",
    "start free",
  ];

  links.each((_, el) => {
    const href = ($(el).attr("href") || "").toLowerCase();
    const text = $(el).text().toLowerCase();

    if (href.startsWith("mailto:")) hasMailtoLinks = true;
    if (href.startsWith("tel:")) hasTelLinks = true;

    if (ctaKeywords.some((kw) => text.includes(kw) || href.includes(kw))) {
      hasCallToActionLinks = true;
    }
  });

  return {
    hasTitle,
    titleText,
    titleLength,
    hasMetaDescription,
    metaDescriptionText,
    metaDescriptionLength,
    hasCanonical,
    canonicalUrl,
    hasViewport,
    robotsDirective,
    hasH1,
    h1Count,
    h1Text,
    totalHeadingCount,
    totalImageCount,
    imagesMissingAltCount,
    totalLinkCount,
    brokenLinksDetected: 0,
    hasStructuredData,
    htmlLang,

    hasNavElement,
    hasMainElement,
    hasFooterElement,
    hasEmptyButtonsOrLinks,
    textContentLength,

    isHttps,
    hasPrivacyLink,
    hasContactLink,
    hasTermsLink,

    formCount,
    hasCallToActionLinks,
    hasMailtoLinks,
    hasTelLinks,
  };
}
