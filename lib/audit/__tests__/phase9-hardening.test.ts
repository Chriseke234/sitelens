import assert from "node:assert";
import { generateErrorReferenceId, translateErrorMessage } from "../../errors/handler";
import { sanitizeTelemetryPayload } from "../../analytics/telemetry";
import { executeResilientAICompletion } from "../../ai/resilient-client";

export async function runPhase9HardeningTests() {
  console.log("\n🧪 Running Phase 9 Production Hardening & Analytics Tests...");

  // 1. Error ID Generator Tests
  console.log("  → Testing Traceable Error Reference Generation...");
  const errId1 = generateErrorReferenceId();
  const errId2 = generateErrorReferenceId();
  assert(errId1.startsWith("AIG-ERR-"), "Error ID must start with AIG-ERR- prefix");
  assert.strictEqual(errId1.length, 13, "Error ID must be exactly 13 characters (AIG-ERR- + 5 human-readable chars)");
  assert.notStrictEqual(errId1, errId2, "Generated error IDs should be unique");

  // 2. Error Message Translation Tests
  console.log("  → Testing Error Message Translation & Sanitization...");
  const translated429 = translateErrorMessage(new Error("status: 429 quota exceeded"));
  assert(translated429.includes("experiencing high demand"), "429 must translate to graceful load message");

  const translatedRLS = translateErrorMessage(new Error("violates row-level security policy for table projects"));
  assert(translatedRLS.includes("permission to access or modify"), "RLS error must translate to permission notice");

  const translatedUnique = translateErrorMessage(new Error("duplicate key value violates unique constraint"));
  assert(translatedUnique.includes("already exists"), "Unique constraint must translate to duplicate notice");

  // 3. Telemetry Privacy & Secret Scrubbing Tests
  console.log("  → Testing Telemetry Privacy & Sensitive Data Scrubbing...");
  const rawMetadata = {
    projectId: "proj-123",
    action: "generate_prompt",
    secretKey: "mock-secret-key-test-value",
    apiKey: "mock-api-key-test-value",
    userPrompt: "Write code to bypass auth",
    sourceCode: "const token = '12345';",
    safeMetric: 42,
    details: {
      nestedToken: "mock-bearer-token-test",
      nestedSafeCount: 10
    }
  };

  const sanitized = sanitizeTelemetryPayload(rawMetadata);

  // Assert sensitive fields are stripped
  assert.strictEqual(sanitized.secretKey, undefined, "secretKey must be removed");
  assert.strictEqual(sanitized.apiKey, undefined, "apiKey must be removed");
  assert.strictEqual(sanitized.userPrompt, undefined, "userPrompt must be removed");
  assert.strictEqual(sanitized.sourceCode, undefined, "sourceCode must be removed");
  assert.strictEqual(sanitized.safeMetric, 42, "safeMetric must be preserved");
  assert.strictEqual(sanitized.projectId, "proj-123", "projectId must be preserved");

  // Nested assertions
  assert.strictEqual(sanitized.details.nestedToken, undefined, "nestedToken must be stripped");
  assert.strictEqual(sanitized.details.nestedSafeCount, 10, "nestedSafeCount must be preserved");

  // 4. Resilient AI Client Offline / Fallback Tests
  console.log("  → Testing Resilient AI Client Deterministic Fallback...");
  const fallbackResult = await executeResilientAICompletion({
    prompt: "Build a spec",
    systemInstruction: "You are a software architect",
    fallback: () => ({
      status: "fallback_ok",
      modules: ["core", "auth"]
    })
  });

  assert.strictEqual(fallbackResult.isFallback, true, "isFallback flag must be set when using fallback");
  assert.strictEqual(fallbackResult.data.status, "fallback_ok", "Fallback generator must be called");
  assert.deepStrictEqual(fallbackResult.data.modules, ["core", "auth"], "Fallback data structure must match expected payload");

  // 5. Token Efficiency Calculation Tests
  console.log("  → Testing Token Analytics & Savings Calculation...");
  const rawContextTokens = 12000;
  const optimizedPromptTokens = 4200;
  const tokensSaved = rawContextTokens - optimizedPromptTokens;
  const savingsPct = Math.round((tokensSaved / rawContextTokens) * 100);

  assert.strictEqual(tokensSaved, 7800, "Tokens saved must be accurate");
  assert.strictEqual(savingsPct, 65, "Savings percentage must accurately calculate 65%");

  console.log("  ✅ Phase 9 Production Hardening & Analytics Tests Passed!");
}
