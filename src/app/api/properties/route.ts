import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import axios from "axios";

export async function GET() {
  const XML_URL =
    "https://medianewbuild.com/file/hh-media-bucket/agents/6d5cb68a-3636-4095-b0ce-7dc9ec2df2d2/feed_blanca_calida.xml";

  try {
    const response = await axios.get(XML_URL);

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      isArray: (name) => ["development", "property", "image"].includes(name),
    });

    const result = parser.parse(response.data);

    const developments =
      result?.root?.developments?.development ||
      result?.developments?.development ||
      [];

    const allProperties = developments.flatMap((dev: any) => {
      const devId = dev.id;
      const devName = dev.name;
      const devLocation = dev.location || "";
      const devDescription = dev.description || "";
      const devImages = dev.images?.image || [];

      const properties = dev.properties?.property || [];

      return properties.map((p: any) => {
        const images = p.images?.image || [];

        return {
          id: p.id,
          ref: p.ref || p.reference,
          title: p.title,
          town: p.town,
          price: Number(p.price) || 0,
          availability: p.availability || "unknown",

          features: {
            beds: Number(p.features?.beds) || 0,
            baths: Number(p.features?.baths) || 0,
            surface: Number(p.features?.surface) || 0,
          },

          images,

          development_id: devId,
          development_name: devName,
          development_location: devLocation,
          development_description: devDescription,
          development_images: devImages,
        };
      });
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
