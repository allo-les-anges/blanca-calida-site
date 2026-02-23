import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Force Vercel à ne pas mettre l'API en cache

export async function POST(req: Request) {
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

  try {
    const body = await req.json();
    const { email, projectId } = body;

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
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}