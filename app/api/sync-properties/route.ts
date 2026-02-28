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
      const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true }); // Plus simple sans tableaux partout
      const result = await parser.parseStringPromise(xmlText);
      
      const rootKey = Object.keys(result)[0];
      const propertiesData = result[rootKey].property || result[rootKey].properties?.property || [];
      const properties = Array.isArray(propertiesData) ? propertiesData : [propertiesData];

      const updates = properties.map((p: any) => {
        // Extraction ville et région
        const town = (p.location?.city || p.city || p.town || "").toString().toLowerCase();
        let finalRegion = source.defaultRegion;
        
        if (source.defaultRegion === "Costa del Sol" && ["almeria", "mojacar", "vera", "pulpi"].some(k => town.includes(k))) {
          finalRegion = "Costa Almeria";
        } else if (source.defaultRegion === "Costa Blanca" && ["murcia", "mazarron", "aguilas", "pilar", "alcazares"].some(k => town.includes(k))) {
          finalRegion = "Costa Calida";
        }

        // Extraction Images (Tricky part)
        let cleanImages: string[] = [];
        const rawImgs = p.images?.image;
        if (rawImgs) {
          const imgArray = Array.isArray(rawImgs) ? rawImgs : [rawImgs];
          cleanImages = imgArray.map((i: any) => {
            if (typeof i === 'string') return i;
            return i.url || i._ || (i.$ && i.$.url);
          }).filter(url => typeof url === 'string' && url.startsWith('http'));
        }

        // Extraction Description
        const desc = p.description?.fr || p.description?.en || p.description || "";
        const finalDescription = typeof desc === 'object' ? (desc._ || "") : desc;

        return {
          id_externe: String(p.id),
          titre: p.title?.fr || p.title?.en || p.title || "Villa d'exception",
          description: String(finalDescription),
          region: finalRegion,
          town: p.location?.city || p.city || p.town || "Espagne",
          price: parseFloat(p.price) || 0,
          type: p.type || "Villa",
          beds: String(p.bedrooms || p.beds || "0"),
          ref: p.reference || String(p.id),
          images: cleanImages, // Supabase accepte le tableau JSONB
          updated_at: new Date().toISOString()
        };
      });

      const { error } = await supabase.from('villas').upsert(updates, { onConflict: 'id_externe' });
      if (error) console.error("Erreur Supabase:", error.message);
      else totalSynced += updates.length;
    }

    return NextResponse.json({ success: true, totalSynced });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}