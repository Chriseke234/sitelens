/**
 * Server-Side Gemini API Client Utility
 * Ensures API key security - never exposed to browser context.
 */

export function getGeminiApiKey(): string | null {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || null;
}

export function isAIConfigured(): boolean {
  const key = getGeminiApiKey();
  return Boolean(key && key.trim() !== "");
}
