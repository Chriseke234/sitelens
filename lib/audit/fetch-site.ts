import { FetchSiteResult } from "./types";

const MAX_RESPONSE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB limit
const FETCH_TIMEOUT_MS = 10000; // 10s timeout

/**
 * Safely fetches target website HTML with timeouts, size limits, and header validation
 */
export async function fetchWebsite(url: string): Promise<FetchSiteResult> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) SiteLensBot/1.0 (+https://sitelens.io)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    clearTimeout(timeoutId);
    const responseTimeMs = Date.now() - startTime;
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      return {
        success: false,
        url,
        finalUrl: response.url || url,
        statusCode: response.status,
        responseTimeMs,
        contentType,
        error: `Website returned HTTP status code ${response.status}.`,
      };
    }

    // Inspect content type to ensure HTML response
    if (
      !contentType.includes("text/html") &&
      !contentType.includes("application/xhtml+xml") &&
      !contentType.includes("text/plain")
    ) {
      return {
        success: false,
        url,
        finalUrl: response.url || url,
        statusCode: response.status,
        responseTimeMs,
        contentType,
        error: `Target content-type is '${contentType}' instead of HTML.`,
      };
    }

    // Read stream with size limit check
    const blob = await response.blob();
    if (blob.size > MAX_RESPONSE_SIZE_BYTES) {
      return {
        success: false,
        url,
        finalUrl: response.url || url,
        statusCode: response.status,
        responseTimeMs,
        contentType,
        error: "Website HTML payload exceeds maximum size limit (5MB).",
      };
    }

    const html = await blob.text();

    return {
      success: true,
      url,
      finalUrl: response.url || url,
      statusCode: response.status,
      responseTimeMs,
      html,
      contentType,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const responseTimeMs = Date.now() - startTime;

    if (err instanceof Error && err.name === "AbortError") {
      return {
        success: false,
        url,
        finalUrl: url,
        statusCode: 0,
        responseTimeMs,
        error: "Connection timed out (10s limit). Website took too long to respond.",
      };
    }

    return {
      success: false,
      url,
      finalUrl: url,
      statusCode: 0,
      responseTimeMs,
      error: "We couldn't reach this website. Check the URL and make sure the site is publicly accessible.",
    };
  }
}
