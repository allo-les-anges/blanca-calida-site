import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import xml2js from 'xml2js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SOURCES = [
  { defaultRegion: "Costa Blanca", url: "https://medianewbuild.com/file/hh-media-bucket/agents/6d5cb68a-3636-4095-b0ce-7dc9ec2df2d2/feed_blanca_calida.xml" },
  { defaultRegion: "Costa del Sol", url: "https://medianewbuild.com/file/hh-media-bucket/agents/6d5cb68a-3636-4095-b0ce-7dc9ec2df2d2/feed_sol.xml" }
];

export async function GET() {
  try {
    let totalSynced = 0;

    for (const source of SOURCES) {
      const response = await fetch(source.url, { cache: 'no-store' });
      const xmlText = await response.text();
      const parser = new xml2js.Parser({ explicitArray: true, mergeAttrs: true });
      const result = await parser.parseStringPromise(xmlText);
      
      const rootKey = Object.keys(result)[0];
      const properties = result[rootKey].property || result[rootKey].properties?.property || [];

      const updates = properties.map((p: any) => {
        const getVal = (field: any) => Array.isArray(field) ? field[0] : field;

        // --- 1. LOCALISATION ---
        const townRaw = getVal(p.town) || getVal(p.city) || getVal(p.location)?.city || "";
        const town = townRaw.toString().toLowerCase();
        let finalRegion = source.defaultRegion;

        if (source.defaultRegion === "Costa del Sol") {
           if (town.includes("almeria") || town.includes("mojacar") || town.includes("vera")) {
             finalRegion = "Costa Almeria";
           }
        } else if (source.defaultRegion === "Costa Blanca") {
           if (town.includes("murcia") || town.includes("mazarron") || town.includes("aguilas")) {
             finalRegion = "Costa Calida";
           }
        }

        // --- 2. IMAGES ---
        let cleanImages: string[] = [];
        const imgsContainer = p.images?.[0]?.image;
        if (imgsContainer) {
          const imgs = Array.isArray(imgsContainer) ? imgsContainer : [imgsContainer];
          cleanImages = imgs.map((i: any) => typeof i === 'string' ? i : (i.url || i._)).filter(Boolean);
        }

        // --- 3. EXTRACTION ROBUSTE DE LA DESCRIPTION ---
        const extractDescription = (node: any) => {
          if (!node) return "";
          const d = node[0] || node;
          
          // Test 1: fr est un tableau de string ou d'objets
          if (d.fr) {
            const frVal = d.fr[0] || d.fr;
            return typeof frVal === 'string' ? frVal : (frVal._ || "");
          }
          // Test 2: direct string (cas CDATA simple)
          if (typeof d === 'string') return d;
          // Test 3: contenu texte brut dans l'objet
          if (d._) return d._;
          // Test 4: fallback sur l'anglais
          if (d.en) {
            const enVal = d.en[0] || d.en;
            return typeof enVal === 'string' ? enVal : (enVal._ || "");
          }
          return "";
        };

        const finalDescription = extractDescription(p.description);

        // --- 4. SURFACES & CARACTÉRISTIQUES ---
        const surfaceObj = p.surface_area?.[0] || {};
        const surfaceBuilt = surfaceObj.built?.[0] || getVal(p.surface_built) || "0";
        const surfacePlot = surfaceObj.plot?.[0] || getVal(p.surface_plot) || "0";
        const baths = getVal(p.baths) || getVal(p.bathrooms) || "0";

        return {
          id_externe: String(getVal(p.id)),
          titre: p.title?.[0]?.fr?.[0] || p.title?.[0]?.en?.[0] || getVal(p.title) || "Villa",
          description: finalDescription, 
          region: finalRegion,
          town: townRaw || "Espagne",
          price: parseFloat(getVal(p.price)) || 0,
          type: getVal(p.type) || "Villa",
          beds: String(getVal(p.bedrooms) || getVal(p.beds) || "0"),
          baths: String(baths),
          surface_built: String(surfaceBuilt),
          surface_plot: String(surfacePlot),
          ref: getVal(p.reference) || getVal(p.ref) || String(getVal(p.id)),
          images: cleanImages,
          updated_at: new Date().toISOString()
        };
      });

      const { error } = await supabase.from('villas').upsert(updates, { onConflict: 'id_externe' });
      if (!error) totalSynced += updates.length;
      else console.error("Erreur Supabase:", error.message);
    }

    return NextResponse.json({ success: true, totalSynced });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}