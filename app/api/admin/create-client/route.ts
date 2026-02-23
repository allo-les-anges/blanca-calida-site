import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Client avec Service Role pour bypasser les restrictions
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { email, projectId } = await req.json();

    // 1. Génération du PIN à 4 chiffres
    const pinCode = Math.floor(1000 + Math.random() * 9000).toString();
    const tempPassword = "Client" + pinCode + "!";

    // 2. Création de l'utilisateur dans l'Auth Supabase
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { role: 'client', pin_code: pinCode }
    });

    if (authError) throw authError;

    // 3. Liaison avec le projet et stockage du PIN
    const { error: dbError } = await supabaseAdmin
      .from('suivi_chantier')
      .update({ 
        client_id: authUser.user.id, 
        nom_client: email,
        pin_code: pinCode 
      })
      .eq('id', projectId);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, pin: pinCode, password: tempPassword });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}