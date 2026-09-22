import { URLValidationResult } from "./types";
import dns from "dns";

/**
 * Checks whether an IP address belongs to private/internal/loopback/metadata ranges
 */
export function isPrivateOrInternalIP(ip: string): boolean {
  // Normalize IPv6 mapped IPv4 addresses (e.g. ::ffff:127.0.0.1)
  const normalizedIp = ip.replace(/^::ffff:/i, "");

  // IPv4 checks
  if (normalizedIp.includes(".")) {
    const parts = normalizedIp.split(".").map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) return true;

    const [a, b] = parts;

    // 0.0.0.0/8
    if (a === 0) return true;
    // 127.0.0.0/8 (Loopback)
    if (a === 127) return true;
    // 10.0.0.0/8 (Private)
    if (a === 10) return true;
    // 172.16.0.0/12 (Private)
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16 (Private)
    if (a === 192 && b === 168) return true;
    // 169.254.0.0/16 (Link-local & Cloud Metadata 169.254.169.254)
    if (a === 169 && b === 254) return true;

    return false;
  }

  // IPv6 checks
  const lowerIp = normalizedIp.toLowerCase();
  if (
    lowerIp === "::1" ||
    lowerIp === "::" ||
    lowerIp.startsWith("fe80:") ||
    lowerIp.startsWith("fc00:") ||
    lowerIp.startsWith("fd00:")
  ) {
    return true;
  }

  return false;
}

/**
 * Validates and normalizes target URL, enforcing protocol checks & SSRF protection
 */
export async function validateAndNormalizeUrl(
  inputUrl: string
): Promise<URLValidationResult> {
  if (!inputUrl || typeof inputUrl !== "string") {
    return { isValid: false, error: "Please enter a valid website URL." };
  }

  let trimmed = inputUrl.trim();

  // Add default https:// protocol if missing
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmed);
  } catch {
    return {
      isValid: false,
      error: "Invalid URL structure. Example: https://example.com",
    };
  }

  // Enforce HTTP / HTTPS protocol
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return {
      isValid: false,
      error: "Only HTTP and HTTPS website protocols are supported.",
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Reject explicit localhost or metadata hostnames
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "metadata.google.internal"
  ) {
    return {
      isValid: false,
      error: "Internal and private network targets cannot be audited.",
    };
  }

  // Perform DNS resolution for SSRF protection
  try {
    const addresses = await dns.promises.lookup(hostname, { all: true });

    if (addresses && addresses.length > 0) {
      for (const addr of addresses) {
        if (isPrivateOrInternalIP(addr.address)) {
          return {
            isValid: false,
            error: "Internal or private network targets cannot be audited.",
          };
        }
      }
    }
  } catch {
    // If DNS resolution fails due to environment network policy, check public domain format
    const isPublicDomainFormat = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(hostname);
    if (!isPublicDomainFormat) {
      return {
        isValid: false,
        error: "Unable to resolve website domain name. Please check the URL.",
      };
    }
  }

  return {
    isValid: true,
    normalizedUrl: parsedUrl.href,
  };
}
