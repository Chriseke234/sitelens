import { NextRequest, NextResponse } from "next/server";
import { getOrGenerateAIReport } from "@/lib/ai/audit-report";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: auditId } = await params;
    if (!auditId) {
      return NextResponse.json({ error: "Missing audit ID." }, { status: 400 });
    }

    const result = await getOrGenerateAIReport(auditId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result.data }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/audits/[id]/ai-report error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: auditId } = await params;
    if (!auditId) {
      return NextResponse.json({ error: "Missing audit ID." }, { status: 400 });
    }

    const result = await getOrGenerateAIReport(auditId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result.data }, { status: 200 });
  } catch (err: any) {
    console.error("POST /api/audits/[id]/ai-report error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
