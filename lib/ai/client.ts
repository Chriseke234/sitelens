/**
 * Server-Side OpenAI Client Utility
 * Ensures API key security - never exposed to browser context.
 */

export function getOpenAIApiKey(): string | null {
  return process.env.OPENAI_API_KEY || null;
}

export function isAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== "");
}
