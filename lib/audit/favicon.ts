import * as cheerio from "cheerio";

/**
 * Extracts target website favicon or logo URL deterministically from HTML signals
 */
export function extractFaviconUrl(html: string, targetUrl: string): string | null {
  try {
    const $ = cheerio.load(html);

    // 1. Check <link rel="icon"> or <link rel="shortcut icon">
    const iconHref =
      $('link[rel="icon" i]').attr("href") ||
      $('link[rel="shortcut icon" i]').attr("href") ||
      $('link[rel="apple-touch-icon" i]').attr("href");

    if (iconHref) {
      return resolveAbsoluteUrl(iconHref.trim(), targetUrl);
    }

    // 2. Check Open Graph image
    const ogImage = $('meta[property="og:image" i]').attr("content");
    if (ogImage) {
      return resolveAbsoluteUrl(ogImage.trim(), targetUrl);
    }

    // 3. Fallback to domain root /favicon.ico
    const parsedUrl = new URL(targetUrl);
    return `${parsedUrl.protocol}//${parsedUrl.host}/favicon.ico`;
  } catch (err) {
    return null;
  }
}

function resolveAbsoluteUrl(pathOrUrl: string, baseUrl: string): string {
  try {
    if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
      return pathOrUrl;
    }
    const base = new URL(baseUrl);
    return new URL(pathOrUrl, base.origin).toString();
  } catch {
    return pathOrUrl;
  }
}
