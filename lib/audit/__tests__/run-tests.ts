import { testURLValidation } from "./validate-url.test";
import { testScoreCalculations } from "./calculate-scores.test";
import { testUXAnalysisEngine } from "./ux-analysis.test";
import { testAIReportSchema } from "./ai-report.test";
import { testMediaAuthenticityEngine } from "../../media/__tests__/media-analysis.test";
import { testKeywordAndFaviconEngine } from "./keywords.test";

async function main() {
  console.log("==========================================");
  console.log("   SiteLens Phases 1-17 Master Test Suite  ");
  console.log("==========================================");

  try {
    await testURLValidation();
    testScoreCalculations();
    testUXAnalysisEngine();
    testAIReportSchema();
    testMediaAuthenticityEngine();
    testKeywordAndFaviconEngine();
    console.log("==========================================");
    console.log(" SUCCESS: All Phases 1-17 Unit Tests Passed! ");
    console.log("==========================================");
  } catch (err) {
    console.error("❌ Test Suite Failure:", err);
    process.exit(1);
  }
}

main();
