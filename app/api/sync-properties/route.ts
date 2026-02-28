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
      // On garde explicitArray: false pour simplifier l'accès si le XML le permet
      const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
      const result = await parser.parseStringPromise(xmlText);
      
      const rootKey = Object.keys(result)[0];
      // On s'adapte à la structure du XML
      let properties = result[rootKey].property || result[rootKey].properties?.property || [];
      if (!Array.isArray(properties)) properties = [properties];

      const updates = properties.map((p: any) => {
        
        // --- EXTRACTION DESCRIPTION ---
        // Dans ton JSON, c'est directement p.description. 
        // Dans le XML parsé, ça peut être p.description._ ou p.description (si CDATA)
        let desc = "";
        if (typeof p.description === 'string') {
          desc = p.description;
        } else if (p.description && p.description._) {
          desc = p.description._;
        } else if (p.description && p.description.fr) {
          desc = typeof p.description.fr === 'string' ? p.description.fr : p.description.fr._;
        }

        // --- EXTRACTION SURFACES ---
        const built = p.surface_area?.built || p.surface_built || "0";
        const plot = p.surface_area?.plot || p.surface_plot || "0";

        // --- EXTRACTION CHAMBRES / BAINS ---
        const beds = p.beds || p.bedrooms || "0";
        const baths = p.baths || p.bathrooms || "0";

        // --- TITRE ---
        let titre = "Villa";
        if (typeof p.title === 'string') titre = p.title;
        else if (p.title?.fr) titre = p.title.fr;
        else if (p.title?._) titre = p.title._;

        return {
          id_externe: String(p.id),
          titre: titre,
          description: desc, // C'est ici que le texte HTML va être injecté
          region: source.defaultRegion,
          town: p.town || p.city || "Espagne",
          price: parseFloat(p.price) || 0,
          type: p.type || "Villa",
          beds: String(beds),
          baths: String(baths),
          surface_built: String(built),
          surface_plot: String(plot),
          ref: p.ref || p.reference || String(p.id),
          images: Array.isArray(p.images?.image) ? p.images.image : [],
          updated_at: new Date().toISOString()
        };
      });

      const { error } = await supabase.from('villas').upsert(updates, { onConflict: 'id_externe' });
      if (!error) totalSynced += updates.length;
      else console.error("Erreur Supabase:", error.message);
    }

    return NextResponse.json({ success: true, totalSynced });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}