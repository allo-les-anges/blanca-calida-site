import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialisation du client Supabase (Vérifie tes variables d'environnement)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // On peut passer le sous-domaine en paramètre : /api/config?slug=prestige
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: "Slug d'agence manquant" }, { status: 400 });
  }

  // REQUÊTE SUPABASE : On récupère toute la ligne de l'agence
  const { data: config, error } = await supabase
    .from('agency_settings')
    .select('*')
    .eq('subdomain', slug)
    .single();

  if (error || !config) {
    return NextResponse.json({ error: "Agence non trouvée" }, { status: 404 });
  }

  // On renvoie la configuration complète
  return NextResponse.json(config);
}