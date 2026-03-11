import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'fr';
    const supportedLangs = ['fr', 'en', 'es', 'nl', 'pl', 'ar'];
    const selectedLang = supportedLangs.includes(lang) ? lang : 'fr';

    const { data: properties, error } = await supabase
      .from('villas')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      console.error("Erreur Supabase:", error.message);
      return NextResponse.json({ error: "Erreur base de données" }, { status: 500 });
    }

    // Transformer pour renvoyer les champs dans la bonne langue
    const formatted = properties.map((p: any) => ({
      ...p,
      titre: p[`titre_${selectedLang}`] || p.titre_fr,
      description: p[`description_${selectedLang}`] || p.description_fr,
      // On peut supprimer les champs bruts pour alléger la réponse
      titre_fr: undefined,
      titre_en: undefined,
      titre_es: undefined,
      titre_nl: undefined,
      titre_pl: undefined,
      titre_ar: undefined,
      description_fr: undefined,
      description_en: undefined,
      description_es: undefined,
      description_nl: undefined,
      description_pl: undefined,
      description_ar: undefined,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Erreur API Properties:", error);
    return NextResponse.json([], { status: 500 });
  }
}