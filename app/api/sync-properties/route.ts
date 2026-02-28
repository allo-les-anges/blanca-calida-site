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
        explicitArray: false, // Plus simple pour naviguer dans votre structure
        mergeAttrs: true,
        trim: true 
      });
      
      const result = await parser.parseStringPromise(xmlText);
      const rootKey = Object.keys(result)[0];
      let properties = result[rootKey].property || [];
      if (!Array.isArray(properties)) properties = [properties];

      const updates = properties.map((p: any) => {
        
        // --- 1. DESCRIPTION (Balise <desc><fr>) ---
        const descObj = p.desc || {};
        const descriptionFr = descObj.fr || descObj.en || "";

        // --- 2. TITRE (Balise <title><fr>) ---
        const titleObj = p.title || {};
        const titreFr = titleObj.fr || titleObj.en || "Villa Neuve";

        // --- 3. IMAGES (Balise <images><image><url>) ---
        let imagesArray: string[] = [];
        if (p.images && p.images.image) {
          const rawImages = Array.isArray(p.images.image) ? p.images.image : [p.images.image];
          imagesArray = rawImages
            .map((img: any) => img.url) // On prend l'URL dans la balise <url>
            .filter((url: any) => typeof url === 'string');
        }

        // --- 4. SURFACES (Balise <surface_area>) ---
        const built = p.surface_area?.built || "0";
        const plot = p.surface_area?.plot || "0";

        return {
          id_externe: String(p.id),
          
          // Envoi vers vos colonnes Supabase
          description: String(descriptionFr).trim(),
          details: String(descriptionFr).trim(),
          titre: String(titreFr).trim(),
          
          town: String(p.town || "Espagne"),
          ville: String(p.town || "Espagne"),
          price: parseFloat(p.price) || 0,
          prix: parseFloat(p.price) || 0,
          beds: String(p.beds || "0"),
          baths: String(p.baths || "0"),
          surface_built: String(built),
          surface_plot: String(plot),
          type: String(p.type || "villa"),
          ref: String(p.ref || ""),
          region: source.defaultRegion,
          images: imagesArray,
          updated_at: new Date().toISOString()
        };
      });

      const { error } = await supabase
        .from('villas')
        .upsert(updates, { onConflict: 'id_externe' });

      if (error) {
        console.error("Erreur Supabase:", error.message);
      } else {
        totalSynced += updates.length;
      }
    }

    return NextResponse.json({ success: true, totalSynced });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}