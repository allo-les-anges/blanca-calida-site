import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import xml2js from 'xml2js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type SyncSource = {
  defaultRegion: string;
  defaultTown?: string;
  url: string;
};

const SOURCES: SyncSource[] = [
  { defaultRegion: "Costa Blanca", url: "https://medianewbuild.com/file/hh-media-bucket/agents/7b38827b-c741-4817-a35c-b4e886e7ff6d/feed_blanca_calida.xml" },
  { defaultRegion: "Costa del Sol", url: "https://medianewbuild.com/file/hh-media-bucket/agents/6d5cb68a-3636-4095-b0ce-7dc9ec2df2d2/feed_sol.xml" },
  { defaultRegion: "Portugal", defaultTown: "Portugal", url: "https://medianewbuild.com/file/hh-media-bucket/agents/6d5cb68a-3636-4095-b0ce-7dc9ec2df2d2/feed_portugal.xml" }
];

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TRANSLATION_MODEL = process.env.OPENAI_TRANSLATION_MODEL || "gpt-4o-mini";
const MAX_TRANSLATION_FIELDS_PER_SYNC = Number(process.env.MAX_TRANSLATION_FIELDS_PER_SYNC || 60);
const TRANSLATION_TARGETS = {
  ar: { label: "Arabic", scriptPattern: /[\u0600-\u06FF]/ },
  ka: { label: "Georgian", scriptPattern: /[\u10A0-\u10FF]/ },
} as const;

