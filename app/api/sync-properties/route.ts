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
      
      // Configuration pour gérer les CDATA et les attributs
      const parser = new xml2js.Parser({ 
        explicitArray: true, 
        mergeAttrs: true,
        trim: true 
      });
      
      const result = await parser.parseStringPromise(xmlText);
      
      // Correction de l'accès à la racine (gère result.properties ou result)
      const root = result.properties || result;
      const propertiesRaw = root.property || [];
      
      if (propertiesRaw.length === 0) {
        console.log(`Aucune propriété trouvée pour ${source.url}`);
        continue;
      }

      const updates = propertiesRaw.map((p: any) => {
        const getVal = (field: any) => (Array.isArray(field) ? field[0] : field);

        // 1. Localisation & Tri des régions
        const town = (getVal(p.town) || "").toString().toLowerCase();
        let finalRegion = source.defaultRegion;
        
        if (source.defaultRegion === "Costa del Sol") {
          if (["almeria", "mojacar", "vera", "pulpi"].some(k => town.includes(k))) {
            finalRegion = "Costa Almeria";
          }
        } else if (source.defaultRegion === "Costa Blanca") {
          if (["murcia", "mazarron", "pilar", "alcazares", "san javier", "aguilas"].some(k => town.includes(k))) {
            finalRegion = "Costa Calida";
          }
        }

        // 2. Images (Extraction propre des URLs Medianewbuild)
        let cleanImages: string[] = [];
        const imgs = p.images?.[0]?.image;
        if (imgs) {
          cleanImages = (Array.isArray(imgs) ? imgs : [imgs])
            .map(img => {
              if (typeof img === 'string') return img;
              return img.url || img._ || (img.$ && img.$.url);
            })
            .filter(url => url && typeof url === 'string' && url.startsWith('http'));
        }

        // 3. Multilingue : Description & Titre (Extraction des balises <fr>)
        const descObj = p.description?.[0];
        const description = descObj?.fr?.[0] || descObj?.en?.[0] || (typeof descObj === 'string' ? descObj : "");

        const titleObj = p.title?.[0];
        const titre = titleObj?.fr?.[0] || titleObj?.en?.[0] || getVal(p.title) || "Villa Neuve";

        // 4. Caractéristiques (Salles de bain, Surface, Chambres)
        const baths = getVal(p.baths) || getVal(p.bathrooms) || "0";
        const beds = getVal(p.beds) || getVal(p.bedrooms) || "0";
        
        // Structure: <surface_area><built>...</built></surface_area>
        const surfaceObj = p.surface_area?.[0];
        const surfaceBuilt = surfaceObj?.built?.[0] || getVal(p.surface) || "0";
        const surfacePlot = surfaceObj?.plot?.[0] || "0";

        return {
          id_externe: String(getVal(p.id)),
          titre: titre,
          description: description,
          region: finalRegion,
          town: getVal(p.town) || "Espagne",
          price: parseFloat(getVal(p.price)) || 0,
          type: getVal(p.type) || "Villa",
          beds: String(beds),
          baths: String(baths),
          surface_built: String(surfaceBuilt),
          surface_plot: String(surfacePlot),
          ref: getVal(p.ref) || getVal(p.reference) || String(getVal(p.id)),
          images: cleanImages,
          details: {
            bathrooms: baths,
            surface: surfaceBuilt,
            plot: surfacePlot,
            beds: beds
          },
          updated_at: new Date().toISOString()
        };
      });

      // Upsert dans Supabase
      const { error } = await supabase.from('villas').upsert(updates, { 
        onConflict: 'id_externe',
        ignoreDuplicates: false 
      });

      if (!error) {
        totalSynced += updates.length;
      } else {
        console.error("Erreur Supabase lors de l'insertion:", error.message);
      }
    }

    return NextResponse.json({ success: true, totalSynced });
  } catch (error: any) {
    console.error("Erreur critique synchronisation:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}