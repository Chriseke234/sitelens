import { parseImageMetadata } from "./metadata";
import { checkImageProvenance } from "./provenance";
import { MediaAnalysisResult, MediaEvidenceSignal, AssessmentLabel, ConfidenceLevel } from "./types";

export function analyzeMediaAuthenticity(
  buffer: Buffer,
  fileUrl: string,
  mimeType: string
): MediaAnalysisResult {
  const metadata = parseImageMetadata(buffer, mimeType);
  const provenance = checkImageProvenance(buffer);

  const evidence: MediaEvidenceSignal[] = [
    ...metadata.evidence,
    ...provenance.evidence,
  ];

  let assessment: AssessmentLabel = "inconclusive";
  let confidenceLevel: ConfidenceLevel = "low";
  let confidenceScore = 50;

  // 1. Provenance signal check
  if (provenance.provenanceDetected) {
    assessment = "likely_authentic";
    confidenceLevel = "high";
    confidenceScore = 90;
    evidence.push({
      category: "detection",
      signal: "Cryptographic Provenance Confirmation",
      description: "Cryptographically signed origin metadata verified via C2PA standard.",
      result: "Positive",
    });
  } else if (metadata.softwareHeader?.includes("Generative AI")) {
    assessment = "likely_ai_generated";
    confidenceLevel = "high";
    confidenceScore = 85;
    evidence.push({
      category: "detection",
      signal: "Generative Model Software Marker",
      description: `Generative model tag (${metadata.softwareHeader}) identified in image stream.`,
      result: "Positive",
    });
  } else if (metadata.hasExifData) {
    assessment = "likely_authentic";
    confidenceLevel = "medium";
    confidenceScore = 70;
    evidence.push({
      category: "detection",
      signal: "Camera Hardware EXIF Signal",
      description: "Image structure contains EXIF camera acquisition tags.",
      result: "Positive",
    });
  } else {
    // Inconclusive state
    assessment = "inconclusive";
    confidenceLevel = "low";
    confidenceScore = 50;
    evidence.push({
      category: "detection",
      signal: "Multi-Signal Evidence Aggregation",
      description: "Evidence signals are inconclusive. Image lacks cryptographic provenance and hardware EXIF headers.",
      result: "Inconclusive",
    });
  }

  return {
    fileUrl,
    fileType: mimeType,
    fileSizeBytes: buffer.length,
    assessment,
    confidenceLevel,
    confidenceScore,
    provenanceDetected: provenance.provenanceDetected,
    evidence,
  };
}
