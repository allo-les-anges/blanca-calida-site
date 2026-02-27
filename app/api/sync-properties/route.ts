import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import xml2js from 'xml2js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
      console.log(`Début de synchro pour: ${source.region}`);
      
      const response = await fetch(source.url, { cache: 'no-store' });
      const xmlText = await response.text();
      
      const parser = new xml2js.Parser({ 
        explicitArray: false, 
        mergeAttrs: true 
      });
      
      const result = await parser.parseStringPromise(xmlText);
      
      // Sécurité : Habihub peut avoir une racine <root> ou directement <properties>
      const dataRoot = result.properties || result.root?.properties;
      const properties = dataRoot?.property || [];
      
      // Forcer en tableau si un seul bien est présent
      const propertyArray = Array.isArray(properties) ? properties : [properties];

      if (propertyArray.length === 0 || !propertyArray[0]) {
        console.warn(`Aucun bien trouvé pour ${source.region}`);
        continue;
      }

      const updates = propertyArray.map((p: any) => {
        // Normalisation des images
        let imgList = [];
        if (p.images?.image) {
          imgList = Array.isArray(p.images.image) ? p.images.image : [p.images.image];
        }

        return {
          id_externe: String(p.id),
          titre: p.title?.fr || p.title?.en || p.title || "Villa",
          prix: parseFloat(p.price) || 0,
          region: source.region,
          ville: p.location?.city || "",
          images: imgList,
          details: {
            chambres: p.bedrooms || 0,
            salles_de_bain: p.bathrooms || 0,
            surface: p.size || 0,
            type: p.type || "Bien",
            reference: p.reference || ""
          },
          updated_at: new Date().toISOString()
        };
      });

      // Envoi par paquets (batch) pour plus de fiabilité
      const { error } = await supabase
        .from('villas')
        .upsert(updates, { 
          onConflict: 'id_externe',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error(`Erreur Supabase pour ${source.region}:`, error.message);
      } else {
        totalSynced += updates.length;
      }
    }

    return NextResponse.json({ 
      success: true, 
      totalSynced,
      regions: SOURCES.map(s => s.region)
    });

  } catch (error: any) {
    console.error("Erreur critique:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}