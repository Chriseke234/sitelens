import { MediaEvidenceSignal } from "./types";

export interface ExtractedMetadata {
  fileSizeBytes: number;
  mimeType: string;
  hasExifData: boolean;
  creationDate?: string;
  cameraModel?: string;
  softwareHeader?: string;
  evidence: MediaEvidenceSignal[];
}

export function parseImageMetadata(
  buffer: Buffer,
  mimeType: string
): ExtractedMetadata {
  const fileSizeBytes = buffer.length;
  const evidence: MediaEvidenceSignal[] = [];

  let hasExifData = false;
  let cameraModel: string | undefined = undefined;
  let softwareHeader: string | undefined = undefined;

  const bufferStr = buffer.toString("binary");

  // Check for common EXIF headers (e.g. Exif\0\0 or APP1 markers in JPEG)
  if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
    if (bufferStr.includes("Exif\0\0") || bufferStr.includes("Exif")) {
      hasExifData = true;
    }
  }

  // Check for software headers (e.g. Photoshop, Midjourney, Stable Diffusion, DALL-E, Adobe)
  if (bufferStr.includes("Midjourney") || bufferStr.includes("Stable Diffusion") || bufferStr.includes("DALL-E")) {
    softwareHeader = "Generative AI Model Tag";
  } else if (bufferStr.includes("Photoshop")) {
    softwareHeader = "Adobe Photoshop";
  } else if (bufferStr.includes("GIMP")) {
    softwareHeader = "GIMP";
  }

  if (hasExifData) {
    evidence.push({
      category: "metadata",
      signal: "EXIF Creation Metadata",
      description: "EXIF camera header metadata tags detected in image structure.",
      result: "Available",
    });
  } else {
    evidence.push({
      category: "metadata",
      signal: "EXIF Creation Metadata",
      description: "No EXIF camera metadata tags detected in image payload. Note: Missing metadata does not prove an image is AI-generated.",
      result: "Not detected",
    });
  }

  if (softwareHeader) {
    evidence.push({
      category: "metadata",
      signal: "Software Metadata Tag",
      description: `Software signature tag detected: ${softwareHeader}.`,
      result: "Available",
    });
  }

  return {
    fileSizeBytes,
    mimeType,
    hasExifData,
    cameraModel,
    softwareHeader,
    evidence,
  };
}
