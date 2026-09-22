import { analyzeMediaAuthenticity } from "../analyzer";

export function testMediaAuthenticityEngine() {
  console.log("Running Media Authenticity Engine Unit Tests...");

  // Mock buffer simulating image file with EXIF header
  const sampleExifBuffer = Buffer.from("Exif\0\0CameraModel: TestCam 2000", "utf8");
  const result1 = analyzeMediaAuthenticity(sampleExifBuffer, "test-camera-photo.jpg", "image/jpeg");

  if (!result1.fileUrl || result1.assessment === "likely_ai_generated") {
    throw new Error("Media Test 1 Failed: Expected non-AI assessment for camera EXIF image.");
  }

  // Mock buffer simulating AI model software tag
  const sampleAIBuffer = Buffer.from("Software: Midjourney v5.2", "utf8");
  const result2 = analyzeMediaAuthenticity(sampleAIBuffer, "generated-art.png", "image/png");

  if (result2.assessment !== "likely_ai_generated") {
    throw new Error(`Media Test 2 Failed: Expected likely_ai_generated, got ${result2.assessment}`);
  }

  // Mock plain buffer without headers
  const plainBuffer = Buffer.from("PLAIN IMAGE PAYLOAD", "utf8");
  const result3 = analyzeMediaAuthenticity(plainBuffer, "plain.webp", "image/webp");

  if (result3.assessment !== "inconclusive") {
    throw new Error(`Media Test 3 Failed: Expected inconclusive for plain image, got ${result3.assessment}`);
  }

  console.log("✓ Media Authenticity Unit Tests Passed Successfully!");
}
