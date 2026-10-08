import { testURLValidation } from "./validate-url.test";
import { testScoreCalculations } from "./calculate-scores.test";
import { testUXAnalysisEngine } from "./ux-analysis.test";
import { testAIReportSchema } from "./ai-report.test";
import { testMediaAuthenticityEngine } from "../../media/__tests__/media-analysis.test";
import { testKeywordAndFaviconEngine } from "./keywords.test";
import { testPhase6RepositoryIntelligence } from "../../repository/__tests__/repository-intelligence.test";
import { runPhase7AuditTests } from "./phase7-audit.test";
import { runPhase8VerificationTests } from "./phase8-verification.test";
import { runPhase9HardeningTests } from "./phase9-hardening.test";

async function main() {
  console.log("==========================================");
  console.log("   Aigenstra Master Test Suite            ");
  console.log("==========================================");

  try {
    await testURLValidation();
    testScoreCalculations();
    testUXAnalysisEngine();
    testAIReportSchema();
    testMediaAuthenticityEngine();
    testKeywordAndFaviconEngine();
    await testPhase6RepositoryIntelligence();
    runPhase7AuditTests();
    runPhase8VerificationTests();
    await runPhase9HardeningTests();
    console.log("==========================================");
    console.log(" SUCCESS: All Phases 1-9 Unit Tests Passed! ");
    console.log("==========================================");
  } catch (err) {
    console.error("❌ Test Suite Failure:", err);
    process.exit(1);
  }
}

main();
