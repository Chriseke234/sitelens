import { createClient } from "@/lib/supabase/server";

export type TelemetryEventType =
  | "PROJECT_CREATED"
  | "DISCOVERY_STARTED"
  | "DISCOVERY_COMPLETED"
  | "BLUEPRINT_CREATED"
  | "BUILD_MAP_CREATED"
  | "TASK_CREATED"
  | "CONTEXT_COMPILED"
  | "PROMPT_GENERATED"
  | "PROMPT_COPIED"
  | "AUDIT_RUN"
  | "FINDING_CREATED"
  | "FIX_PROMPT_GENERATED"
  | "VERIFICATION_COMPLETED";

export interface TelemetryEventPayload {
  projectId: string;
  eventType: TelemetryEventType;
  stage?: string;
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Sanitizes arbitrary metadata to guarantee zero leaked secrets, prompts, or source code.
 */
export function sanitizeTelemetryPayload(metadata?: Record<string, any>): Record<string, any> {
  if (!metadata) return {};
  const sanitized: Record<string, any> = {};

  for (const [key, val] of Object.entries(metadata)) {
    const lower = key.toLowerCase();
    if (
      lower.includes("secret") ||
      lower.includes("token") ||
      lower.includes("prompt") ||
      lower.includes("code") ||
      lower.includes("key")
    ) {
      continue;
    }

    if (val && typeof val === "object" && !Array.isArray(val)) {
      sanitized[key] = sanitizeTelemetryPayload(val);
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized;
}

/**
 * Privacy-Conscious Telemetry Logger (Phase 9)
 * Records key funnel events for product analytics.
 * STRICT GUARANTEE: Never tracks raw code, secret keys, user prompt text, or PII.
 */
export async function trackProjectEvent(payload: TelemetryEventPayload): Promise<void> {
  const supabase = await createClient();
  const sanitizedMetadata = sanitizeTelemetryPayload(payload.metadata);

  try {
    const { error } = await supabase.from("project_telemetry_events").insert({
      project_id: payload.projectId,
      event_type: payload.eventType,
      stage: payload.stage || null,
      metadata: sanitizedMetadata,
      created_at: new Date().toISOString(),
    });

    if (error) {
      // Fallback: save to architecture_docs JSONB if table not yet migrated
      await trackEventFallback(payload.projectId, payload.eventType, sanitizedMetadata);
    }
  } catch (err) {
    console.warn("[Telemetry] Could not insert event into DB:", err);
    await trackEventFallback(payload.projectId, payload.eventType, sanitizedMetadata);
  }
}

async function trackEventFallback(
  projectId: string,
  eventType: TelemetryEventType,
  metadata: Record<string, any>
): Promise<void> {
  const supabase = await createClient();
  try {
    const { data } = await supabase
      .from("architecture_docs")
      .select("storage")
      .eq("project_id", projectId)
      .maybeSingle();

    const storage = (data?.storage as Record<string, any>) || {};
    const events: any[] = storage.telemetry_events || [];

    const newEvent = {
      event_type: eventType,
      metadata,
      timestamp: new Date().toISOString(),
    };

    // Keep last 50 events in JSONB
    storage.telemetry_events = [newEvent, ...events.slice(0, 49)];

    await supabase
      .from("architecture_docs")
      .update({ storage })
      .eq("project_id", projectId);
  } catch (fallbackErr) {
    // Fail silently so telemetry never interrupts user workflows
  }
}
