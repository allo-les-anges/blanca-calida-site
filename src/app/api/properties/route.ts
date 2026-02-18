import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import axios from "axios";

export async function GET() {
  const XML_URL =
    "https://medianewbuild.com/file/hh-media-bucket/agents/6d5cb68a-3636-4095-b0ce-7dc9ec2df2d2/feed_blanca_calida.xml";

  try {
    const response = await axios.get(XML_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/xml,text/xml",
      },
      timeout: 15000,
      responseType: "text", // 🔥 IMPORTANT pour éviter les flux vides
      decompress: true,      // 🔥 IMPORTANT si le flux est compressé
    });

    // 🔥 LOGS POUR COMPRENDRE CE QUE VERCEL REÇOIT
    console.log("STATUS:", response.status);
    console.log("HEADERS:", response.headers);
    console.log("LENGTH:", response.data?.length);
    console.log("FIRST 200 CHARS:", response.data?.slice(0, 200));

    console.log("RAW XML START >>>");
    console.log(response.data?.slice(0, 500));
    console.log("<<< RAW XML END");

    // --- PARSING XML ---
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      isArray: (name) =>
        ["property", "image", "feature", "tag"].includes(name),
    });

    const result = parser.parse(response.data);
    const properties = result?.root?.property || [];

    const allProperties = properties.map((p: any) => {
      let images: string[] = [];

      if (p.images?.image) {
        const raw = p.images.image;

        if (Array.isArray(raw)) {
          images = raw.map((img: any) => img.url);
        } else if (raw.url) {
          images = [raw.url];
        }
      }

      return {
        id: Number(p.id),
        ref: p.ref,
        date: p.date,
        key_date: p.key_date,
        price: Number(p.price),
        price_to: Number(p.price_to),
        currency: p.currency,
        price_freq: p.price_freq,
        new_build: p.new_build === "1",
        type: p.type,
        units: Number(p.units),

        town: p.town,
        province: p.province,
        country: p.country,

        location: {
          latitude: Number(p.location?.latitude),
          longitude: Number(p.location?.longitude),
          address: p.location?.address,
          area: p.location?.environment?.areas?.area,
          subarea: p.location?.environment?.subareas?.subarea,
        },

        beds: Number(p.beds),
        baths: Number(p.baths),
        pool: Number(p.pool),

        surface_area: {
          built: Number(p.surface_area?.built),
          plot: Number(p.surface_area?.plot),
          useful: Number(p.surface_area?.useful),
        },

        wc: Number(p.wc),
        terraces: Number(p.terraces),

        energy_rating: {
          consumption: p.energy_rating?.consumption,
          emissions: p.energy_rating?.emissions,
        },

        kitchen_type: p.kitchen_type,

        distances: {
          beach: Number(p.distances?.beach),
          airport: Number(p.distances?.airport),
          golf: Number(p.distances?.golf),
          green_areas: Number(p.distances?.green_areas),
        },

        urls: p.urls || {},
        development_name: p.development_name,

        title:
          p.title?.fr ||
          p.title?.en ||
          p.title?.es ||
          p.title ||
          "",

        description:
          p.desc?.fr ||
          p.desc?.en ||
          p.desc?.es ||
          p.desc ||
          "",

        features: p.features?.feature || [],
        tags: p.tags?.tag || [],
        images,
      };
    });

    return NextResponse.json(allProperties);
  } catch (error: any) {
    console.error("❌ Erreur XML:", error.message);
    return NextResponse.json(
      { error: "Erreur XML", details: error.message },
      { status: 500 }
    );
  }
}