function extractPlanUrls(plans: any): string[] {
  const rawPlans = plans?.plan ? (Array.isArray(plans.plan) ? plans.plan : [plans.plan]) : [];
  return rawPlans
    .map((plan: any) => (typeof plan === 'string' ? plan : plan?.url))
    .filter((url: any): url is string => typeof url === 'string' && /^https?:\/\//i.test(url));
}

function normalizeFeatureList(rawFeatures: any): string[] {
  const rawList = rawFeatures?.feature ? (Array.isArray(rawFeatures.feature) ? rawFeatures.feature : [rawFeatures.feature]) : [];
  return rawList
    .map((feature: any) => (typeof feature === "string" ? feature : ""))
    .map((feature: string) => feature.trim())
    .filter(Boolean);
}

function extractFeatureDistance(features: string[], label: string) {
  const match = features.find((feature) => feature.toLowerCase().startsWith(label.toLowerCase()));
  const value = match?.match(/:\s*([\d.,]+)\s*(m|km)?/i);
  if (!value) return "";

  const amount = Number(value[1].replace(",", "."));
  if (!Number.isFinite(amount) || amount <= 0) return "";

  const meters = value[2]?.toLowerCase() === "km" ? amount * 1000 : amount;
  return Number.isInteger(meters) ? String(meters) : String(meters).replace(/\.0+$/, "");
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function hasTargetScript(value: unknown, target: keyof typeof TRANSLATION_TARGETS) {
  return TRANSLATION_TARGETS[target].scriptPattern.test(normalizeText(value));
}

function pickSourceText(...values: unknown[]) {
  return values.map(normalizeText).find(Boolean) || "";
}

function normalizePositiveNumberText(value: unknown) {
  const text = normalizeText(value).replace(/\s/g, "").replace(",", ".");
  if (!text) return "";

  const number = Number(text);
  if (!Number.isFinite(number) || number <= 0) return "";
  return Number.isInteger(number) ? String(number) : String(number).replace(/\.0+$/, "");
}

function pickSurfaceValue(xmlValue: unknown, existingValue: unknown) {
  return normalizePositiveNumberText(xmlValue) || normalizePositiveNumberText(existingValue) || "0";
}

function getXmlPropertyId(property: any) {
  return String(property?.id || property?.$?.id || "").trim();
}

function getXmlPropertyRef(property: any) {
  return String(property?.ref || property?.$?.ref || getXmlPropertyId(property)).trim();
}

function extractPropertiesFromParsedXml(result: any) {
  const rootKey = Object.keys(result || {})[0];
  const root = rootKey ? result[rootKey] : {};
  let properties = root?.property || root?.ad || [];
  if (!Array.isArray(properties)) properties = [properties];
  return properties.filter((property: any) => getXmlPropertyId(property));
}

function extractImageUrls(images: any): string[] {
  if (!images?.image) return [];
  const rawImages = Array.isArray(images.image) ? images.image : [images.image];
  return rawImages
    .map((img: any) => (typeof img === 'string' ? img : img?.url))
    .filter((url: any): url is string => typeof url === 'string' && /^https?:\/\//i.test(url))
    .slice(0, 20);
}

function inferDefaultRegion(xmlUrl: string) {
  return /portugal/i.test(xmlUrl) ? "Portugal" : "Espagne";
}

async function translateText(text: string, target: keyof typeof TRANSLATION_TARGETS, isHtml = false) {
  if (!OPENAI_API_KEY || !text.trim()) return "";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: TRANSLATION_MODEL,
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: [
            `Translate real estate property content into ${TRANSLATION_TARGETS[target].label}.`,
            "Preserve meaning, tone, numbers, property references, place names, and HTML structure.",
            isHtml ? "Return valid translated HTML only." : "Return the translated text only.",
            "Do not add explanations, markdown, or extra content.",
          ].join(" "),
        },
        { role: "user", content: text },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Translation failed for ${target}: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  return normalizeText(payload?.choices?.[0]?.message?.content);
}

async function translateIfMissing(options: {
  existingValue?: unknown;
  xmlValue?: unknown;
  sourceValue: string;
  target: keyof typeof TRANSLATION_TARGETS;
  isHtml?: boolean;
  canTranslate: boolean;
}) {
  const xmlValue = normalizeText(options.xmlValue);
  if (xmlValue && hasTargetScript(xmlValue, options.target)) return xmlValue;

  const existingValue = normalizeText(options.existingValue);
  if (existingValue && hasTargetScript(existingValue, options.target)) return existingValue;

  if (!options.canTranslate) return existingValue || xmlValue || "";

  const translated = await translateText(options.sourceValue, options.target, options.isHtml);
  if (translated && hasTargetScript(translated, options.target)) return translated;

  return existingValue || xmlValue || "";
}

async function fetchExistingTranslations(externalIds: string[]) {
  const rows: any[] = [];
  const batchSize = 300;

  for (let index = 0; index < externalIds.length; index += batchSize) {
    const batch = externalIds.slice(index, index + batchSize);
    const { data, error } = await supabase
      .from('villas')
      .select('id_externe,titre_ar,description_ar,description_ka,surface_built,surface_plot,surface_useful')
      .in('id_externe', batch);

    if (error) throw error;
    if (data) rows.push(...data);
  }

  return rows;
}

async function upsertVillasInBatches(updates: any[]) {
  let synced = 0;
  const batchSize = 25;

  for (let index = 0; index < updates.length; index += batchSize) {
    const batch = updates.slice(index, index + batchSize);
    const { error, data } = await supabase
      .from('villas')
      .upsert(batch, { onConflict: 'id_externe' })
      .select('id_externe');

    if (error) throw error;
    synced += data?.length || 0;
  }

  return synced;
}

async function syncSources(sources: SyncSource[]) {
  try {
    let totalSynced = 0;
    let totalTranslated = 0;
    let translationSkipped = 0;
    let translationFieldsUsed = 0;
    const syncErrors: string[] = [];
    const languages = ['fr', 'en', 'es', 'nl', 'pt', 'pl'];

    for (const source of sources) {
      const response = await fetch(source.url, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xmlText = await response.text();
      
      const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true, trim: true });
      const result = await parser.parseStringPromise(xmlText);
      const properties = extractPropertiesFromParsedXml(result);

      const externalIds = properties.map((p: any) => getXmlPropertyId(p)).filter(Boolean);
      let existingRows: any[] = [];
      try {
        existingRows = await fetchExistingTranslations(externalIds);
      } catch (existingError: any) {
        console.error(`Erreur lecture traductions existantes pour ${source.url}:`, existingError.message);
      }

      const existingByExternalId = new Map(
        existingRows.map((row: any) => [String(row.id_externe), row])
      );

      const updates = await Promise.all(properties.map(async (p: any) => {
        const surf = p.surface_area || {};
        const loc = p.location || {};
        const dists = p.distances || {};
        const features = normalizeFeatureList(p.features);
        const idExterne = getXmlPropertyId(p);
        const existing = existingByExternalId.get(idExterne) || {};
        const isNewProperty = !existingByExternalId.has(idExterne);
        
        // Gestion des images (extraction de l'URL si objet ou string)
        const imagesArray = extractImageUrls(p.images);

        // Objet de base mappé sur vos colonnes SQL exactes
        const base: any = {
          id_externe: idExterne,
          ref: getXmlPropertyRef(p),
          town: String(p.town || p.city || loc.town || source.defaultTown || source.defaultRegion),
          ville: String(p.town || p.city || loc.town || source.defaultTown || source.defaultRegion),
          province: String(p.province || loc.province || ""),
          region: source.defaultRegion,
          latitude: loc.latitude ? parseFloat(loc.latitude) : null,
          longitude: loc.longitude ? parseFloat(loc.longitude) : null,
          type: String(p.type || p.property_type || "Villa"),
          beds: String(p.beds || p.bedrooms || "0"),
          baths: String(p.baths || p.bathrooms || "0"),
          pool: (p.pool === "1" || JSON.stringify(p.features).includes("pool")) ? "Oui" : "Non",
          price: parseFloat(p.price || p.prix) || 0,
          prix: parseFloat(p.price || p.prix) || 0,
          currency: String(p.currency || "EUR"),
          distance_beach: dists.beach ? String(dists.beach) : extractFeatureDistance(features, "Sea distance") || null,
          distance_golf: dists.golf ? String(dists.golf) : null,
          distance_town: dists.town_distance || dists.town || null,
          surface_built: pickSurfaceValue(surf.built || p.surface_built || p.built_surface || p.surface?.built, existing.surface_built),
          surface_plot: pickSurfaceValue(surf.plot || p.surface_plot || p.plot_surface || p.surface?.plot, existing.surface_plot),
          surface_useful: pickSurfaceValue(surf.useful || p.surface_useful || p.useful_surface || p.surface?.useful, existing.surface_useful),
          images: imagesArray,
          plans: extractPlanUrls(p.plans),
          updated_at: new Date().toISOString(),
          
          // MAPPING CORRIGÉ SELON VOTRE SQL :
          promoteur_name: p.development_name || p.promoter_name ? String(p.development_name || p.promoter_name) : null,
          commission_percentage: parseFloat(p.commission_percentage || p.commission?.quantity) || 0,
          is_excluded: false // Valeur par défaut
        };

        // Titres et descriptions multilingues fournis par le XML.
        const titleObj = p.title || {};
        const descObj = p.desc || p.description || {};
        const sourceTitle = pickSourceText(p.development_name, titleObj.fr, titleObj.en, "Villa Moderne");
        const sourceDescription = pickSourceText(descObj.fr, descObj.en);

        for (const lang of languages) {
          const titre = p.development_name || titleObj[lang] || titleObj.fr || titleObj.en || "Villa Moderne";
          base[`titre_${lang}`] = String(titre).trim();

          const description = descObj[lang] || descObj.fr || descObj.en || "";
          base[`description_${lang}`] = String(description).trim();
        }

        const canTranslateField = (currentValue: unknown, target: keyof typeof TRANSLATION_TARGETS) => {
          const needsTranslation = !hasTargetScript(currentValue, target);
          const hasBudget = translationFieldsUsed < MAX_TRANSLATION_FIELDS_PER_SYNC;
          if ((isNewProperty || needsTranslation) && hasBudget) {
            translationFieldsUsed++;
            return true;
          }
          return false;
        };

        try {
          base.titre_ar = await translateIfMissing({
            existingValue: existing.titre_ar,
            xmlValue: titleObj.ar,
            sourceValue: sourceTitle,
            target: "ar",
            canTranslate: canTranslateField(existing.titre_ar || titleObj.ar, "ar"),
          });
          base.description_ar = await translateIfMissing({
            existingValue: existing.description_ar,
            xmlValue: descObj.ar,
            sourceValue: sourceDescription,
            target: "ar",
            isHtml: true,
            canTranslate: canTranslateField(existing.description_ar || descObj.ar, "ar"),
          });
          base.description_ka = await translateIfMissing({
            existingValue: existing.description_ka,
            xmlValue: descObj.ka,
            sourceValue: sourceDescription,
            target: "ka",
            isHtml: true,
            canTranslate: canTranslateField(existing.description_ka || descObj.ka, "ka"),
          });

          if (hasTargetScript(base.titre_ar, "ar")) totalTranslated++;
          if (hasTargetScript(base.description_ar, "ar")) totalTranslated++;
          if (hasTargetScript(base.description_ka, "ka")) totalTranslated++;
        } catch (translationError: any) {
          translationSkipped++;
          console.error(`Erreur traduction pour le bien ${base.id_externe}:`, translationError.message);

          base.titre_ar = normalizeText(existing.titre_ar) || normalizeText(titleObj.ar);
          base.description_ar = normalizeText(existing.description_ar) || normalizeText(descObj.ar);
          base.description_ka = normalizeText(existing.description_ka) || normalizeText(descObj.ka);
        }

        return base;
      }));

      try {
        totalSynced += await upsertVillasInBatches(updates);
      } catch (error: any) {
        const message = `Erreur d'insertion pour ${source.url}: ${error.message}`;
        syncErrors.push(message);
        console.error(message);
      }
    }

    return NextResponse.json({
      success: syncErrors.length === 0,
      totalSynced,
      totalTranslated,
      translationSkipped,
      translationFieldsUsed,
      syncErrors,
    });
  } catch (error: any) {
    console.error("Erreur de synchronisation:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return syncSources(SOURCES);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const xmlUrl = String(body.xmlUrl || body.xml_url || "").trim();

    if (!xmlUrl) {
      return NextResponse.json({ success: false, error: "xmlUrl requis" }, { status: 400 });
    }

    return syncSources([
      {
        url: xmlUrl,
        defaultRegion: String(body.defaultRegion || body.region || inferDefaultRegion(xmlUrl)),
        defaultTown: body.defaultTown ? String(body.defaultTown) : undefined,
      },
    ]);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Erreur inconnue" }, { status: 500 });
  }
}
