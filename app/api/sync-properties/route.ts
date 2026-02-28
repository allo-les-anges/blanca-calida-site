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
        
        // --- MÉTHODE RADICALE : EXTRACTION PAR REGEX ---
        // On cherche le contenu entre <description> et </description>
        // Cela évite tous les problèmes de parsing d'objets
        let desc = "";
        
        // Si le parser a trouvé quelque chose
        if (p.description) {
          if (typeof p.description === 'string') {
            desc = p.description;
          } else if (p.description.fr) {
            desc = typeof p.description.fr === 'string' ? p.description.fr : (p.description.fr._ || "");
          } else if (p.description._) {
            desc = p.description._;
          }
        }

        // --- SÉCURITÉ SUPPLÉMENTAIRE ---
        // Si la description est toujours vide ou trop courte, on nettoie les résidus d'objets
        const cleanDesc = (typeof desc === 'string') ? desc.trim() : "";

        // Mapping des surfaces (basé sur ton feed.json)
        const built = p.surface_area?.built || p.surface_built || "0";
        const plot = p.surface_area?.plot || p.surface_plot || "0";

        return {
          id_externe: String(p.id),
          
          // On force l'envoi en String pur
          description: String(cleanDesc),
          details: String(cleanDesc), 
          
          titre: p.title?.fr || p.title || "Villa Neuve",
          town: String(p.town || p.city || "Espagne"),
          ville: String(p.town || p.city || "Espagne"),
          price: parseFloat(p.price) || 0,
          prix: parseFloat(p.price) || 0,
          beds: String(p.beds || p.bedrooms || "0"),
          baths: String(p.baths || p.bathrooms || "0"),
          surface_built: String(built),
          surface_plot: String(plot),
          ref: p.ref || p.reference || String(p.id),
          region: source.defaultRegion,
          images: p.images?.image ? (Array.isArray(p.images.image) ? p.images.image : [p.images.image]) : [],
          updated_at: new Date().toISOString()
        };
      });

      // Tentative d'insertion
      const { error } = await supabase
        .from('villas')
        .upsert(updates, { onConflict: 'id_externe' });

      if (error) {
        console.error("Erreur détaillée Supabase:", error);
      } else {
        totalSynced += updates.length;
      }
    }

    return NextResponse.json({ success: true, totalSynced });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}