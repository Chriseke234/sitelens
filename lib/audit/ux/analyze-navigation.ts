import * as cheerio from "cheerio";

export interface NavigationAnalysisResult {
  hasNavElement: boolean;
  navLinkCount: number;
  emptyNavLinkCount: number;
  duplicateNavLabels: string[];
  hasContactInNav: boolean;
  hasAboutInNav: boolean;
  isExcessivelyComplex: boolean;
  navLinkTexts: string[];
  observations: string[];
}

export function analyzeNavigation(
  $: cheerio.CheerioAPI
): NavigationAnalysisResult {
  const navContainer = $("nav, [role='navigation']").first();
  const hasNavElement = navContainer.length > 0;

  const navLinks = (hasNavElement ? navContainer : $("header")).find("a");
  const navLinkCount = navLinks.length;

  let emptyNavLinkCount = 0;
  const seenLabels = new Set<string>();
  const duplicateNavLabels = new Set<string>();
  let hasContactInNav = false;
  let hasAboutInNav = false;
  const navLinkTexts: string[] = [];
  const observations: string[] = [];

  navLinks.each((_, el) => {
    const text = $(el).text().trim().toLowerCase();
    const href = ($(el).attr("href") || "").toLowerCase();

    if (!text && !$(el).attr("aria-label") && $(el).find("img, svg").length === 0) {
      emptyNavLinkCount++;
    }

    if (text) {
      navLinkTexts.push(text);
      if (seenLabels.has(text)) {
        duplicateNavLabels.add(text);
      } else {
        seenLabels.add(text);
      }
    }

    if (href.includes("contact") || text.includes("contact") || href.startsWith("mailto:")) {
      hasContactInNav = true;
    }
    if (href.includes("about") || text.includes("about")) {
      hasAboutInNav = true;
    }
  });

  const isExcessivelyComplex = navLinkCount > 15;

  if (hasNavElement) {
    observations.push(`Semantic navigation menu detected with ${navLinkCount} link(s).`);
  } else {
    observations.push("No explicit <nav> element was detected in the document header.");
  }

  if (emptyNavLinkCount > 0) {
    observations.push(`${emptyNavLinkCount} navigation link(s) appeared empty or missing label text.`);
  }

  if (duplicateNavLabels.size > 0) {
    observations.push(`Duplicate navigation link labels detected: ${Array.from(duplicateNavLabels).join(", ")}.`);
  }

  if (isExcessivelyComplex) {
    observations.push(`Navigation contains ${navLinkCount} top-level links, which may increase cognitive load.`);
  }

  return {
    hasNavElement,
    navLinkCount,
    emptyNavLinkCount,
    duplicateNavLabels: Array.from(duplicateNavLabels),
    hasContactInNav,
    hasAboutInNav,
    isExcessivelyComplex,
    navLinkTexts,
    observations,
  };
}
