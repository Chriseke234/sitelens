import { createClient } from "@/lib/supabase/server";

export interface ScreenshotResult {
  desktopScreenshotUrl: string | null;
  mobileScreenshotUrl: string | null;
}

/**
 * Captures desktop and mobile visual preview screenshots for an audited URL safely
 */
export async function captureAuditScreenshots(
  auditId: string,
  userId: string,
  targetUrl: string
): Promise<ScreenshotResult> {
  let desktopScreenshotUrl: string | null = null;
  let mobileScreenshotUrl: string | null = null;

  try {
    // Generate Microlink preview screenshot URLs as lightweight serverless browser renderer
    const desktopApiUrl = `https://api.microlink.io/?url=${encodeURIComponent(targetUrl)}&screenshot=true&meta=false&viewport.width=1280&viewport.height=800`;
    const mobileApiUrl = `https://api.microlink.io/?url=${encodeURIComponent(targetUrl)}&screenshot=true&meta=false&viewport.width=375&viewport.height=812&viewport.isMobile=true`;

    const [desktopRes, mobileRes] = await Promise.all([
      fetch(desktopApiUrl, { method: "GET", headers: { Accept: "application/json" } }).catch(() => null),
      fetch(mobileApiUrl, { method: "GET", headers: { Accept: "application/json" } }).catch(() => null),
    ]);

    if (desktopRes && desktopRes.ok) {
      const data = await desktopRes.json();
      if (data.data?.screenshot?.url) {
        desktopScreenshotUrl = data.data.screenshot.url;
      }
    }

    if (mobileRes && mobileRes.ok) {
      const data = await mobileRes.json();
      if (data.data?.screenshot?.url) {
        mobileScreenshotUrl = data.data.screenshot.url;
      }
    }

    // Persist screenshot URLs to audits table in Supabase
    if (desktopScreenshotUrl || mobileScreenshotUrl) {
      const supabase = await createClient();
      await supabase
        .from("audits")
        .update({
          desktop_screenshot_url: desktopScreenshotUrl,
          mobile_screenshot_url: mobileScreenshotUrl,
        })
        .eq("id", auditId);
    }
  } catch (err) {
    console.warn("Visual screenshot capture error:", err);
  }

  return {
    desktopScreenshotUrl,
    mobileScreenshotUrl,
  };
}
