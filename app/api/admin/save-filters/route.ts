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

async function getAdminProfile(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return { error: NextResponse.json({ error: "Session admin requise" }, { status: 401 }) };
  }

  const { data: authSession, error: sessionError } = await supabaseAdmin.auth.getUser(token);
  if (sessionError || !authSession.user) {
    return { error: NextResponse.json({ error: "Session invalide" }, { status: 401 }) };
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role, company_name, agency_id")
    .eq("id", authSession.user.id)
    .single();

  if (!profile || !["admin", "staff", "super_admin"].includes(profile.role)) {
    return { error: NextResponse.json({ error: "Acces admin requis" }, { status: 403 }) };
  }

  return { profile };
}

export async function GET(req: Request) {
  try {
    const { profile, error: authError } = await getAdminProfile(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    if (searchParams.get("featuredProperties") !== "true") {
      return NextResponse.json({ error: "Requete invalide" }, { status: 400 });
    }

    const reference = (searchParams.get("reference") || "").trim().replace(/[,%]/g, "");
    let query = supabaseAdmin
      .from("villas")
      .select("id,id_externe,ref,titre_fr,town,ville,price,type,updated_at")
      .eq("is_excluded", false)
      .not("id_externe", "is", null);

    if (reference) {
      query = query
        .or(`ref.ilike.%${reference}%,id_externe.ilike.%${reference}%`)
        .order("updated_at", { ascending: false })
        .limit(25);
    } else {
      query = query
        .order("updated_at", { ascending: false })
        .limit(10);
    }

    const { data, error: villasError } = await query;

    if (villasError) {
      return NextResponse.json({ error: villasError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      properties: data || [],
      mode: reference ? "reference" : "recent",
      agencyId: profile?.agency_id || null,
    });
  } catch (err: any) {
    console.error("Erreur featured-properties:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur interne" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { profile, error } = await getAdminProfile(req);
    if (error) return error;

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
          .slice(0, 6)
      : [];
    const nextFilterConfig = {
      ...currentFilterConfig,
      minCommission: Math.max(0, Number(body.minCommission) || 0),
      excludedPromoters: Array.isArray(body.excludedPromoters) ? body.excludedPromoters : [],
      minPropertyPrice: Math.max(0, Number(body.minPropertyPrice) || 0),
      featuredPropertyIds,
    };

    const { error: updateError } = await supabaseAdmin
      .from("agency_settings")
      .update({ filter_config: nextFilterConfig })
      .eq("id", currentSettings.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, filterConfig: nextFilterConfig });
  } catch (err: any) {
    console.error("Erreur save-filters:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur interne" }, { status: 500 });
  }
}
