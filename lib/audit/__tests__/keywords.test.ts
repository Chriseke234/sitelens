import { extractKeywordIntelligence } from "../keywords";
import { extractFaviconUrl } from "../favicon";

export function testKeywordAndFaviconEngine() {
  console.log("Running SEO Keywords & Favicon Intelligence Unit Tests...");

  const sampleHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Digital Agency Services — Build & Scale Websites</title>
      <meta name="description" content="Professional digital agency providing web design, SEO optimization, and software development services." />
      <link rel="icon" href="/assets/custom-favicon.ico" />
    </head>
    <body>
      <h1>Digital Web Design & SEO Services</h1>
      <h2>Custom Software Development</h2>
      <p>We build websites and digital software for small businesses needing fast optimization and growth.</p>
    </body>
    </html>
  `;

  const targetUrl = "https://agency.com";

  // Test Favicon Extraction
  const favicon = extractFaviconUrl(sampleHtml, targetUrl);
  if (favicon !== "https://agency.com/assets/custom-favicon.ico") {
    throw new Error(`Favicon Test Failed: Expected resolved URL, got ${favicon}`);
  }

  // Test Keyword Extraction
  const intel = extractKeywordIntelligence(sampleHtml, targetUrl);
  if (!intel.detectedTopics.length || !intel.keywordOpportunities.length) {
    throw new Error("Keyword Test Failed: Expected extracted topics and keyword opportunities.");
  }

  console.log("✓ SEO Keywords & Favicon Unit Tests Passed Successfully!");
}
