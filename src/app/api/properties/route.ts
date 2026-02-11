import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';

export async function GET() {
  const XML_URL = "https://medianewbuild.com/file/hh-media-bucket/agents/6d5cb68a-3636-4095-b0ce-7dc9ec2df2d2/feed_blanca_calida.xml";

  try {
    const response = await axios.get(XML_URL);
    
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      isArray: (name) => ["property", "image"].includes(name)
    });
    
    const result = parser.parse(response.data);
    
    // --- LOGIQUE DE SCANNER ---
    // On cherche le tableau 'property' peu importe où il est (kyero.property ou root.property)
    const rawProperties = result?.kyero?.property || result?.root?.property || result?.property || []; 

    console.log("🔍 Nombre de biens bruts détectés :", rawProperties.length);

    if (rawProperties.length === 0) {
      return NextResponse.json([]); // On renvoie un tableau vide proprement
    }

    const formattedProperties = rawProperties.map((p: any) => {
      // Extraction des images : on cherche p.images.image
      let images: string[] = [];
      if (p.images?.image) {
        images = p.images.image.map((img: any) => typeof img === 'string' ? img : img.url).filter(Boolean);
      }

      return {
        id: p.id || Math.random().toString(),
        ref: p.ref || "N/A",
        // Gestion multilingue simplifiée (Prio FR > EN > ES)
        title: p.title?.fr || p.title?.en || p.title?.es || p.title || "Villa de Luxe",
        price: p.price || 0,
        town: p.town || "Costa Blanca",
        type: p.type?.fr || p.type?.en || "Propriété",
        features: {
          beds: p.beds || 0,
          baths: p.baths || 0,
          surface: p.surface_area?.built || p.surface_area?.plot || 0
        },
        images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070"],
      };
    });

    return NextResponse.json(formattedProperties);

  } catch (error: any) {
    console.error("❌ Erreur Proxy XML:", error.message);
    return NextResponse.json({ error: 'Failed to parse XML', details: error.message }, { status: 500 });
  }
}