import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // On récupère la session
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  const pathname = request.nextUrl.pathname

  // LOGIQUE DE PROTECTION
  if (pathname.startsWith('/super-admin') || pathname.startsWith('/admin')) {
    
    // 1. Si tu es Gaétan, on te laisse passer quoi qu'il arrive
    if (user?.email === 'gaetan@amaru-homes.com') {
      return response
    }

    // 2. Si vraiment il n'y a personne de connecté, on renvoie au login
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  // On applique ce filtre à tout le site sauf les images et l'api
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}