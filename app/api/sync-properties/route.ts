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
    let logs: string[] = [];

    for (const source of SOURCES) {
      const response = await fetch(source.url, { cache: 'no-store' });
      const xmlText = await response.text();
      
      const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true, trim: true });
      const result = await parser.parseStringPromise(xmlText);
      const rootKey = Object.keys(result)[0];
      let properties = result[rootKey].property || [];
      if (!Array.isArray(properties)) properties = [properties];

      const updates = properties.map((p: any) => {
        const surf = p.surface_area || {};
        const loc = p.location || {};
        const dists = p.distances || {}; 
        
        // Gestion des images
        let imagesArray: string[] = [];
        if (p.images && p.images.image) {
          const rawImages = Array.isArray(p.images.image) ? p.images.image : [p.images.image];
          imagesArray = rawImages.map((img: any) => img.url).filter((u: any) => typeof u === 'string');
        }

        return {
          id_externe: String(p.id),
          ref: String(p.ref || p.id),
          // Titre : On prend le nom du projet "Villa Moderna Calpe" en priorité
          titre: String(p.development_name || p.title?.fr || "Villa Moderne").trim(),
          description: String(p.desc?.fr || p.desc?.en || "").trim(),
          
          // Localisation
          town: String(p.town || loc.town || "Espagne"),
          ville: String(p.town || loc.town || "Espagne"),
          province: String(p.province || ""),
          region: source.defaultRegion,
          latitude: loc.latitude ? parseFloat(loc.latitude) : null,
          longitude: loc.longitude ? parseFloat(loc.longitude) : null,
          
          // Caractéristiques (Pour vos vignettes)
          type: String(p.type || "Villa"),
          beds: String(p.beds || "0"),
          baths: String(p.baths || "0"),
          // Note : Votre XML dit <pool>0</pool> mais la description dit "piscine privée"
          // On fait confiance à la balise pool, mais on pourrait scanner les features
          pool: (p.pool === "1" || (p.features?.feature && JSON.stringify(p.features.feature).includes("pool"))) ? "Oui" : "Non",
          
          // Prix
          price: parseFloat(p.price) || 0,
          prix: parseFloat(p.price) || 0,
          currency: String(p.currency || "EUR"),
          
          // --- DISTANCES (Extraction précise du XML) ---
          distance_beach: dists.beach ? String(dists.beach) : null,
          distance_golf: dists.golf ? String(dists.golf) : null,
          // Puisque 'town' n'existe pas dans le XML, on peut utiliser 'beach' comme fallback 
          // ou le laisser null pour ne pas mentir au client.
          distance_town: dists.town_distance || dists.town || null, 
          
          // --- SURFACES ---
          surface_built: String(surf.built || "0"),
          surface_plot: String(surf.plot || "0"),
          surface_useful: String(surf.useful || "0"),
          
          images: imagesArray,
          updated_at: new Date().toISOString()
        };
      });

      const { error, data } = await supabase
        .from('villas')
        .upsert(updates, { onConflict: 'id_externe' })
        .select('id_externe');

      if (!error) totalSynced += data?.length || 0;
    }

    return NextResponse.json({ success: true, totalSynced });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}