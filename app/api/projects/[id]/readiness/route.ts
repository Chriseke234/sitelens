import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_CHECKLIST_ITEMS = [
  // Product
  { category: "product", item_key: "prd_core_reqs", title: "Core functional requirements (FR-xxx) implemented" },
  { category: "product", item_key: "prd_mvp_scope", title: "MVP launch scope verified against anti-bloat non-goals" },
  { category: "product", item_key: "prd_critical_journeys", title: "Critical user journey paths tested end-to-end" },
  { category: "product", item_key: "prd_personas_fit", title: "Target user personas & onboarding value verified" },

  // UX
  { category: "ux", item_key: "ux_loading_states", title: "Explicit loading states & skeleton loaders for all mutations" },
  { category: "ux", item_key: "ux_empty_states", title: "Helpful empty states with clear calls-to-action" },
  { category: "ux", item_key: "ux_error_states", title: "Graceful error banners & retry feedback on network drops" },
  { category: "ux", item_key: "ux_mobile_responsive", title: "Fluid responsiveness verified on mobile (360px) & tablet viewports" },

  // Engineering
  { category: "engineering", item_key: "eng_arch_review", title: "Next.js App Router architecture reviewed & clean separation" },
  { category: "engineering", item_key: "eng_db_schema", title: "Database schema entity relationships & indexes configured" },
  { category: "engineering", item_key: "eng_apis_typed", title: "API route handlers return typed { data, error } responses" },
  { category: "engineering", item_key: "eng_typecheck", title: "TypeScript passes with 0 compiler errors (tsc --noEmit)" },

  // Security
  { category: "security", item_key: "sec_authn", title: "Supabase Auth session persistence & password recovery active" },
  { category: "security", item_key: "sec_authz_idor", title: "Server-side ownership verification enforced (zero IDOR)" },
  { category: "security", item_key: "sec_rls_active", title: "PostgreSQL Row Level Security (RLS) enabled on all tables" },
  { category: "security", item_key: "sec_input_sanitization", title: "Zod payload sanitization & untrusted data boundaries active" },

  // Performance
  { category: "performance", item_key: "perf_image_opt", title: "Images optimized with next/image and responsive sizing" },
  { category: "performance", item_key: "perf_unindexed_queries", title: "Database queries indexed for foreign keys and status filters" },
  { category: "performance", item_key: "perf_bundle_size", title: "Client bundle sizes verified with code splitting" },
  { category: "performance", item_key: "perf_fast_ttfb", title: "Sub-second initial time-to-first-byte (TTFB)" },

  // SEO
  { category: "seo", item_key: "seo_metadata", title: "Dynamic meta tags, OpenGraph images, and Twitter cards configured" },
  { category: "seo", item_key: "seo_sitemap", title: "Automatic XML sitemap and robots.txt configured" },
  { category: "seo", item_key: "seo_semantic_markup", title: "Semantic HTML5 structure (header, main, nav, section, footer)" },
  { category: "seo", item_key: "seo_schema_org", title: "Schema.org structured JSON-LD data integrated" },
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { data: existingItems } = await supabase
      .from("production_checklists")
      .select("*")
      .eq("project_id", id);

    if (!existingItems || existingItems.length === 0) {
      // Auto seed default items
      const seedData = DEFAULT_CHECKLIST_ITEMS.map((item) => ({
        project_id: id,
        category: item.category,
        item_key: item.item_key,
        title: item.title,
        is_checked: false,
      }));

      await supabase.from("production_checklists").insert(seedData);

      const { data: seededItems } = await supabase
        .from("production_checklists")
        .select("*")
        .eq("project_id", id);

      return NextResponse.json({ checklist: seededItems || [] });
    }

    return NextResponse.json({ checklist: existingItems });
  } catch (err) {
    console.error("Readiness GET error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { itemKey, isChecked, notes } = body;

    if (!itemKey) {
      return NextResponse.json({ error: "itemKey is required." }, { status: 400 });
    }

    const { data: updatedItem, error } = await supabase
      .from("production_checklists")
      .update({
        is_checked: isChecked,
        notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq("project_id", id)
      .eq("item_key", itemKey)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to update checklist item." }, { status: 500 });
    }

    return NextResponse.json({ item: updatedItem });
  } catch (err) {
    console.error("Readiness POST error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}
