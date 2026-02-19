import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // On construit le chemin vers public/feed.json
    const filePath = path.join(process.cwd(), 'public', 'feed.json');
    
    // On lit le fichier de manière asynchrone
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    // On parse le JSON
    const data = JSON.parse(fileContent);

    // Sécurité : On s'assure de toujours renvoyer un tableau
    const properties = Array.isArray(data) ? data : (data.properties || []);

    return NextResponse.json(properties);
  } catch (error) {
    console.error("Erreur lecture feed.json:", error);
    return NextResponse.json({ error: "Impossible de lire les données" }, { status: 500 });
  }
}
