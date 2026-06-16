import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function findAgencySettings(profile: any) {
  if (profile?.agency_id) {
    const { data } = await supabaseAdmin
      .from("agency_settings")
      .select("id, filter_config")
      .eq("id", profile.agency_id)
      .maybeSingle();
    if (data) return data;
  }

  if (profile?.company_name) {
    const { data } = await supabaseAdmin
      .from("agency_settings")
      .select("id, filter_config")
      .eq("agency_name", profile.company_name)
      .maybeSingle();
    if (data) return data;
  }

  const { data } = await supabaseAdmin
    .from("agency_settings")
    .select("id, filter_config")
    .eq("subdomain", "amaru-homes")
    .maybeSingle();

  return data;
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Session admin requise" }, { status: 401 });
    }

    const { data: authSession, error: sessionError } = await supabaseAdmin.auth.getUser(token);
    if (sessionError || !authSession.user) {
      return NextResponse.json({ error: "Session invalide" }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role, company_name, agency_id")
      .eq("id", authSession.user.id)
      .single();

    if (!profile || !["admin", "staff", "super_admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Acces admin requis" }, { status: 403 });
    }

    const body = await req.json();
    const currentSettings = await findAgencySettings(profile);
    if (!currentSettings) {
      return NextResponse.json({ error: "Configuration agence introuvable" }, { status: 404 });
    }

    const currentFilterConfig = currentSettings.filter_config || {};
    const featuredPropertyIds = Array.isArray(body.featuredPropertyIds)
      ? body.featuredPropertyIds
          .map((value: unknown) => String(value || "").trim())
          .filter(Boolean)
          .slice(0, 5)
      : [];
    const nextFilterConfig = {
      ...currentFilterConfig,
      minCommission: Math.max(0, Number(body.minCommission) || 0),
      excludedPromoters: Array.isArray(body.excludedPromoters) ? body.excludedPromoters : [],
      minPropertyPrice: Math.max(0, Number(body.minPropertyPrice) || 0),
      featuredPropertyIds,
    };

    const { error } = await supabaseAdmin
      .from("agency_settings")
      .update({ filter_config: nextFilterConfig })
      .eq("id", currentSettings.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, filterConfig: nextFilterConfig });
  } catch (err: any) {
    console.error("Erreur save-filters:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur interne" }, { status: 500 });
  }
}
