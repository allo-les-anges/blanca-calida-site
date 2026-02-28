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
      const parser = new xml2js.Parser({ explicitArray: true, mergeAttrs: true });
      const result = await parser.parseStringPromise(xmlText);
      
      // Accès ultra-sécurisé à la liste des propriétés
      const root = result.properties || result.result || result;
      const properties = root.property || [];

      console.log(`Source: ${source.defaultRegion} | Trouvé: ${properties.length} propriétés`);

      if (properties.length === 0) continue;

      const updates = properties.map((p: any) => {
        const getVal = (field: any) => (Array.isArray(field) ? field[0] : field);

        // Extraction Ville et Région
        const town = (getVal(p.town) || getVal(p.city) || "").toString();
        let finalRegion = source.defaultRegion;
        const lowTown = town.toLowerCase();

        if (source.defaultRegion === "Costa del Sol") {
          if (["almeria", "mojacar", "vera", "pulpi", "cuevas"].some(k => lowTown.includes(k))) finalRegion = "Costa Almeria";
        } else {
          if (["murcia", "mazarron", "pilar", "alcazares", "san javier", "aguilas", "lo pagan"].some(k => lowTown.includes(k))) finalRegion = "Costa Calida";
        }

        // Extraction Images (Medianewbuild style)
        let cleanImages: string[] = [];
        const imgs = p.images?.[0]?.image;
        if (imgs) {
          cleanImages = (Array.isArray(imgs) ? imgs : [imgs])
            .map(img => (typeof img === 'string' ? img : (img._ || img.url || (img.$ && img.$.url))))
            .filter(url => url && typeof url === 'string' && url.startsWith('http'));
        }

        // Extraction Multilingue (FR)
        const descObj = p.description?.[0];
        const description = descObj?.fr?.[0] || descObj?.en?.[0] || "";

        const titleObj = p.title?.[0];
        const titre = titleObj?.fr?.[0] || titleObj?.en?.[0] || getVal(p.title) || "Villa Neuve";

        // Caractéristiques Techniques
        const baths = getVal(p.baths) || getVal(p.bathrooms) || "0";
        const beds = getVal(p.beds) || getVal(p.bedrooms) || "0";
        const surfaceObj = p.surface_area?.[0];
        const surfaceBuilt = surfaceObj?.built?.[0] || getVal(p.surface) || "0";
        const surfacePlot = surfaceObj?.plot?.[0] || "0";

        return {
          id_externe: String(getVal(p.id)),
          titre: titre,
          description: description,
          region: finalRegion,
          town: town || "Espagne",
          price: parseFloat(getVal(p.price)) || 0,
          type: getVal(p.type) || "Villa",
          beds: String(beds),
          baths: String(baths),
          surface_built: String(surfaceBuilt),
          surface_plot: String(surfacePlot),
          ref: getVal(p.ref) || getVal(p.reference) || String(getVal(p.id)),
          images: cleanImages,
          updated_at: new Date().toISOString()
        };
      });

      // L'upsert va mettre à jour les colonnes vides si id_externe existe déjà
      const { error } = await supabase.from('villas').upsert(updates, { 
        onConflict: 'id_externe' 
      });

      if (!error) totalSynced += updates.length;
      else console.error("Erreur Supabase:", error.message);
    }

    return NextResponse.json({ success: true, totalSynced });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}