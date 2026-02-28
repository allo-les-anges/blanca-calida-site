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
    let logs: any[] = [];

    for (const source of SOURCES) {
      const response = await fetch(source.url, { cache: 'no-store' });
      const xmlText = await response.text();
      
      const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true, trim: true });
      const result = await parser.parseStringPromise(xmlText);
      
      const rootKey = Object.keys(result)[0];
      let properties = result[rootKey].property || [];
      if (!Array.isArray(properties)) properties = [properties];

      logs.push(`${source.defaultRegion}: ${properties.length} propriétés trouvées dans le XML`);

      if (properties.length === 0) continue;

      const updates = properties.map((p: any) => {
        const surf = p.surface_area || {};
        const loc = p.location || {};
        let imagesArray: string[] = [];
        if (p.images && p.images.image) {
          const rawImages = Array.isArray(p.images.image) ? p.images.image : [p.images.image];
          imagesArray = rawImages.map((img: any) => img.url).filter((u: any) => typeof u === 'string');
        }

        return {
          id_externe: String(p.id),
          ref: String(p.ref || p.id),
          titre: String(p.title?.fr || p.title?.en || "Villa").trim(),
          description: String(p.desc?.fr || p.desc?.en || "").trim(),
          town: String(p.town || "Espagne"),
          ville: String(p.town || "Espagne"),
          region: source.defaultRegion,
          price: parseFloat(p.price) || 0,
          prix: parseFloat(p.price) || 0,
          beds: String(p.beds || "0"),
          baths: String(p.baths || "0"),
          pool: p.pool === "1" ? "Oui" : "Non",
          surface_built: String(surf.built || "0"),
          surface_plot: String(surf.plot || "0"),
          images: imagesArray,
          updated_at: new Date().toISOString()
        };
      });

      // Tentative d'insertion avec capture d'erreur précise
      const { error, data } = await supabase
        .from('villas')
        .upsert(updates, { onConflict: 'id_externe' })
        .select('id_externe'); // On demande de nous renvoyer les IDs insérés

      if (error) {
        logs.push(`ERREUR SUPABASE ${source.defaultRegion}: ${error.message} - Code: ${error.code}`);
        console.error("Erreur complète:", error);
      } else {
        const count = data?.length || 0;
        totalSynced += count;
        logs.push(`SUCCÈS ${source.defaultRegion}: ${count} lignes traitées par Supabase`);
      }
    }

    return NextResponse.json({ success: true, totalSynced, details: logs });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}