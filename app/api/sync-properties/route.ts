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
      
      // Configuration du parser sans l'option 'cdata' (non supportée par les types TS)
      const parser = new xml2js.Parser({ 
        explicitArray: false, 
        mergeAttrs: true,
        trim: true
      });
      
      const result = await parser.parseStringPromise(xmlText);
      const rootKey = Object.keys(result)[0];
      let properties = result[rootKey].property || [];
      if (!Array.isArray(properties)) properties = [properties];

      const updates = properties.map((p: any) => {
        
        // 1. Extraction des surfaces (Imbriqué dans <surface_area>)
        const surf = p.surface_area || {};
        
        // 2. Extraction localisation (Imbriqué dans <location>)
        const loc = p.location || {};

        // 3. Gestion des images (<image><url>)
        let imagesArray: string[] = [];
        if (p.images && p.images.image) {
          const rawImages = Array.isArray(p.images.image) ? p.images.image : [p.images.image];
          imagesArray = rawImages
            .map((img: any) => img.url)
            .filter((url: any) => typeof url === 'string');
        }

        // 4. Extraction Titre et Description (Priorité au Français)
        const descFr = p.desc?.fr || p.desc?.en || "";
        const titleFr = p.title?.fr || p.title?.en || "Villa Moderne";

        return {
          id_externe: String(p.id),
          ref: String(p.ref || ""),
          titre: String(titleFr).trim(),
          description: String(descFr).trim(),
          details: String(descFr).trim(),
          
          // Localisation & Ville
          town: String(p.town || "Calpe"),
          ville: String(p.town || "Calpe"),
          region: source.defaultRegion,
          latitude: loc.latitude ? parseFloat(loc.latitude) : null,
          longitude: loc.longitude ? parseFloat(loc.longitude) : null,
          adresse: String(loc.address || "").trim(),
          
          // Caractéristiques techniques
          price: parseFloat(p.price) || 0,
          prix: parseFloat(p.price) || 0,
          beds: String(p.beds || "0"),
          baths: String(p.baths || "0"),
          pool: p.pool === "1" ? "Oui" : "Non",
          
          // Nouveaux champs de surface
          surface_built: String(surf.built || "0"),
          surface_plot: String(surf.plot || "0"),
          surface_useful: String(surf.useful || "0"),
          
          images: imagesArray,
          updated_at: new Date().toISOString()
        };
      });

      // Envoi vers Supabase (écrase si id_externe existe déjà)
      const { error } = await supabase
        .from('villas')
        .upsert(updates, { onConflict: 'id_externe' });

      if (error) {
        console.error(`Erreur Supabase pour ${source.defaultRegion}:`, error.message);
      } else {
        totalSynced += updates.length;
      }
    }

    return NextResponse.json({ success: true, totalSynced });
  } catch (error: any) {
    console.error("Erreur de synchronisation:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}