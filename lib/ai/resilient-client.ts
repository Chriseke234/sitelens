import { getGeminiApiKey } from "./client";

export interface ResilientCompletionOptions<T> {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  schemaValidator?: (parsed: any) => parsed is T;
  fallback: () => T;
  timeoutMs?: number;
}

export interface ResilientCompletionResult<T> {
  data: T;
  isFallback: boolean;
  attempts: number;
  error?: string;
}

/**
 * Resilient AI Completion Helper (Phase 9)
 * Handles timeouts (25s AbortController), bounded retries with backoff on 429/503,
 * structured JSON validation, and deterministic fallbacks.
 */
export async function executeResilientAICompletion<T>({
  prompt,
  systemInstruction,
  temperature = 0.2,
  schemaValidator,
  fallback,
  timeoutMs = 25000,
}: ResilientCompletionOptions<T>): Promise<ResilientCompletionResult<T>> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return {
      data: fallback(),
      isFallback: true,
      attempts: 0,
      error: "Gemini API key is not configured; using deterministic fallback.",
    };
  }

  const maxAttempts = 2;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      if (systemInstruction) {
        contents.push({
          role: "user",
          parts: [{ text: `System Directive: ${systemInstruction}\n\nTask: ${prompt}` }],
        });
      } else {
        contents.push({
          role: "user",
          parts: [{ text: prompt }],
        });
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents,
            generationConfig: {
              response_mime_type: "application/json",
              temperature,
            },
          }),
        }
      );

      clearTimeout(timeoutTimer);

      if (!res.ok) {
        const errorText = await res.text().catch(() => "Unknown error");
        const status = res.status;

        // If rate limited or server temporarily unavailable, wait and retry once
        if ((status === 429 || status === 503) && attempt < maxAttempts) {
          console.warn(`[AI Client] Status ${status} encountered on attempt ${attempt}. Backing off 1.5s...`);
          await new Promise((resolve) => setTimeout(resolve, 1500));
          continue;
        }

        throw new Error(`AI Provider returned HTTP ${status}: ${errorText.slice(0, 150)}`);
      }

      const resData = await res.json();
      const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error("AI Provider returned an empty completion content.");
      }

      const parsed = JSON.parse(rawText);

      // Validate schema if validator provided
      if (schemaValidator && !schemaValidator(parsed)) {
        throw new Error("AI completion output did not conform to the required schema.");
      }

      return {
        data: parsed as T,
        isFallback: false,
        attempts: attempt,
      };
    } catch (err: any) {
      clearTimeout(timeoutTimer);
      lastError = err;

      if (err.name === "AbortError") {
        console.warn(`[AI Client] Call timed out after ${timeoutMs}ms on attempt ${attempt}.`);
      } else {
        console.warn(`[AI Client] Completion failure on attempt ${attempt}:`, err?.message || err);
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  // Gracefully return deterministic fallback
  console.warn("[AI Client] All completion attempts exhausted. Engaging deterministic offline fallback.");
  return {
    data: fallback(),
    isFallback: true,
    attempts: maxAttempts,
    error: lastError instanceof Error ? lastError.message : String(lastError),
  };
}
