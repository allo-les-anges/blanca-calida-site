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

        // --- LOGIQUE DE DÉTECTION DE RÉGION AMÉLIORÉE ---
        const town = (getVal(p.location)?.city || getVal(p.city) || getVal(p.town) || "").toLowerCase();
        let finalRegion = source.defaultRegion;

        // Si on trouve des villes spécifiques dans le flux "Sol", on bascule sur Almeria
        if (source.defaultRegion === "Costa del Sol") {
           if (town.includes("almeria") || town.includes("mojacar") || town.includes("vera")) {
             finalRegion = "Costa Almeria";
           }
        } 
        // Si on trouve des villes spécifiques dans le flux "Blanca", on sépare Blanca et Calida
        else if (source.defaultRegion === "Costa Blanca") {
           if (town.includes("murcia") || town.includes("mazarron") || town.includes("aguilas")) {
             finalRegion = "Costa Calida";
           }
        }

        // Nettoyage des images
        let cleanImages: string[] = [];
        const imgsContainer = p.images?.[0]?.image;
        if (imgsContainer) {
          const imgs = Array.isArray(imgsContainer) ? imgsContainer : [imgsContainer];
          cleanImages = imgs.map((i: any) => typeof i === 'string' ? i : (i.url || i._)).filter(Boolean);
        }

        return {
          id_externe: String(getVal(p.id)),
          titre: getVal(p.title)?.fr || getVal(p.title)?.en || getVal(p.title) || "Villa",
          region: finalRegion, // La région détectée (Blanca, Calida, Sol ou Almeria)
          town: getVal(p.location)?.city || getVal(p.city) || getVal(p.town) || "Espagne",
          price: parseFloat(getVal(p.price)) || 0,
          type: getVal(p.type) || "Villa",
          beds: String(getVal(p.bedrooms) || getVal(p.beds) || "0"),
          ref: getVal(p.reference) || String(getVal(p.id)),
          images: cleanImages,
          updated_at: new Date().toISOString()
        };
      });

      const { error } = await supabase.from('villas').upsert(updates, { onConflict: 'id_externe' });
      if (!error) totalSynced += updates.length;
    }

    return NextResponse.json({ success: true, totalSynced });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}