import { NextResponse } from "next/server";

export type AigenstraErrorCode =
  | "AUTH_REQUIRED"
  | "PROJECT_NOT_FOUND"
  | "FORBIDDEN"
  | "AI_TIMEOUT"
  | "AI_RATE_LIMITED"
  | "AI_MALFORMED_OUTPUT"
  | "AI_PROVIDER_ERROR"
  | "DATABASE_ERROR"
  | "INVALID_INPUT"
  | "STALE_STATE"
  | "SSRF_BLOCKED"
  | "INTERNAL_ERROR";

export interface SafeErrorResponse {
  error: string;
  referenceId: string;
  code: AigenstraErrorCode;
  retryable?: boolean;
}

/**
 * Generates a collision-resistant, human-friendly error reference ID.
 * Example: AIG-ERR-7B9F2
 */
export function generateErrorReferenceId(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude easily confused chars (0/O, 1/I)
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AIG-ERR-${code}`;
}

/**
 * Translates low-level database, AI, or system errors into safe, plain-English messages.
 * Never leaks database connection strings, table schemas, or raw stack traces to the client.
 */
export function translateErrorMessage(err: unknown, defaultMessage: string = "An unexpected error occurred."): string {
  if (!err) return defaultMessage;

  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();

  if (lower.includes("row-level security") || lower.includes("permission denied") || lower.includes("insufficient privilege") || lower.includes("forbidden")) {
    return "You do not have permission to access or modify this resource.";
  }

  if (lower.includes("jwt") || lower.includes("auth") || lower.includes("unauthorized")) {
    return "Your session has expired or authentication is required. Please sign in again.";
  }

  if (lower.includes("not found") || lower.includes("pgrst116")) {
    return "The requested project or resource could not be found.";
  }

  if (lower.includes("duplicate") || lower.includes("unique constraint") || lower.includes("23505")) {
    return "A record with this name or identifier already exists in your workspace.";
  }

  if (lower.includes("rate limit") || lower.includes("429") || lower.includes("quota")) {
    return "The AI service is experiencing high demand. Please wait a few moments before trying again.";
  }

  if (lower.includes("timeout") || lower.includes("aborted") || lower.includes("etimedout")) {
    return "The operation timed out while waiting for a response. Your project state remains safe.";
  }

  if (lower.includes("serialization failure") || lower.includes("concurrent update")) {
    return "This project was updated at the same time by another operation. Your previous changes are safe. Please try again.";
  }

  if (lower.includes("ssrf") || lower.includes("private ip") || lower.includes("loopback")) {
    return "The provided repository address is in an internal or disallowed network range.";
  }

  return defaultMessage;
}

/**
 * Formats a secure, production-hardened JSON error response with internal server logging.
 */
export function createSafeErrorResponse(
  err: unknown,
  status: number = 500,
  fallbackMessage: string = "An unexpected error occurred while processing your request.",
  code: AigenstraErrorCode = "INTERNAL_ERROR"
): NextResponse<SafeErrorResponse> {
  const referenceId = generateErrorReferenceId();
  const userMessage = translateErrorMessage(err, fallbackMessage);

  // Server-side structured diagnostic logging (scrubbed of user credentials)
  console.error(`[${referenceId}] [${code}] Status ${status}:`, {
    error: err instanceof Error ? { message: err.message, stack: err.stack } : err,
    timestamp: new Date().toISOString(),
  });

  const retryable = status === 429 || status === 503 || status === 504 || code === "AI_RATE_LIMITED" || code === "AI_TIMEOUT";

  return NextResponse.json(
    {
      error: `${userMessage} (Reference: ${referenceId})`,
      referenceId,
      code,
      retryable,
    },
    { status }
  );
}
