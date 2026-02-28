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
    let logs: string[] = [];

    for (const source of SOURCES) {
      const response = await fetch(source.url, { cache: 'no-store' });
      const xmlText = await response.text();
      
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
        // Objets imbriqués selon votre structure XML
        const surf = p.surface_area || {};
        const loc = p.location || {};
        const dists = p.distances || {}; // La balise <distances> identifiée
        
        // Extraction sécurisée des images
        let imagesArray: string[] = [];
        if (p.images && p.images.image) {
          const rawImages = Array.isArray(p.images.image) ? p.images.image : [p.images.image];
          imagesArray = rawImages
            .map((img: any) => (typeof img === 'string' ? img : img.url))
            .filter((u: any) => typeof u === 'string');
        }

        // Mapping complet et corrigé
        return {
          id_externe: String(p.id),
          ref: String(p.ref || p.id),
          // Utilise le development_name si le titre est trop générique
          titre: String(p.development_name || p.title?.fr || p.title?.en || "Villa Moderne").trim(),
          description: String(p.desc?.fr || p.desc?.en || p.desc || "").trim(),
          details: String(p.desc?.fr || p.desc?.en || p.desc || "").trim(),
          
          // Localisation
          town: String(p.town || loc.town || "Espagne"),
          ville: String(p.town || loc.town || "Espagne"),
          province: String(p.province || loc.province || ""),
          region: source.defaultRegion,
          latitude: loc.latitude ? parseFloat(loc.latitude) : null,
          longitude: loc.longitude ? parseFloat(loc.longitude) : null,
          adresse: String(loc.address || p.address || "").trim(),
          
          // Caractéristiques
          type: String(p.type || "Villa"),
          beds: String(p.beds || "0"),
          baths: String(p.baths || "0"),
          // Dans votre XML <pool>0</pool> ou <pool>1</pool>
          pool: (p.pool === "1" || p.pool === "Oui" || String(p.pool).toLowerCase() === "yes") ? "Oui" : "Non",
          
          // Prix
          price: parseFloat(p.price) || 0,
          prix: parseFloat(p.price) || 0,
          currency: String(p.currency || "EUR"),
          
          // --- CORRECTION DISTANCES (On cible l'objet dists extrait de p.distances) ---
          distance_beach: dists.beach ? String(dists.beach) : null,
          distance_town: dists.town_distance || dists.town_dist ? String(dists.town_distance || dists.town_dist) : null,
          distance_golf: dists.golf ? String(dists.golf) : null,
          
          // --- SURFACES ---
          surface_built: String(surf.built || "0"),
          surface_plot: String(surf.plot || "0"),
          surface_useful: String(surf.useful || "0"),
          
          images: imagesArray,
          updated_at: new Date().toISOString()
        };
      });

      // Filtrage TypeScript-safe
      const validUpdates = (updates as any[]).filter((u: any) => 
        u.id_externe && u.id_externe !== "undefined"
      );

      // Upsert vers Supabase
      const { error, data } = await supabase
        .from('villas')
        .upsert(validUpdates, { 
          onConflict: 'id_externe',
          ignoreDuplicates: false 
        })
        .select('id_externe');

      if (error) {
        logs.push(`Erreur ${source.defaultRegion}: ${error.message}`);
      } else {
        const count = data?.length || 0;
        totalSynced += count;
        logs.push(`${source.defaultRegion}: ${count} propriétés traitées.`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      totalSynced, 
      details: logs 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}