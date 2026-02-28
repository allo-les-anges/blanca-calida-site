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

        // --- 1. LOCALISATION & RÉGION ---
        const townRaw = getVal(p.town) || getVal(p.city) || getVal(p.location)?.city || "";
        const town = townRaw.toString().toLowerCase();
        let finalRegion = source.defaultRegion;

        if (source.defaultRegion === "Costa del Sol") {
           if (town.includes("almeria") || town.includes("mojacar") || town.includes("vera") || town.includes("pulpi")) {
             finalRegion = "Costa Almeria";
           }
        } else if (source.defaultRegion === "Costa Blanca") {
           if (town.includes("murcia") || town.includes("mazarron") || town.includes("aguilas") || town.includes("alcazares")) {
             finalRegion = "Costa Calida";
           }
        }

        // --- 2. IMAGES ---
        let cleanImages: string[] = [];
        const imgsContainer = p.images?.[0]?.image;
        if (imgsContainer) {
          const imgs = Array.isArray(imgsContainer) ? imgsContainer : [imgsContainer];
          cleanImages = imgs
            .map((i: any) => typeof i === 'string' ? i : (i.url || i._))
            .filter((url: string) => url && typeof url === 'string' && url.startsWith('http'));
        }

        // --- 3. DESCRIPTION (Logique Multi-niveaux) ---
        let finalDescription = "";
        const descNode = p.description?.[0];
        if (descNode) {
          // On cherche d'abord le français, puis l'anglais, puis le contenu brut
          finalDescription = descNode.fr?.[0] || descNode.en?.[0] || (typeof descNode === 'string' ? descNode : "");
        }

        // --- 4. SURFACES & CARACTÉRISTIQUES ---
        const surfaceObj = p.surface_area?.[0] || {};
        const surfaceBuilt = surfaceObj.built?.[0] || getVal(p.surface_built) || "0";
        const surfacePlot = surfaceObj.plot?.[0] || getVal(p.surface_plot) || "0";
        const baths = getVal(p.baths) || getVal(p.bathrooms) || "0";
        const beds = getVal(p.bedrooms) || getVal(p.beds) || "0";

        // --- 5. TITRE ---
        const titre = p.title?.[0]?.fr?.[0] || p.title?.[0]?.en?.[0] || getVal(p.title) || "Villa Neuve";

        return {
          id_external: String(getVal(p.id)), // Assurez-vous que le nom de colonne est correct (id_externe ?)
          id_externe: String(getVal(p.id)),
          titre: titre,
          description: String(finalDescription).trim(), 
          region: finalRegion,
          town: townRaw || "Espagne",
          price: parseFloat(getVal(p.price)) || 0,
          type: getVal(p.type) || "Villa",
          beds: String(beds),
          baths: String(baths),
          surface_built: String(surfaceBuilt),
          surface_plot: String(surfacePlot),
          ref: getVal(p.reference) || getVal(p.ref) || String(getVal(p.id)),
          images: cleanImages,
          updated_at: new Date().toISOString()
        };
      });

      // Upsert pour mettre à jour les données sur les IDs existants
      const { error } = await supabase
        .from('villas')
        .upsert(updates, { onConflict: 'id_externe' });

      if (error) {
        console.error(`Erreur Supabase pour ${source.defaultRegion}:`, error.message);
      } else {
        totalSynced += updates.length;
      }
    }

    return NextResponse.json({ success: true, totalSynced });
  } catch (error: any) {
    console.error("Erreur de synchronisation:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}