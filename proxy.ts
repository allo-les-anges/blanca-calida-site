import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// CHANGEMENT ICI : La fonction doit s'appeler 'proxy' et non 'middleware'
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

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  const pathname = request.nextUrl.pathname

  // Protection des routes admin et super-admin
  if (pathname.startsWith('/admin') || pathname.startsWith('/super-admin')) {
    if (!user) {
      console.log("Accès refusé : redirection login");
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Autorisation directe pour ton email
    if (user.email === 'gaetan@amaru-homes.com') {
      return response;
    }
  }

  return response
}

export const config = {
  // On surveille tout sauf les fichiers statiques et l'api
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$).*)'],
}