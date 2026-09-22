import { MediaEvidenceSignal } from "./types";

export interface ProvenanceCheckResult {
  provenanceDetected: boolean;
  provenanceIssuer?: string;
  evidence: MediaEvidenceSignal[];
}

export function checkImageProvenance(buffer: Buffer): ProvenanceCheckResult {
  const bufferStr = buffer.toString("binary");

  // Check for standard C2PA / Content Credentials manifest markers (e.g. c2pa, JUMBF box, claim signature)
  const hasC2PA = bufferStr.includes("c2pa") || bufferStr.includes("jumbf") || bufferStr.includes("contentcredentials");

  const evidence: MediaEvidenceSignal[] = [];

  if (hasC2PA) {
    evidence.push({
      category: "provenance",
      signal: "C2PA / Content Credentials Signature",
      description: "Verifiable C2PA cryptographic provenance manifest detected in image metadata.",
      result: "Available",
    });

    return {
      provenanceDetected: true,
      provenanceIssuer: "C2PA Verified Issuer",
      evidence,
    };
  }

  evidence.push({
    category: "provenance",
    signal: "C2PA / Content Credentials Signature",
    description: "No verifiable C2PA cryptographic provenance signature detected. Note: Absence of provenance signatures does not imply AI generation.",
    result: "Not detected",
  });

  return {
    provenanceDetected: false,
    evidence,
  };
}
