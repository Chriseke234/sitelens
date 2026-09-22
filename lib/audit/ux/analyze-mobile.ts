import * as cheerio from "cheerio";
import { LighthouseMetrics } from "../types";

export interface MobileAnalysisResult {
  hasViewportTag: boolean;
  viewportContent?: string;
  allowsUserZoom: boolean;
  hasMediaQueriesSignal: boolean;
  observations: string[];
}

export function analyzeMobile(
  $: cheerio.CheerioAPI,
  html: string,
  lighthouse?: LighthouseMetrics
): MobileAnalysisResult {
  const viewportTag = $('meta[name="viewport" i]');
  const hasViewportTag = viewportTag.length > 0;
  const viewportContent = viewportTag.attr("content")?.trim();

  let allowsUserZoom = true;
  if (viewportContent) {
    const contentLower = viewportContent.toLowerCase();
    if (contentLower.includes("user-scalable=no") || contentLower.includes("maximum-scale=1.0") || contentLower.includes("maximum-scale=1,")) {
      allowsUserZoom = false;
    }
  }

  const hasMediaQueriesSignal = html.includes("@media") || html.includes("responsive") || html.includes("flex") || html.includes("grid");

  const observations: string[] = [];

  if (hasViewportTag) {
    observations.push(`Mobile viewport meta tag detected ("${viewportContent}").`);
    if (!allowsUserZoom) {
      observations.push("Viewport content disables or restricts user pinch-to-zoom scaling.");
    }
  } else {
    observations.push("Missing viewport meta tag; mobile browsers may render page at desktop width.");
  }

  if (hasMediaQueriesSignal) {
    observations.push("Responsive CSS signals (@media / layout primitives) detected in document markup.");
  }

  if (lighthouse?.available) {
    observations.push("Automated mobile layout readiness evaluated via Lighthouse audit signals.");
  }

  return {
    hasViewportTag,
    viewportContent,
    allowsUserZoom,
    hasMediaQueriesSignal,
    observations,
  };
}
