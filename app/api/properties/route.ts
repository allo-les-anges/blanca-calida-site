import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialisation du client Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic'; // Force la récupération des données fraîches

export async function GET() {
  try {
    // 1. On récupère les données dans la table 'villas'
    const { data: properties, error } = await supabase
      .from('villas')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      console.error("Erreur Supabase:", error.message);
      return NextResponse.json({ error: "Erreur base de données" }, { status: 500 });
    }

    // 2. Sécurité : On s'assure de toujours renvoyer un tableau même si vide
    const result = properties || [];

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur API Properties:", error);
    return NextResponse.json([], { status: 500 });
  }
}import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialisation du client Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic'; // Force la récupération des données fraîches

export async function GET() {
  try {
    // 1. On récupère les données dans la table 'villas'
    const { data: properties, error } = await supabase
      .from('villas')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      console.error("Erreur Supabase:", error.message);
      return NextResponse.json({ error: "Erreur base de données" }, { status: 500 });
    }

    // 2. Sécurité : On s'assure de toujours renvoyer un tableau même si vide
    const result = properties || [];

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur API Properties:", error);
    return NextResponse.json([], { status: 500 });
  }
}