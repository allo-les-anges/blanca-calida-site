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
      
      const rootKey = Object.keys(result)[0];
      const properties = result[rootKey].property || result[rootKey].properties?.property || [];

      const updates = properties.map((p: any) => {
        const getVal = (field: any) => Array.isArray(field) ? field[0] : field;
        const town = (getVal(p.location)?.city || getVal(p.city) || getVal(p.town) || "").toLowerCase();
        
        // 1. Détection Région
        let finalRegion = source.defaultRegion;
        const keywordsAlmeria = ["almeria", "mojacar", "vera", "cuevas", "pulpi"];
        const keywordsCalida = ["murcia", "mazarron", "aguilas", "pilar", "alcazares", "cartagena"];

        if (source.defaultRegion === "Costa del Sol" && keywordsAlmeria.some(word => town.includes(word))) {
             finalRegion = "Costa Almeria";
        } else if (source.defaultRegion === "Costa Blanca" && keywordsCalida.some(word => town.includes(word))) {
             finalRegion = "Costa Calida";
        }

        // 2. Extraction Images (Correction XML profonde)
        let cleanImages: string[] = [];
        const rawImages = p.images?.[0]?.image || p.images?.image;
        if (rawImages) {
          const imageArray = Array.isArray(rawImages) ? rawImages : [rawImages];
          cleanImages = imageArray.map((img: any) => {
            if (typeof img === 'string') return img;
            // On vérifie les attributs (@url) ou le contenu texte (_)
            return img.url || img._ || (img.$ && img.$.url);
          }).filter(url => typeof url === 'string' && url.startsWith('http'));
        }

        // 3. Extraction Description
        const descObj = getVal(p.description);
        const description = typeof descObj === 'object' 
          ? (descObj.fr || descObj.en || descObj._ || "") 
          : (descObj || "");

        return {
          id_externe: String(getVal(p.id)),
          titre: getVal(p.title)?.fr || getVal(p.title)?.en || getVal(p.title) || "Villa de luxe",
          description: description, // Envoyé vers la nouvelle colonne
          region: finalRegion,
          town: getVal(p.location)?.city || getVal(p.city) || getVal(p.town) || "Espagne",
          price: parseFloat(getVal(p.price)) || 0,
          type: getVal(p.type) || "Villa",
          beds: String(getVal(p.bedrooms) || getVal(p.beds) || "0"),
          ref: getVal(p.reference) || String(getVal(p.id)),
          images: cleanImages, // Stocké en JSONB
          updated_at: new Date().toISOString()
        };
      });

      const { error } = await supabase.from('villas').upsert(updates, { onConflict: 'id_externe' });
      if (error) console.error("Erreur Supabase:", error);
      else totalSynced += updates.length;
    }

    return NextResponse.json({ success: true, totalSynced });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}