import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import xml2js from 'xml2js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 1. Configuration des flux (Tu pourras plus tard mettre ça dans une table Supabase)
const SOURCES = [
  {
    region: "Costa Calida",
    url: "https://medianewbuild.com/file/hh-media-bucket/agents/6d5cb68a-3636-4095-b0ce-7dc9ec2df2d2/feed_blanca_calida.xml"
  },
  {
    region: "Costa del Sol",
    url: "https://medianewbuild.com/file/hh-media-bucket/agents/6d5cb68a-3636-4095-b0ce-7dc9ec2df2d2/feed_sol.xml"
  }
];

export async function GET() {
  try {
    let totalSynced = 0;

    for (const source of SOURCES) {
      const response = await fetch(source.url);
      const xmlText = await response.text();
      
      const parser = new xml2js.Parser({ explicitArray: false });
      const result = await parser.parseStringPromise(xmlText);
      
      // Extraction des propriétés (vérifie si c'est result.properties.property)
      const properties = result.properties?.property || [];
      const propertyArray = Array.isArray(properties) ? properties : [properties];

      const updates = propertyArray.map((p: any) => ({
        id_externe: p.id,
        titre: p.title?.['fr'] || p.title?.['en'] || "Villa",
        prix: parseFloat(p.price) || 0,
        region: source.region, // <--- C'est ici qu'on marque la zone !
        ville: p.location?.city || "",
        images: Array.isArray(p.images?.image) ? p.images.image : [p.images?.image],
        details: {
          chambres: p.bedrooms,
          salles_de_bain: p.bathrooms,
          surface: p.size,
          type: p.type
        },
        updated_at: new Date()
      }));

      // Upsert dans Supabase
      const { error } = await supabase
        .from('villas')
        .upsert(updates, { onConflict: 'id_externe' });

      if (error) console.error(`Erreur pour ${source.region}:`, error);
      totalSynced += updates.length;
    }

    return NextResponse.json({ success: true, totalSynced });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}