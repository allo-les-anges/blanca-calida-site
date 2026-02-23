import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Initialisation du client Admin (Service Role indispensable)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { email, projectId } = await req.json();

    // 1. Génération du PIN à 4 chiffres et du mot de passe
    const pinCode = Math.floor(1000 + Math.random() * 9000).toString();
    const tempPassword = "Client" + pinCode + "!";

    // 2. Création de l'utilisateur dans l'Auth Supabase (admin.createUser ne déconnecte pas l'admin actuel)
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { role: 'client', pin_code: pinCode }
    });

    if (authError) throw authError;

    // 3. Liaison avec le projet (seulement si un projectId est fourni)
    // Si on crée le client "à vide", on saute cette étape
    if (projectId) {
      const { error: dbError } = await supabaseAdmin
        .from('suivi_chantier')
        .update({ 
          client_id: authUser.user.id, 
          nom_client: email,
          pin_code: pinCode 
        })
        .eq('id', projectId);

      if (dbError) throw dbError;
    }

    // On renvoie les accès à l'interface pour l'affichage
    return NextResponse.json({ 
      success: true, 
      pin: pinCode, 
      password: tempPassword 
    });

  } catch (error: any) {
    console.error("Erreur API Creation Client:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}