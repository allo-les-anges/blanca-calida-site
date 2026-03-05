import { createBrowserClient } from '@supabase/ssr';

// On centralise la création du client pour éviter les erreurs d'instance multiples
// et faciliter la maintenance des clés API.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERREUR: Les variables d'environnement Supabase sont manquantes !");
}

export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
);