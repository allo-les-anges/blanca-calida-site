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
    
    // 1. Paramètres de langue
    const lang = searchParams.get('lang') || 'fr';
    const supportedLangs = ['fr', 'en', 'es', 'nl', 'pl', 'ar'];
    const selectedLang = supportedLangs.includes(lang) ? lang : 'fr';

    // 2. Nouveaux paramètres de filtrage admin
    const minCommission = searchParams.get('minCommission');
    const excludedDevelopments = searchParams.get('excluded'); // Format attendu: "Promotion A,Promotion B"

    // Initialisation de la requête Supabase
    let query = supabase
      .from('villas')
      .select('*')
      .eq('is_excluded', false); // On exclut d'office les biens marqués "is_excluded" manuellement

    // 3. Application du filtre de commission minimale
    if (minCommission) {
      const minCommValue = parseFloat(minCommission);
      if (!isNaN(minCommValue)) {
        query = query.gte('commission_quantity', minCommValue);
      }
    }

    // 4. Application du filtre d'exclusion par nom de promotion/promoteur
    if (excludedDevelopments) {
      const excludedList = excludedDevelopments.split(',').map(s => s.trim());
      if (excludedList.length > 0) {
        query = query.not('development_name', 'in', `(${excludedList.join(',')})`);
      }
    }

    const { data: properties, error } = await query.order('price', { ascending: true }).limit(24);

    if (error) {
      console.error("Erreur Supabase:", error.message);
      return NextResponse.json({ error: "Erreur base de données" }, { status: 500 });
    }

    // 5. Transformation pour renvoyer les champs dans la bonne langue
    const formatted = properties.map((p: any) => ({
      ...p,
      titre: p[`titre_${selectedLang}`] || p.titre_fr,
      description: p[`description_${selectedLang}`] || p.description_fr,
      
      // Nettoyage des champs linguistiques bruts pour alléger le JSON
      titre_fr: undefined, titre_en: undefined, titre_es: undefined, 
      titre_nl: undefined, titre_pl: undefined, titre_ar: undefined,
      description_fr: undefined, description_en: undefined, description_es: undefined, 
      description_nl: undefined, description_pl: undefined, description_ar: undefined,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Erreur API Properties:", error);
    return NextResponse.json([], { status: 500 });
  }
}