import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 1. Initialisation UNIQUE du client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

// 2. Fonction GET UNIQUE
export async function GET() {
  try {
    const { data: properties, error } = await supabase
      .from('villas')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      console.error("Erreur Supabase:", error.message);
      return NextResponse.json({ error: "Erreur base de données" }, { status: 500 });
    }

    return NextResponse.json(properties || []);
  } catch (error) {
    console.error("Erreur API Properties:", error);
    return NextResponse.json([], { status: 500 });
  }
}