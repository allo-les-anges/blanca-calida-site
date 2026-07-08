import { NextRequest, NextResponse } from "next/server";

const VALID_PROVIDERS = new Set(["cesium-basic", "google-photorealistic-3d", "fallback-2d"]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const provider = typeof body?.provider === "string" ? body.provider : "cesium-basic";

    if (!VALID_PROVIDERS.has(provider)) {
      return NextResponse.json({ success: false, error: "Invalid lifestyle provider" }, { status: 400 });
    }

    const session = {
      agency_id: typeof body?.agency_id === "string" ? body.agency_id : null,
      property_id: typeof body?.property_id === "string" ? body.property_id : null,
      provider,
      session_started_at: typeof body?.session_started_at === "string" ? body.session_started_at : new Date().toISOString(),
      monthly_limit: null,
      usage_count: null,
    };

    return NextResponse.json({
      success: true,
      session,
      quota_enforced: false,
    });
  } catch (error) {
    console.error("[lifestyle:3d-session] failed", error);
    return NextResponse.json({ success: false, error: "Could not start lifestyle 3D session" }, { status: 500 });
  }
}
