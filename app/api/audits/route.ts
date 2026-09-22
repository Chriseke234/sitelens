import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateAndNormalizeUrl, executeWebsiteAudit } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user server-side
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to run website audits." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawUrl = body?.url;

    if (!rawUrl || typeof rawUrl !== "string") {
      return NextResponse.json(
        { error: "Please enter a valid website URL." },
        { status: 400 }
      );
    }

    // 2. Validate URL & SSRF protection
    const validation = await validateAndNormalizeUrl(rawUrl);
    if (!validation.isValid || !validation.normalizedUrl) {
      return NextResponse.json(
        { error: validation.error || "Invalid website URL format." },
        { status: 400 }
      );
    }

    const normalizedUrl = validation.normalizedUrl;

    // 3. Insert initial 'queued' audit record belonging to authenticated user
    const { data: auditRecord, error: insertError } = await supabase
      .from("audits")
      .insert({
        user_id: user.id,
        url: normalizedUrl,
        status: "queued",
      })
      .select("id")
      .single();

    if (insertError || !auditRecord) {
      console.error("Failed to insert audit record:", insertError);
      return NextResponse.json(
        { error: "Failed to initialize audit session. Please try again." },
        { status: 500 }
      );
    }

    const auditId = auditRecord.id;

    // 4. Synchronously execute audit for Phase 4 MVP
    const auditResult = await executeWebsiteAudit(auditId, normalizedUrl);

    return NextResponse.json({
      auditId,
      url: normalizedUrl,
      status: auditResult.status,
      success: auditResult.success,
    });
  } catch (err) {
    console.error("Audit API handler error:", err);
    return NextResponse.json(
      { error: "An unexpected server error occurred while processing the audit." },
      { status: 500 }
    );
  }
}
