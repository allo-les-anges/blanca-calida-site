import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, region, message } = body;

    // 1. ENVOI VERS ZOHO CRM (Web-to-Lead ou API)
    // Remplacer l'URL par votre Web-to-Lead hook ou votre endpoint d'automatisation
    const zohoResponse = await fetch("https://crm.zoho.eu/crm/WebToLeadForm", {
      method: "POST",
      body: new URLSearchParams({
        'xnpe_force': '1',
        'Last Name': name,
        'Email': email,
        'Description': `Région: ${region} | Message: ${message}`,
        // Ajoutez ici vos identifiants Zoho (FormId, etc.)
      })
    });

    // 2. NOTIFICATION GILLIAN 
    // Option simple : Envoi d'un email via un service comme Resend ou SendGrid
    // Ou via un webhook Slack/Teams si Gillian l'utilise

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}