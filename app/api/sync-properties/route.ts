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
      
      const parser = new xml2js.Parser({ 
        explicitArray: true, // Crucial pour itérer sur les descriptions
        mergeAttrs: true,
        trim: true 
      });
      
      const result = await parser.parseStringPromise(xmlText);
      const rootKey = Object.keys(result)[0];
      // Dans votre XML, c'est result.root.property
      let properties = result[rootKey].property || [];

      const updates = properties.map((p: any) => {
        
        // --- 1. EXTRACTION DE LA DESCRIPTION (LA VRAIE LOGIQUE XML) ---
        let descFr = "";
        // Dans le XML, c'est p.descriptions[0].description qui est un tableau
        const descList = p.descriptions?.[0]?.description;
        if (Array.isArray(descList)) {
          // On cherche l'entrée où lg == 'fr'
          const frEntry = descList.find((d: any) => d.lg === 'fr' || d.lg?.[0] === 'fr');
          descFr = frEntry?._ || frEntry || "";
        } else if (descList) {
          descFr = descList._ || descList;
        }

        // --- 2. EXTRACTION DU TITRE ---
        let titreFr = "";
        const titleList = p.titles?.[0]?.title;
        if (Array.isArray(titleList)) {
          const frTitle = titleList.find((t: any) => t.lg === 'fr' || t.lg?.[0] === 'fr');
          titreFr = frTitle?._ || frTitle || "";
        }

        // --- 3. SURFACES (p.surface_area est un tableau dans ce parser) ---
        const surf = p.surface_area?.[0] || {};
        const built = surf.built || "0";
        const plot = surf.plot || "0";

        // --- 4. IMAGES ---
        let imagesArray: string[] = [];
        const imgs = p.images?.[0]?.image;
        if (Array.isArray(imgs)) {
          imagesArray = imgs.map(img => typeof img === 'string' ? img : img._);
        }

        return {
          id_externe: String(p.id?.[0] || p.id),
          description: String(descFr).trim(),
          details: String(descFr).trim(),
          titre: titreFr || "Villa Neuve",
          town: String(p.town?.[0] || p.town || "Espagne"),
          ville: String(p.town?.[0] || p.town || "Espagne"),
          price: parseFloat(p.price?.[0] || p.price) || 0,
          prix: parseFloat(p.price?.[0] || p.price) || 0,
          beds: String(p.beds?.[0] || "0"),
          baths: String(p.baths?.[0] || "0"),
          surface_built: String(built),
          surface_plot: String(plot),
          type: String(p.type?.[0] || "Villa"),
          ref: String(p.ref?.[0] || p.ref || ""),
          region: source.defaultRegion,
          images: imagesArray,
          updated_at: new Date().toISOString()
        };
      });

      const { error } = await supabase
        .from('villas')
        .upsert(updates, { onConflict: 'id_externe' });

      if (error) console.error("Erreur Supabase:", error.message);
      else totalSynced += updates.length;
    }

    return NextResponse.json({ success: true, totalSynced });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}