import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import xml2js from 'xml2js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SOURCES = [
  { region: "Costa Calida", url: "https://medianewbuild.com/file/hh-media-bucket/agents/6d5cb68a-3636-4095-b0ce-7dc9ec2df2d2/feed_blanca_calida.xml" },
  { region: "Costa del Sol", url: "https://medianewbuild.com/file/hh-media-bucket/agents/6d5cb68a-3636-4095-b0ce-7dc9ec2df2d2/feed_sol.xml" }
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
      const dataLevel = result[rootKey];
      const properties = dataLevel.property || dataLevel.properties?.property || [];

      if (properties.length === 0) continue;

      const updates = properties.map((p: any) => {
        const getVal = (field: any) => Array.isArray(field) ? field[0] : field;

        // Extraction robuste des images
        let cleanImages: string[] = [];
        const imgsContainer = p.images?.[0]?.image;
        if (imgsContainer) {
          const imgs = Array.isArray(imgsContainer) ? imgsContainer : [imgsContainer];
          cleanImages = imgs.map((i: any) => typeof i === 'string' ? i : (i.url || i._)).filter(Boolean);
        }

        const rawTitle = getVal(p.title);
        const finalTitle = typeof rawTitle === 'object' ? (rawTitle.fr || rawTitle.en) : rawTitle;

        return {
          id_externe: String(getVal(p.id)),
          titre: finalTitle || "Villa",
          region: source.region,
          price: parseFloat(getVal(p.price)) || 0,
          town: getVal(p.location)?.city || getVal(p.city) || "Espagne",
          type: getVal(p.type) || "Apartment",
          beds: String(getVal(p.bedrooms) || getVal(p.beds) || "0"),
          ref: getVal(p.reference) || getVal(p.ref) || String(getVal(p.id)),
          images: cleanImages,
          details: {
            bathrooms: getVal(p.bathrooms) || 0,
            size: getVal(p.size) || 0,
            surface: getVal(p.size) || 0
          },
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