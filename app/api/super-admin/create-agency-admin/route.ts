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

async function findUserByEmail(email: string) {
  let page = 1;
  const perPage = 1000;

  while (page <= 10) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const match = data.users.find((user) => user.email?.toLowerCase().trim() === email);
    if (match) return match;
    if (data.users.length < perPage) return null;
    page += 1;
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Session super-admin requise" }, { status: 401 });
    }

    const { data: authSession, error: sessionError } = await supabaseAdmin.auth.getUser(token);
    if (sessionError || !authSession.user) {
      return NextResponse.json({ error: "Session invalide" }, { status: 401 });
    }

    const requesterEmail = authSession.user.email?.toLowerCase().trim();
    const { data: requesterProfile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", authSession.user.id)
      .single();

    if (requesterEmail !== "gaetan@amaru-homes.com" && requesterProfile?.role !== "super_admin") {
      return NextResponse.json({ error: "Acces super-admin requis" }, { status: 403 });
    }

    const body = await req.json();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");
    const companyName = String(body.companyName || "").trim();
    const prenom = String(body.prenom || "").trim();
    const nom = String(body.nom || "").trim();
    const pack = String(body.pack || "CORE").trim();

    if (!email || !companyName || !prenom || !nom) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    let user = await findUserByEmail(email);
    let reusedExistingUser = Boolean(user);

    if (!user) {
      if (password.length < 6) {
        return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caracteres" }, { status: 400 });
      }

      const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: "admin", company_name: companyName },
      });

      if (createError) throw createError;
      user = createdUser.user;
      reusedExistingUser = false;
    }

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 500 });
    }

    const pinCode = Math.floor(1000 + Math.random() * 9000).toString();
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: user.id,
        email,
        role: "admin",
        company_name: companyName,
        prenom,
        nom,
        pack,
        pin_code: pinCode,
      },
      { onConflict: "id" }
    );

    if (profileError) throw profileError;

    return NextResponse.json({
      success: true,
      pin: pinCode,
      reusedExistingUser,
    });
  } catch (err: any) {
    console.error("Erreur create-agency-admin:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur interne" }, { status: 500 });
  }
}
