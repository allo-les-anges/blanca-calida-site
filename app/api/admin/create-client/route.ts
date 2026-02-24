import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// On initialise le client en dehors du handler pour le réutiliser
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, projectId } = body;

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const pinCode = Math.floor(1000 + Math.random() * 9000).toString();
    const tempPassword = "Client" + pinCode + "!";

    // 1. Création de l'utilisateur
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { role: 'client', pin_code: pinCode }
    });

    if (authError) {
      // Si l'utilisateur existe déjà, on renvoie une erreur claire
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // 2. Liaison optionnelle
    if (projectId && authUser.user) {
      await supabaseAdmin
        .from('suivi_chantier')
        .update({ 
          client_id: authUser.user.id, 
          nom_client: email,
          pin_code: pinCode 
        })
        .eq('id', projectId);
    }

    return NextResponse.json({ 
      success: true, 
      pin: pinCode, 
      password: tempPassword 
    });

  } catch (err: any) {
    console.error("Erreur API:", err);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}