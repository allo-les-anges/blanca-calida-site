import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import xml2js from 'xml2js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SOURCES = [
  { region: "Costa Calida", url: "https://medianewbuild.com/file/hh-media-bucket/agents/6d5cb68a-3636-4095-b0ce-7dc9ec2df2d2/feed_blanca_calida.xml" },
  { region: "Costa del Sol", url: "https://medianewbuild.com/file/hh-media-bucket/agents/6d5cb68a-3636-4095-b0ce-7dc9ec2df2d2/feed_sol.xml" }
];

export async function GET() {
  try {
    let totalSynced = 0;

    for (const source of SOURCES) {
      const response = await fetch(source.url, { cache: 'no-store' });
      const xmlText = await response.text();
      
      const parser = new xml2js.Parser({ explicitArray: true }); // Plus sûr pour parcourir
      const result = await parser.parseStringPromise(xmlText);
      
      // LOGIQUE DE RECHERCHE DYNAMIQUE :
      // On cherche la balise 'property' peu importe où elle est (root, properties, etc.)
      const rootKey = Object.keys(result)[0]; // Souvent 'root' ou 'properties'
      const dataLevel = result[rootKey];
      const properties = dataLevel.property || dataLevel.properties?.property || [];

      if (properties.length === 0) continue;

      const updates = properties.map((p: any) => {
        // Habihub met souvent les valeurs dans des tableaux [0] avec explicitArray: true
        const getVal = (field: any) => Array.isArray(field) ? field[0] : field;

        return {
          id_externe: String(getVal(p.id)),
          titre: getVal(p.title)?.fr || getVal(p.title)?.en || "Villa",
          prix: parseFloat(getVal(p.price)) || 0,
          region: source.region,
          ville: getVal(p.location)?.city || "",
          images: p.images?.[0]?.image || [], // Liste des images
          details: {
            chambres: getVal(p.bedrooms),
            bains: getVal(p.bathrooms),
            surface: getVal(p.size),
            ref: getVal(p.reference)
          },
          updated_at: new Date().toISOString()
        };
      });

      const { error } = await supabase.from('villas').upsert(updates, { onConflict: 'id_externe' });
      if (!error) totalSynced += updates.length;
    }

    return NextResponse.json({ success: true, totalSynced });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}