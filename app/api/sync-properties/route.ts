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
    const languages = ['fr', 'en', 'es', 'nl', 'pl', 'ar'];

    for (const source of SOURCES) {
      const response = await fetch(source.url, { cache: 'no-store' });
      const xmlText = await response.text();
      
      const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true, trim: true });
      const result = await parser.parseStringPromise(xmlText);
      const rootKey = Object.keys(result)[0];
      let properties = result[rootKey].property || [];
      if (!Array.isArray(properties)) properties = [properties];

      const updates = properties.map((p: any) => {
        const surf = p.surface_area || {};
        const loc = p.location || {};
        const dists = p.distances || {}; 
        
        // Gestion des images (extraction de l'URL si objet ou string)
        let imagesArray: string[] = [];
        if (p.images && p.images.image) {
          const rawImages = Array.isArray(p.images.image) ? p.images.image : [p.images.image];
          imagesArray = rawImages
            .map((img: any) => (typeof img === 'string' ? img : img.url))
            .filter((u: any) => typeof u === 'string');
        }

        // Objet de base mappé sur vos colonnes SQL exactes
        const base: any = {
          id_externe: String(p.id),
          ref: String(p.ref || p.id),
          town: String(p.town || loc.town || "Espagne"),
          ville: String(p.town || loc.town || "Espagne"),
          province: String(p.province || ""),
          region: source.defaultRegion,
          latitude: loc.latitude ? parseFloat(loc.latitude) : null,
          longitude: loc.longitude ? parseFloat(loc.longitude) : null,
          type: String(p.type || "Villa"),
          beds: String(p.beds || "0"),
          baths: String(p.baths || "0"),
          pool: (p.pool === "1" || JSON.stringify(p.features).includes("pool")) ? "Oui" : "Non",
          price: parseFloat(p.price) || 0,
          prix: parseFloat(p.price) || 0,
          currency: String(p.currency || "EUR"),
          distance_beach: dists.beach ? String(dists.beach) : null,
          distance_golf: dists.golf ? String(dists.golf) : null,
          distance_town: dists.town_distance || dists.town || null,
          surface_built: String(surf.built || "0"),
          surface_plot: String(surf.plot || "0"),
          surface_useful: String(surf.useful || "0"),
          images: imagesArray,
          updated_at: new Date().toISOString(),
          
          // MAPPING CORRIGÉ SELON VOTRE SQL :
          promoteur_name: p.development_name ? String(p.development_name) : null,
          commission_percentage: p.commission?.quantity ? parseFloat(p.commission.quantity) : 0,
          is_excluded: false // Valeur par défaut
        };

        // Titres et descriptions multilingues
        const titleObj = p.title || {};
        const descObj = p.desc || {};

        for (const lang of languages) {
          let titre = p.development_name || titleObj[lang] || titleObj.fr || titleObj.en || "Villa Moderne";
          base[`titre_${lang}`] = String(titre).trim();

          let description = descObj[lang] || descObj.fr || descObj.en || "";
          base[`description_${lang}`] = String(description).trim();
        }

        return base;
      });

      // Upsert vers Supabase
      const { error, data } = await supabase
        .from('villas')
        .upsert(updates, { onConflict: 'id_externe' })
        .select('id_externe');

      if (error) {
        console.error(`Erreur d'insertion pour ${source.url}:`, error.message);
      } else {
        totalSynced += data?.length || 0;
      }
    }

    return NextResponse.json({ success: true, totalSynced });
  } catch (error: any) {
    console.error("Erreur de synchronisation:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}