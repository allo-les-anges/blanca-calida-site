import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Création d'une réponse initiale
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Initialisation du client Supabase spécifique au Middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Mise à jour des cookies dans la requête et la réponse
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Récupération de l'utilisateur (plus sécurisé que getSession)
  const { data: { user } } = await supabase.auth.getUser()

  // 4. Définition des routes protégées
  const pathname = request.nextUrl.pathname
  const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/super-admin')

  // 5. Logique de redirection
  if (isProtectedRoute && !user) {
    // Si l'utilisateur n'est pas connecté, on le renvoie au login
    // en gardant en mémoire l'URL qu'il tentait de rejoindre
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 6. Sécurité supplémentaire : Empêcher un client lambda d'aller sur /admin
  // Si l'utilisateur est connecté mais n'est pas TOI (gaetan@amaru-homes.com)
  if (pathname.startsWith('/admin') && user && user.email !== 'gaetan@amaru-homes.com') {
    const url = request.nextUrl.clone()
    url.pathname = '/project-tracker' // Redirection vers son propre suivi
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf :
     * - api (les routes API ont leur propre logique)
     * - _next/static (fichiers statiques)
     * - _next/image (images optimisées)
     * - favicon.ico, images du dossier public
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$).*)',
  ],
}