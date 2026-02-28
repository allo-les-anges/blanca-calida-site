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
      
      const parser = new xml2js.Parser({ explicitArray: true }); 
      const result = await parser.parseStringPromise(xmlText);
      
      const rootKey = Object.keys(result)[0]; 
      const dataLevel = result[rootKey];
      const properties = dataLevel.property || dataLevel.properties?.property || [];

      if (properties.length === 0) continue;

      const updates = properties.map((p: any) => {
        const getVal = (field: any) => {
            if (!field) return null;
            return Array.isArray(field) ? field[0] : field;
        };

        // --- NETTOYAGE DES IMAGES ---
        let cleanImages: string[] = [];
        const rawImages = p.images?.[0]?.image || p.images?.image;

        if (rawImages) {
          const imageArray = Array.isArray(rawImages) ? rawImages : [rawImages];
          cleanImages = imageArray
            .map((img: any) => {
              // Si c'est un objet { url: '...' }, on prend l'url. Si c'est une string, on la prend.
              const url = typeof img === 'object' ? (img.url || img._) : img;
              return typeof url === 'string' ? url : null;
            })
            .filter(Boolean) as string[];
        }

        const rawTitle = getVal(p.title);
        const finalTitle = typeof rawTitle === 'object' ? (rawTitle.fr || rawTitle.en) : rawTitle;

        return {
          id_externe: String(getVal(p.id)),
          titre: finalTitle || "Villa",
          region: source.region,
          price: parseFloat(getVal(p.price)) || 0,
          town: getVal(p.location)?.city || getVal(p.city) || getVal(p.town) || "",
          type: getVal(p.type) || "",
          beds: getVal(p.bedrooms) || getVal(p.beds) || "0",
          ref: getVal(p.reference) || getVal(p.ref) || getVal(p.id),
          development_name: getVal(p.development_name) || "",
          
          // On envoie maintenant le tableau d'URLs propres
          images: cleanImages, 

          details: {
            bathrooms: getVal(p.bathrooms),
            size: getVal(p.size),
            surface: getVal(p.size)
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