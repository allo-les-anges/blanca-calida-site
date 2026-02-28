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
      
      // On utilise explicitArray: false pour coller à la structure de votre feed.json
      const parser = new xml2js.Parser({ 
        explicitArray: false, 
        mergeAttrs: true,
        stripPrefix: true 
      });
      
      const result = await parser.parseStringPromise(xmlText);
      const rootKey = Object.keys(result)[0];
      let properties = result[rootKey].property || result[rootKey].properties?.property || [];
      if (!Array.isArray(properties)) properties = [properties];

      const updates = properties.map((p: any) => {
        
        // --- EXTRACTION DE LA DESCRIPTION (Basée sur votre feed.json) ---
        // Dans votre JSON, la description est une string directe ou dans p.description.fr
        let descValue = "";
        if (typeof p.description === 'string') {
          descValue = p.description;
        } else if (p.description?.fr) {
          descValue = typeof p.description.fr === 'string' ? p.description.fr : p.description.fr._;
        } else if (p.description?._) {
          descValue = p.description._;
        }

        // --- SURFACES (Structure imbriquée du JSON) ---
        const built = p.surface_area?.built || "0";
        const plot = p.surface_area?.plot || "0";

        return {
          id_externe: String(p.id),
          titre: p.title?.fr || p.title || "Villa Neuve",
          
          // VERIFIEZ BIEN LE NOM DE CETTE COLONNE DANS SUPABASE :
          description: descValue, 
          
          region: source.defaultRegion,
          town: p.town || "Espagne",
          price: parseFloat(p.price) || 0,
          beds: String(p.beds || "0"),
          baths: String(p.baths || "0"),
          surface_built: String(built),
          surface_plot: String(plot),
          images: Array.isArray(p.images?.image) ? p.images.image : [],
          updated_at: new Date().toISOString()
        };
      });

      // L'upsert force la mise à jour des colonnes même si la ligne existe
      const { error } = await supabase
        .from('villas')
        .upsert(updates, { onConflict: 'id_externe' });

      if (error) {
        console.error("Erreur Supabase detaillee:", error);
      } else {
        totalSynced += updates.length;
      }
    }

    return NextResponse.json({ success: true, totalSynced });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}