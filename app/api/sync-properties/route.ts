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
      let properties = result[rootKey].property || result[rootKey].properties?.property || [];
      if (!Array.isArray(properties)) properties = [properties];

      const updates = properties.map((p: any) => {
        
        // --- 1. EXTRACTION DE LA DESCRIPTION (MULTI-NIVEAUX) ---
        let finalDesc = "";
        if (p.description) {
          if (typeof p.description === 'string') {
            finalDesc = p.description;
          } else if (p.description.fr) {
            finalDesc = typeof p.description.fr === 'string' ? p.description.fr : (p.description.fr._ || "");
          } else if (p.description._) {
            finalDesc = p.description._;
          }
        }

        // --- 2. SURFACES ---
        const built = p.surface_area?.built || p.surface_built || "0";
        const plot = p.surface_area?.plot || p.surface_plot || "0";

        // --- 3. DÉTECTION VILLE / TOWN ---
        const townVal = p.town || p.city || p.location?.city || "Espagne";

        return {
          // Identifiant de base
          id_externe: String(p.id),
          
          // --- DOUBLONS FRANÇAIS / ANGLAIS (On remplit tout pour être sûr) ---
          description: String(finalDesc),
          details: String(finalDesc), // Parfois utilisé pour la description longue
          
          town: String(townVal),
          ville: String(townVal),
          
          price: parseFloat(p.price) || 0,
          prix: parseFloat(p.price) || 0,
          
          beds: String(p.beds || p.bedrooms || "0"),
          baths: String(p.baths || p.bathrooms || "0"),
          
          surface_built: String(built),
          surface_plot: String(plot),
          
          // Autres champs
          titre: p.title?.fr || p.title || "Villa Neuve",
          type: p.type || "Villa",
          ref: p.ref || p.reference || String(p.id),
          region: source.defaultRegion,
          images: p.images?.image ? (Array.isArray(p.images.image) ? p.images.image : [p.images.image]) : [],
          development_name: p.development_name || "",
          updated_at: new Date().toISOString()
        };
      });

      // L'upsert avec id_externe comme clé de conflit
      const { error } = await supabase
        .from('villas')
        .upsert(updates, { onConflict: 'id_externe' });

      if (error) {
        console.error("Détail erreur Supabase:", error.message);
      } else {
        totalSynced += updates.length;
      }
    }

    return NextResponse.json({ success: true, totalSynced });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}