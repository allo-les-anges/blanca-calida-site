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
        explicitArray: false, 
        mergeAttrs: true,
        trim: true 
      });
      
      const result = await parser.parseStringPromise(xmlText);
      const rootKey = Object.keys(result)[0];
      let properties = result[rootKey].property || [];
      if (!Array.isArray(properties)) properties = [properties];

      const updates = properties.map((p: any) => {
        
        // --- 1. DESCRIPTION & TITRE (Chemin <desc><fr> et <title><fr>) ---
        const descObj = p.desc || {};
        const descriptionFr = descObj.fr || descObj.en || "";

        const titleObj = p.title || {};
        const titreFr = titleObj.fr || titleObj.en || "Villa Neuve";

        // --- 2. LOCALISATION & COORDONNÉES (Chemin <location>) ---
        const loc = p.location || {};
        const lat = loc.latitude ? parseFloat(loc.latitude) : null;
        const lng = loc.longitude ? parseFloat(loc.longitude) : null;
        const address = loc.address || "";

        // --- 3. IMAGES (Chemin <images><image><url>) ---
        let imagesArray: string[] = [];
        if (p.images && p.images.image) {
          const rawImages = Array.isArray(p.images.image) ? p.images.image : [p.images.image];
          imagesArray = rawImages
            .map((img: any) => img.url) 
            .filter((url: any) => typeof url === 'string');
        }

        // --- 4. SURFACES ---
        const built = p.surface_area?.built || "0";
        const plot = p.surface_area?.plot || "0";

        return {
          id_externe: String(p.id),
          
          // Textes
          description: String(descriptionFr).trim(),
          details: String(descriptionFr).trim(),
          titre: String(titreFr).trim(),
          
          // Géolocalisation
          latitude: lat,
          longitude: lng,
          adresse: String(address).trim(),
          
          // Localisation standard
          town: String(p.town || "Espagne"),
          ville: String(p.town || "Espagne"),
          region: source.defaultRegion,
          
          // Prix et Caractéristiques
          price: parseFloat(p.price) || 0,
          prix: parseFloat(p.price) || 0,
          beds: String(p.beds || "0"),
          baths: String(p.baths || "0"),
          surface_built: String(built),
          surface_plot: String(plot),
          
          // Divers
          type: String(p.type || "villa"),
          ref: String(p.ref || ""),
          images: imagesArray,
          updated_at: new Date().toISOString()
        };
      });

      // Upsert dans Supabase
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}