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
      
      const parser = new xml2js.Parser({ 
        explicitArray: false, 
        mergeAttrs: true,
        trim: true 
      });
      
      const result = await parser.parseStringPromise(xmlText);
      const rootKey = Object.keys(result)[0];
      let properties = result[rootKey].property || result[rootKey].properties?.property || [];
      if (!Array.isArray(properties)) properties = [properties];

      const updates = properties.map((p: any) => {
        
        // --- LOGIQUE D'EXTRACTION DE TEXTE AMÉLIORÉE ---
        const getText = (obj: any): string => {
          if (!obj) return "";
          if (typeof obj === 'string') return obj;
          
          // Cas 1: Le texte est dans une sous-langue fr
          if (obj.fr) {
            if (typeof obj.fr === 'string') return obj.fr;
            if (obj.fr._) return obj.fr._; // Contenu CDATA dans fr
          }
          
          // Cas 2: Le texte est à la racine de la balise (_)
          if (obj._) return obj._;

          // Cas 3: Fallback anglais
          if (obj.en) {
            if (typeof obj.en === 'string') return obj.en;
            if (obj.en._) return obj.en._;
          }

          return "";
        };

        const finalDesc = getText(p.description);

        // --- SURFACES ---
        const built = p.surface_area?.built || p.surface_built || "0";
        const plot = p.surface_area?.plot || p.surface_plot || "0";
        const townVal = p.town || p.city || "Espagne";

        return {
          id_externe: String(p.id),
          
          // On force le String pour éviter d'envoyer un objet vide
          description: String(finalDesc || "").trim(),
          details: String(finalDesc || "").trim(),
          
          town: String(townVal),
          ville: String(townVal),
          price: parseFloat(p.price) || 0,
          prix: parseFloat(p.price) || 0,
          beds: String(p.beds || p.bedrooms || "0"),
          baths: String(p.baths || p.bathrooms || "0"),
          surface_built: String(built),
          surface_plot: String(plot),
          titre: getText(p.title) || "Villa Neuve",
          type: p.type || "Villa",
          ref: p.ref || p.reference || String(p.id),
          region: source.defaultRegion,
          images: p.images?.image ? (Array.isArray(p.images.image) ? p.images.image : [p.images.image]) : [],
          updated_at: new Date().toISOString()
        };
      });

      const { error } = await supabase
        .from('villas')
        .upsert(updates, { onConflict: 'id_externe' });

      if (error) console.error("Erreur Supabase:", error.message);
      else totalSynced += updates.length;
    }

    return NextResponse.json({ success: true, totalSynced });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}