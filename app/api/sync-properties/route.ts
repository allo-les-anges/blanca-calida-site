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
        
        // --- LA SOLUTION POUR LA DESCRIPTION ---
        let desc = "";
        
        if (p.description) {
            // Si c'est un objet (ex: { fr: "...", en: "..." })
            if (typeof p.description === 'object') {
                // On cherche 'fr', sinon n'importe quelle première clé trouvée
                desc = p.description.fr || p.description.en || Object.values(p.description)[0];
            } 
            // Si c'est directement du texte (cas du JSON)
            else if (typeof p.description === 'string') {
                desc = p.description;
            }
        }

        // Si après ça c'est toujours un objet, on prend la valeur texte (_)
        if (desc && typeof desc === 'object') {
            desc = (desc as any)._ || JSON.stringify(desc);
        }

        // --- SURFACES ---
        const built = p.surface_area?.built || "0";
        const plot = p.surface_area?.plot || "0";

        return {
          id_externe: String(p.id),
          titre: p.title?.fr || p.title || "Villa Neuve",
          description: String(desc), // On force en texte
          region: source.defaultRegion,
          town: p.town || p.city || "Espagne",
          price: parseFloat(p.price) || 0,
          beds: String(p.beds || "0"),
          baths: String(p.baths || "0"),
          surface_built: String(built),
          surface_plot: String(plot),
          images: p.images?.image ? (Array.isArray(p.images.image) ? p.images.image : [p.images.image]) : [],
          ref: p.ref || p.reference || String(p.id),
          updated_at: new Date().toISOString()
        };
      });

      const { error } = await supabase
        .from('villas')
        .upsert(updates, { onConflict: 'id_externe' });

      if (error) console.error("Détail erreur Supabase:", error);
      else totalSynced += updates.length;
    }

    return NextResponse.json({ success: true, totalSynced });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}