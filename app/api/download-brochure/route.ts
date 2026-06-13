import { NextResponse } from 'next/server';

const ALLOWED_HOST = 'medianewbuild.com';
const ALLOWED_PATH_PREFIX = '/file/hh-media-bucket/';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('url');

    if (!source) {
      return NextResponse.json({ error: 'Missing brochure URL' }, { status: 400 });
    }

    const brochureUrl = new URL(source);
    const isAllowed =
      brochureUrl.protocol === 'https:' &&
      brochureUrl.hostname === ALLOWED_HOST &&
      brochureUrl.pathname.startsWith(ALLOWED_PATH_PREFIX) &&
      brochureUrl.pathname.toLowerCase().endsWith('.pdf');

    if (!isAllowed) {
      return NextResponse.json({ error: 'Invalid brochure URL' }, { status: 400 });
    }

    const response = await fetch(brochureUrl.toString(), { cache: 'no-store' });
    if (!response.ok || !response.body) {
      return NextResponse.json({ error: 'Brochure unavailable' }, { status: 502 });
    }

    const filename = brochureUrl.pathname.split('/').pop() || 'brochure.pdf';

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Download brochure error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
