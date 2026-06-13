import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

const CITY_TO_REGION_MAP: Record<string, string> = {
  alicante: "Costa Blanca", benidorm: "Costa Blanca", altea: "Costa Blanca",
  calpe: "Costa Blanca", denia: "Costa Blanca", javea: "Costa Blanca",
  xabia: "Costa Blanca", moraira: "Costa Blanca", torrevieja: "Costa Blanca",
  orihuela: "Costa Blanca", "orihuela costa": "Costa Blanca", guardamar: "Costa Blanca",
  "santa pola": "Costa Blanca", finestrat: "Costa Blanca", villajoyosa: "Costa Blanca",
  polop: "Costa Blanca", elche: "Costa Blanca", "el campello": "Costa Blanca",
  busot: "Costa Blanca", "cumbre del sol": "Costa Blanca",
  marbella: "Costa del Sol", estepona: "Costa del Sol", mijas: "Costa del Sol",
  fuengirola: "Costa del Sol", benalmadena: "Costa del Sol", torremolinos: "Costa del Sol",
  malaga: "Costa del Sol", nerja: "Costa del Sol", casares: "Costa del Sol",
  manilva: "Costa del Sol", sotogrande: "Costa del Sol", "san pedro de alcantara": "Costa del Sol",
  benahavis: "Costa del Sol", cancelada: "Costa del Sol", "san roque": "Costa del Sol",
  murcia: "Costa Calida", cartagena: "Costa Calida", "los alcazares": "Costa Calida",
  "san javier": "Costa Calida", "san pedro del pinatar": "Costa Calida", mazarron: "Costa Calida",
  aguilas: "Costa Calida", "la manga": "Costa Calida", sucina: "Costa Calida",
  "bano y mendigo": "Costa Calida",
  almeria: "Costa Almeria", "roquetas de mar": "Costa Almeria", mojacar: "Costa Almeria",
  vera: "Costa Almeria", "san juan de los terreros": "Costa Almeria", pulpi: "Costa Almeria",
  "cuevas del almanzora": "Costa Almeria"
};

const PROVINCE_TO_REGION_MAP: Record<string, string> = {
  alicante: "Costa Blanca",
  malaga: "Costa del Sol",
  cadiz: "Costa del Sol",
  murcia: "Costa Calida",
  almeria: "Costa Almeria"
};

function normalizeLocation(value: unknown) {
  return typeof value === "string"
    ? value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    : "";
}

function getPropertyRegion(property: any) {
  const directRegion = property.region?.trim();
  if (directRegion) return directRegion;

  const city = normalizeLocation(property.town || property.ville);
  const province = normalizeLocation(property.province);
  return CITY_TO_REGION_MAP[city] || PROVINCE_TO_REGION_MAP[province] || "";
}

function getGeorgianPropertyType(raw?: string | null) {
  const type = normalizeLocation(raw);
  if (type.includes("apartment") || type.includes("apart")) return "ბინა";
  if (type.includes("penthouse")) return "პენტჰაუსი";
  if (type.includes("townhouse")) return "თაუნჰაუსი";
  if (type.includes("bungalow")) return "ბუნგალო";
  if (type.includes("villa")) return "ვილა";
  return "უძრავი ქონება";
}

function getLocalizedTitle(property: any, selectedLang: string) {
  const localizedTitle = property[`titre_${selectedLang}`];
  if (localizedTitle) return localizedTitle;

  if (selectedLang === "ka") {
    const town = property.town || property.ville;
    const type = getGeorgianPropertyType(property.type);
    return town ? `${type} ${town}-ში` : type;
  }

  return property.titre_fr;
}

async function getRegionCounts() {
  const counts: Record<string, number> = {
    "Costa Blanca": 0,
    "Costa del Sol": 0,
    "Costa Calida": 0,
    "Costa Almeria": 0,
  };
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from('villas')
      .select('town,ville,region,province')
      .eq('is_excluded', false)
      .range(from, to);

    if (error) throw error;
    if (!data || data.length === 0) break;

    data.forEach((property) => {
      const region = getPropertyRegion(property);
      if (region && counts[region] !== undefined) counts[region]++;
    });

    if (data.length < pageSize) break;
  }

  return counts;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const regionCounts = searchParams.get('regionCounts') === 'true';

    if (regionCounts) {
      return NextResponse.json(await getRegionCounts());
    }
    
    // 1. Paramètres de langue
    const lang = searchParams.get('lang') || 'fr';
    const supportedLangs = ['fr', 'en', 'es', 'nl', 'pl', 'ar', 'ka'];
    const selectedLang = supportedLangs.includes(lang) ? lang : 'fr';

    // 2. Nouveaux paramètres de filtrage admin
    const minCommission = searchParams.get('minCommission');
    const excludedDevelopments = searchParams.get('excluded'); // Format attendu: "Promotion A,Promotion B"
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const type = searchParams.get('type');
    const reference = searchParams.get('reference');
    const id = searchParams.get('id');
    const limitParam = Number(searchParams.get('limit') || 24);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 24;

    // Initialisation de la requête Supabase
    let query = supabase
      .from('villas')
      .select('*')
      .eq('is_excluded', false); // On exclut d'office les biens marqués "is_excluded" manuellement

    if (!id) {
      query = query.gte('price', 20000);
    }

    if (id) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      query = isUuid ? query.or(`id.eq.${id},id_externe.eq.${id}`) : query.eq('id_externe', id);
    }

    // 3. Application du filtre de commission minimale
    if (!id && minCommission) {
      const minCommValue = parseFloat(minCommission);
      if (!isNaN(minCommValue)) {
        query = query.gte('commission_quantity', minCommValue);
      }
    }

    if (!id && minPrice) {
      const minPriceValue = parseFloat(minPrice);
      if (!isNaN(minPriceValue)) {
        query = query.gte('price', minPriceValue);
      }
    }

    if (!id && maxPrice) {
      const maxPriceValue = parseFloat(maxPrice);
      if (!isNaN(maxPriceValue)) {
        query = query.lte('price', maxPriceValue);
      }
    }

    if (!id && type) {
      query = query.ilike('type', `%${type}%`);
    }

    if (!id && reference) {
      query = query.ilike('ref', `%${reference}%`);
    }

    // 4. Application du filtre d'exclusion par nom de promotion/promoteur
    if (!id && excludedDevelopments) {
      const excludedList = excludedDevelopments.split(',').map(s => s.trim());
      if (excludedList.length > 0) {
        query = query.not('development_name', 'in', `(${excludedList.join(',')})`);
      }
    }

    const { data: properties, error } = await query.order('price', { ascending: true }).limit(limit);

    if (error) {
      console.error("Erreur Supabase:", error.message);
      return NextResponse.json({ error: "Erreur base de données" }, { status: 500 });
    }

    // 5. Transformation pour renvoyer les champs dans la bonne langue
    const formatted = properties.map((p: any) => ({
      ...p,
      titre: getLocalizedTitle(p, selectedLang),
      description: p[`description_${selectedLang}`] || p.description_fr,
      
      // Nettoyage des champs linguistiques bruts pour alléger le JSON
      titre_fr: undefined, titre_en: undefined, titre_es: undefined, 
      titre_nl: undefined, titre_pl: undefined, titre_ar: undefined, titre_ka: undefined,
      description_fr: undefined, description_en: undefined, description_es: undefined, 
      description_nl: undefined, description_pl: undefined, description_ar: undefined, description_ka: undefined,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Erreur API Properties:", error);
    return NextResponse.json([], { status: 500 });
  }
}
