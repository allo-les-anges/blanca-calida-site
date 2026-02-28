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
      
      const root = result.properties || result;
      const propertiesRaw = root.property || [];

      if (propertiesRaw.length === 0) continue;

      const updates = propertiesRaw.map((p: any) => {
        const getVal = (field: any) => (Array.isArray(field) ? field[0] : field);

        // 1. Gestion de la région et ville
        const town = (getVal(p.town) || "").toString();
        const lowTown = town.toLowerCase();
        let finalRegion = source.defaultRegion;
        
        if (source.defaultRegion === "Costa del Sol") {
          if (["almeria", "mojacar", "vera", "pulpi"].some(k => lowTown.includes(k))) {
            finalRegion = "Costa Almeria";
          }
        } else {
          if (["murcia", "mazarron", "pilar", "alcazares", "san javier", "aguilas"].some(k => lowTown.includes(k))) {
            finalRegion = "Costa Calida";
          }
        }

        // 2. Extraction des Images
        let cleanImages: string[] = [];
        const imgs = p.images?.[0]?.image;
        if (imgs) {
          cleanImages = (Array.isArray(imgs) ? imgs : [imgs])
            .map(img => typeof img === 'string' ? img : (img.url || img._ || (img.$ && img.$.url)))
            .filter(url => url && typeof url === 'string' && url.startsWith('http'));
        }

        // 3. Multilingue (Description & Titre)
        const descObj = p.description?.[0];
        const descriptionFR = descObj?.fr?.[0] || descObj?.en?.[0] || "";
        const titleObj = p.title?.[0];
        const titreFR = titleObj?.fr?.[0] || titleObj?.en?.[0] || getVal(p.title) || "Villa";

        // 4. Caractéristiques (Salles de bain, Surfaces)
        const surfaceObj = p.surface_area?.[0];

        return {
          id_externe: String(getVal(p.id)),
          titre: titreFR,
          description: descriptionFR,
          region: finalRegion,
          town: town,
          ville: town, // On remplit les deux par sécurité
          price: parseFloat(getVal(p.price)) || 0,
          prix: parseFloat(getVal(p.price)) || 0,
          type: getVal(p.type) || "Villa",
          ref: getVal(p.ref) || getVal(p.reference) || String(getVal(p.id)),
          beds: String(getVal(p.beds) || "0"),
          baths: String(getVal(p.baths) || "0"),
          surface_built: String(surfaceObj?.built?.[0] || "0"),
          surface_plot: String(surfaceObj?.plot?.[0] || "0"),
          images: cleanImages,
          updated_at: new Date().toISOString()
        };
      });

      // L'upsert force la mise à jour des colonnes même si l'ID existe
      const { error } = await supabase.from('villas').upsert(updates, { 
        onConflict: 'id_externe' 
      });

      if (!error) totalSynced += updates.length;
    }

    return NextResponse.json({ success: true, totalSynced });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}