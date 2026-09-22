import { runFullUXAnalysis } from "../ux";
import { HTMLSignals } from "../types";

export function testUXAnalysisEngine() {
  console.log("Running UX & Conversion Analysis Engine Unit Tests...");

  const testHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Test Business - Professional Software Platform</title>
    </head>
    <body>
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </nav>
      <main>
        <h1>Build Better Software Faster with Our Solution</h1>
        <p>Welcome to our leading platform designed for growth, easy scalability, and secure deployments.</p>
        <a href="/signup" class="btn">Get started now</a>
        
        <form action="/contact-submit" method="POST">
          <label for="email-input">Email Address</label>
          <input type="email" id="email-input" name="email" required />
          <button type="submit">Submit Request</button>
        </form>
      </main>
      <footer>
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
      </footer>
    </body>
    </html>
  `;

  const mockSignals: HTMLSignals = {
    hasTitle: true,
    titleText: "Test Business - Professional Software Platform",
    titleLength: 45,
    hasMetaDescription: true,
    metaDescriptionText: "Leading platform",
    metaDescriptionLength: 50,
    hasCanonical: true,
    canonicalUrl: "https://test.com",
    hasViewport: true,
    robotsDirective: "",
    hasH1: true,
    h1Count: 1,
    h1Text: "Build Better Software Faster with Our Solution",
    totalHeadingCount: 1,
    totalImageCount: 0,
    imagesMissingAltCount: 0,
    totalLinkCount: 5,
    brokenLinksDetected: 0,
    hasStructuredData: false,
    htmlLang: "en",
    hasNavElement: true,
    hasMainElement: true,
    hasFooterElement: true,
    hasEmptyButtonsOrLinks: false,
    textContentLength: 500,
    isHttps: true,
    hasPrivacyLink: true,
    hasContactLink: true,
    hasTermsLink: true,
    formCount: 1,
    hasCallToActionLinks: true,
    hasMailtoLinks: false,
    hasTelLinks: false,
  };

  const result = runFullUXAnalysis(testHtml, mockSignals);

  if (!result.navigation.hasNavElement) {
    throw new Error("UX Test Failed: Expected navigation element to be detected.");
  }

  if (result.cta.ctaCount < 1) {
    throw new Error("UX Test Failed: Expected CTA button 'Get started now' to be detected.");
  }

  if (result.forms.formCount !== 1) {
    throw new Error("UX Test Failed: Expected 1 form to be detected.");
  }

  if (result.forms.totalUnlabeledInputs !== 0) {
    throw new Error("UX Test Failed: Expected 0 unlabeled inputs for labeled email field.");
  }

  console.log("✓ UX & Conversion Analysis Unit Tests Passed Successfully!");
}
