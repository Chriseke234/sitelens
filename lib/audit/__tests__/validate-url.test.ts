import { validateAndNormalizeUrl, isPrivateOrInternalIP } from "../validate-url";

export async function testURLValidation() {
  console.log("Running URL Validation & SSRF Unit Tests...");

  // Test 1: Valid HTTPS URL
  const res1 = await validateAndNormalizeUrl("https://example.com");
  if (!res1.isValid || res1.normalizedUrl !== "https://example.com/") {
    throw new Error(`Test 1 Failed: Expected valid https://example.com, got ${JSON.stringify(res1)}`);
  }

  // Test 2: Missing Protocol Normalization
  const res2 = await validateAndNormalizeUrl("example.com");
  if (!res2.isValid || res2.normalizedUrl !== "https://example.com/") {
    throw new Error(`Test 2 Failed: Expected https://example.com/, got ${res2.normalizedUrl}`);
  }

  // Test 3: Unsupported Protocol Rejection
  const res3 = await validateAndNormalizeUrl("ftp://example.com");
  if (res3.isValid) {
    throw new Error("Test 3 Failed: Expected rejection for ftp protocol.");
  }

  // Test 4: JavaScript Protocol Rejection
  const res4 = await validateAndNormalizeUrl("javascript:alert(1)");
  if (res4.isValid) {
    throw new Error("Test 4 Failed: Expected rejection for javascript: protocol.");
  }

  // Test 5: Localhost / Loopback SSRF Rejection
  const res5 = await validateAndNormalizeUrl("http://localhost:3000");
  if (res5.isValid) {
    throw new Error("Test 5 Failed: Expected rejection for localhost.");
  }

  // Test 6: 127.0.0.1 Loopback Rejection
  const res6 = await validateAndNormalizeUrl("http://127.0.0.1");
  if (res6.isValid) {
    throw new Error("Test 6 Failed: Expected rejection for 127.0.0.1.");
  }

  // Test 7: Private IP Helper Function
  if (!isPrivateOrInternalIP("127.0.0.1")) throw new Error("Private IP check failed for 127.0.0.1");
  if (!isPrivateOrInternalIP("10.0.0.1")) throw new Error("Private IP check failed for 10.0.0.1");
  if (!isPrivateOrInternalIP("172.16.0.1")) throw new Error("Private IP check failed for 172.16.0.1");
  if (!isPrivateOrInternalIP("192.168.1.1")) throw new Error("Private IP check failed for 192.168.1.1");
  if (!isPrivateOrInternalIP("169.254.169.254")) throw new Error("Private IP check failed for cloud metadata IP");

  console.log("✓ All URL Validation & SSRF Tests Passed Successfully!");
}
