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
        
        // --- EXTRACTION DE LA DESCRIPTION (MÉTHODE ROBUSTE) ---
        const getLongText = (node: any): string => {
          if (!node) return "";
          if (typeof node === 'string') return node;
          
          // Dans le XML Medianewbuild, le texte est souvent dans .fr, .en ou ._ (CDATA)
          const target = node.fr || node.en || node._ || node.value;
          
          if (target) {
            return typeof target === 'string' ? target : getLongText(target);
          }

          // Si c'est un objet sans clé connue, on cherche la première chaîne de caractères
          const firstString = Object.values(node).find(v => typeof v === 'string');
          return firstString ? (firstString as string) : "";
        };

        const finalDescription = getLongText(p.description);

        // --- TITRE ---
        let finalTitle = "Villa Neuve";
        if (p.title) {
          finalTitle = typeof p.title === 'string' ? p.title : (p.title.fr || p.title.en || p.title._ || "Villa Neuve");
        }

        // --- SURFACES ---
        // On s'assure d'extraire depuis l'objet surface_area
        const built = p.surface_area?.built || p.surface_built || "0";
        const plot = p.surface_area?.plot || p.surface_plot || "0";

        // --- IMAGES ---
        let imagesArray: string[] = [];
        if (p.images?.image) {
          const imgData = p.images.image;
          imagesArray = Array.isArray(imgData) ? imgData : [imgData];
        }

        return {
          id_externe: String(p.id),
          titre: String(finalTitle),
          description: String(finalDescription), // Injection du texte extrait
          region: source.defaultRegion,
          town: p.town || p.city || "Espagne",
          price: parseFloat(p.price) || 0,
          beds: String(p.beds || p.bedrooms || "0"),
          baths: String(p.baths || p.bathrooms || "0"),
          surface_built: String(built),
          surface_plot: String(plot),
          images: imagesArray,
          ref: p.ref || p.reference || String(p.id),
          updated_at: new Date().toISOString()
        };
      });

      // L'upsert met à jour les champs "description" qui sont actuellement vides (EMPTY)
      const { error } = await supabase
        .from('villas')
        .upsert(updates, { onConflict: 'id_externe' });

      if (error) {
        console.error(`Erreur Supabase (${source.defaultRegion}):`, error.message);
      } else {
        totalSynced += updates.length;
      }
    }

    return NextResponse.json({ success: true, totalSynced });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}