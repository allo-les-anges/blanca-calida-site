import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // TEST RADICAL : On laisse passer tout le monde sans vérifier Supabase
  console.log("PASSAGE AUTORISÉ SUR :", request.nextUrl.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}