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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
      .select("role, company_name, email")
      .eq("id", authSession.user.id)
      .single();

    if (!profile || !["admin", "staff", "super_admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Acces admin requis" }, { status: 403 });
    }

    const body = await req.json();
    const email = String(body.email || "").toLowerCase().trim();
    const firstName = String(body.firstName || "").trim();
    const projectName = String(body.projectName || "").trim();
    const pin = String(body.pin || "").trim();
    const agencyName = String(body.agencyName || profile.company_name || "Amaru Homes").trim();

    if (!email || !pin) {
      return NextResponse.json({ error: "Email client et code PIN requis" }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM || process.env.MAIL_FROM;

    if (!resendApiKey || !from) {
      return NextResponse.json(
        { error: "Service email non configure: RESEND_API_KEY et EMAIL_FROM sont requis" },
        { status: 500 }
      );
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://blanca-calida-site.vercel.app";
    const accessUrl = `${origin}/login`;
    const safeFirstName = escapeHtml(firstName);
    const safeProjectName = escapeHtml(projectName);
    const safeAgencyName = escapeHtml(agencyName);
    const safePin = escapeHtml(pin);
    const safeAccessUrl = escapeHtml(accessUrl);
    const greeting = safeFirstName ? `Bonjour ${safeFirstName},` : "Bonjour,";

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: email,
        subject: `Votre acces client ${agencyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; background:#FAFAFA; color:#171716; padding:32px;">
            <div style="max-width:620px; margin:0 auto; background:#F2EFEA; border:1px solid #D8C9B6; padding:32px;">
              <p style="font-size:16px; line-height:1.6;">${greeting}</p>
              <p style="font-size:16px; line-height:1.6;">
                Votre espace personnel ${safeAgencyName} est pret${safeProjectName ? ` pour le dossier <strong>${safeProjectName}</strong>` : ""}.
              </p>
              <p style="font-size:14px; text-transform:uppercase; letter-spacing:0.18em; color:#171716; margin-top:28px;">
                Code PIN de connexion
              </p>
              <p style="font-size:34px; font-weight:700; letter-spacing:0.24em; margin:12px 0 28px;">${safePin}</p>
              <a href="${safeAccessUrl}" style="display:inline-block; background:#171716; color:#FAFAFA; text-decoration:none; padding:14px 22px; font-size:12px; letter-spacing:0.16em; text-transform:uppercase;">
                Acceder a mon espace
              </a>
              <p style="font-size:13px; line-height:1.6; color:#171716; margin-top:28px;">
                Conservez ce code. Il vous permettra de suivre votre projet dans votre espace personnel.
              </p>
            </div>
          </div>
        `,
        text: `${greeting}\n\nVotre espace personnel ${agencyName} est pret${projectName ? ` pour le dossier ${projectName}` : ""}.\n\nCode PIN de connexion: ${pin}\n\nAcces: ${accessUrl}\n`,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      return NextResponse.json({ error: errorText || "Erreur lors de l'envoi email" }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erreur send-client-pin:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur interne" }, { status: 500 });
  }
}
