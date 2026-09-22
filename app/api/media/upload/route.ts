import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeMediaAuthenticity } from "@/lib/media/analyzer";
import { saveMediaScanResults } from "@/lib/media/save-scan";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided for analysis." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported image format. Allowed formats: JPEG, PNG, WebP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 10MB size limit." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Run multi-signal authenticity analysis
    const fileUrl = file.name;
    const analysis = analyzeMediaAuthenticity(buffer, fileUrl, file.type);

    // Save scan results to Supabase
    const saved = await saveMediaScanResults(user.id, analysis);

    if (!saved.success || !saved.scanId) {
      return NextResponse.json({ error: saved.error || "Failed to save media scan." }, { status: 500 });
    }

    return NextResponse.json({ success: true, scanId: saved.scanId }, { status: 200 });
  } catch (err: any) {
    console.error("POST /api/media/upload error:", err);
    return NextResponse.json({ error: "Internal server error during media scan." }, { status: 500 });
  }
}
