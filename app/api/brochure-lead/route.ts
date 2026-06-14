import { NextResponse } from "next/server";

const ZOHO_WEB_TO_LEAD_URL = "https://crm.zoho.eu/crm/WebToLeadForm";
const ALLOWED_HOST = "medianewbuild.com";
const ALLOWED_PATH_PREFIX = "/file/hh-media-bucket/";

function isAllowedBrochureUrl(value: unknown) {
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === ALLOWED_HOST && url.pathname.startsWith(ALLOWED_PATH_PREFIX);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
    const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const propertyRef = typeof body.propertyRef === "string" ? body.propertyRef.trim() : "General_Interest";
    const propertyTitle = typeof body.propertyTitle === "string" ? body.propertyTitle.trim() : "";
    const brochureUrl = typeof body.brochureUrl === "string" ? body.brochureUrl.trim() : "";

    if (!firstName || !lastName || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid lead data" }, { status: 400 });
    }

    if (!isAllowedBrochureUrl(brochureUrl)) {
      return NextResponse.json({ error: "Invalid brochure URL" }, { status: 400 });
    }

    const zohoResponse = await fetch(ZOHO_WEB_TO_LEAD_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        xnQsjsdp: "89dec12b0f4964ef48eb1146afdf728288b1067dc6b63cb582637ae5b06a02fb",
        zc_gad: "",
        xmIwtLD: "a31c3c626df8e3bd4a030929931d95f293b65e415d7072f7b6a8cb68d029701b7626c355eb89a4275cd16caebd9c7c40",
        actionType: "TGVhZHM=",
        returnURL: "https://www.amaru-homes.com/merci",
        Company: firstName,
        "Last Name": lastName,
        Email: email,
        Designation: `Brochure - ${propertyRef}`,
        Description: `Demande de brochure pour ${propertyTitle || propertyRef}. URL: ${brochureUrl}`,
        "Lead Source": "Website brochure download",
      }),
      cache: "no-store",
    });

    if (!zohoResponse.ok) {
      return NextResponse.json({ error: "Lead submission failed" }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Brochure lead error:", error);
    return NextResponse.json({ error: "Lead submission failed" }, { status: 500 });
  }
}
