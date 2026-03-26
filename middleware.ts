import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  // On injecte l'URL complète dans les headers pour que le Layout puisse la lire
  requestHeaders.set('x-url', request.url);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  });
}

export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf les fichiers statiques (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};