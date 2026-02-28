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
        explicitArray: true, // Obligatoire pour gérer les balises répétées (images, descriptions)
        mergeAttrs: true,
        trim: true 
      });
      
      const result = await parser.parseStringPromise(xmlText);
      const rootKey = Object.keys(result)[0];
      let properties = result[rootKey].property || [];

      const updates = properties.map((p: any) => {
        
        // --- 1. EXTRACTION DE LA DESCRIPTION ---
        // On cherche dans <descriptions> (pluriel) -> <description> (singulier)
        let descFr = "";
        const descriptionsWrapper = p.descriptions?.[0]; // Le bloc <descriptions>
        const descriptionList = descriptionsWrapper?.description; // Le tableau <description>

        if (Array.isArray(descriptionList)) {
          // On cherche la version française
          const frEntry = descriptionList.find((d: any) => d.lg === 'fr' || d.lg?.[0] === 'fr');
          descFr = frEntry?._ || (typeof frEntry === 'string' ? frEntry : "");
        }

        // --- 2. EXTRACTION DU TITRE ---
        let titreFr = "";
        const titleList = p.titles?.[0]?.title;
        if (Array.isArray(titleList)) {
          const frTitle = titleList.find((t: any) => t.lg === 'fr' || t.lg?.[0] === 'fr');
          titreFr = frTitle?._ || (typeof frTitle === 'string' ? frTitle : "");
        }

        // --- 3. SURFACES ---
        const surf = p.surface_area?.[0] || {};
        const built = surf.built?.[0] || surf.built || "0";
        const plot = surf.plot?.[0] || surf.plot || "0";

        // --- 4. IMAGES ---
        let imagesArray: string[] = [];
        const imgs = p.images?.[0]?.image;
        if (Array.isArray(imgs)) {
          imagesArray = imgs.map(img => typeof img === 'string' ? img : img._);
        }

        return {
          id_externe: String(p.id?.[0] || p.id),
          
          // On envoie vers vos colonnes Supabase (SANS S)
          description: String(descFr).trim(),
          details: String(descFr).trim(),
          
          titre: titreFr || "Villa Neuve",
          town: String(p.town?.[0] || "Espagne"),
          ville: String(p.town?.[0] || "Espagne"),
          price: parseFloat(p.price?.[0]) || 0,
          prix: parseFloat(p.price?.[0]) || 0,
          beds: String(p.beds?.[0] || "0"),
          baths: String(p.baths?.[0] || "0"),
          surface_built: String(built),
          surface_plot: String(plot),
          type: String(p.type?.[0] || "Villa"),
          ref: String(p.ref?.[0] || ""),
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