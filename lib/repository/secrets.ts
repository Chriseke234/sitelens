import { FileSensitivity } from "@/types";

/**
 * Secret pattern detectors and redaction utilities.
 * Ensures secrets, private keys, and environment tokens are never stored,
 * never logged, and never included in prompts.
 */

const SENSITIVE_FILENAME_PATTERNS = [
  /^\.env(\..+)?$/i,
  /^id_rsa/i,
  /^id_dsa/i,
  /^id_ed25519/i,
  /\.pem$/i,
  /\.key$/i,
  /\.pkcs12$/i,
  /\.pfx$/i,
  /service-account.*\.json$/i,
  /credentials\.json$/i,
];

const SECRET_CONTENT_REGEXES = [
  // Generic key assignments
  /(["']?(?:api[_-]?key|secret|token|password|auth[_-]?token|access[_-]?key|private[_-]?key)["']?\s*[:=]\s*["'])([^"'\n\r]{6,})(["'])/gi,
  // JWT tokens
  /\beyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/g,
  // Stripe live keys
  /\bsk_live_[0-9a-zA-Z]{24,}\b/g,
  // AWS Access Key ID
  /\bAKIA[0-9A-Z]{16}\b/g,
  // GitHub Personal Access Token
  /\bgh[pousr]_[0-9a-zA-Z]{36,}\b/g,
  // Private Key Headers
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  // Connection strings with password: postgresql://user:password@host/db
  /(postgres(?:ql)?:\/\/[^:]+:)([^@\s]+)(@[^\s"']+)/gi,
];

/**
 * Detects whether a file is sensitive based on filename or content.
 */
export function detectFileSensitivity(filePath: string, content?: string): FileSensitivity {
  const filename = filePath.split("/").pop() || "";

  for (const pattern of SENSITIVE_FILENAME_PATTERNS) {
    if (pattern.test(filename)) {
      return "CONFIG_SENSITIVE";
    }
  }

  if (content) {
    for (const regex of SECRET_CONTENT_REGEXES) {
      if (regex.test(content)) {
        return "POSSIBLE_SECRET";
      }
    }
  }

  return "NONE";
}

/**
 * Redacts secret values from text while preserving structural property names.
 * Example:
 * API_KEY="sk_live_12345" -> API_KEY="[REDACTED]"
 */
export function redactSecrets(text: string): {
  redactedText: string;
  secretsCount: number;
} {
  if (!text) return { redactedText: "", secretsCount: 0 };

  let count = 0;
  let result = text;

  // Redact assignment patterns: key = "value" or const API_KEY = "value" or const JWT = "value"
  result = result.replace(
    /((?:const|let|var)?\s*["']?[A-Za-z0-9_]*(?:api[_-]?key|secret|token|password|auth|jwt|private)[A-Za-z0-9_]*["']?\s*[:=]\s*["'])([^"'\n\r]{4,})(["'])/gi,
    (match, prefix, val, suffix) => {
      count++;
      return `${prefix}[REDACTED]${suffix}`;
    }
  );

  // Redact JWTs
  result = result.replace(
    /\beyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/g,
    () => {
      count++;
      return "[REDACTED_JWT]";
    }
  );

  // Redact Stripe live keys
  result = result.replace(/\bsk_live_[0-9a-zA-Z]{24,}\b/g, () => {
    count++;
    return "[REDACTED_STRIPE_KEY]";
  });

  // Redact AWS access keys
  result = result.replace(/\bAKIA[0-9A-Z]{16}\b/g, () => {
    count++;
    return "[REDACTED_AWS_KEY]";
  });

  // Redact GitHub tokens
  result = result.replace(/\bgh[pousr]_[0-9a-zA-Z]{36,}\b/g, () => {
    count++;
    return "[REDACTED_GITHUB_TOKEN]";
  });

  // Redact Private keys
  result = result.replace(
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
    () => {
      count++;
      return "[REDACTED_PRIVATE_KEY_BLOCK]";
    }
  );

  // Redact DB passwords in URLs
  result = result.replace(
    /(postgres(?:ql)?:\/\/[^:]+:)([^@\s]+)(@[^\s"']+)/gi,
    (match, prefix, pass, suffix) => {
      count++;
      return `${prefix}[REDACTED]${suffix}`;
    }
  );

  return { redactedText: result, secretsCount: count };
}
