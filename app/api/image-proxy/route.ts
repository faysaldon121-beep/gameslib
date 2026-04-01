// app/api/image-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Cache configuration
const CACHE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function GET(request: NextRequest) {
  const imageUrl = request.nextUrl.searchParams.get('url');
  
  if (!imageUrl) {
    return NextResponse.json({ error: 'url parameter required' }, { status: 400 });
  }

  // Security: Validate domain
  const allowedDomains = ['ankergames.net', 'images.unsplash.com'];
  
  try {
    const url = new URL(imageUrl);
    const isAllowed = allowedDomains.some(domain => 
      url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    );
    
    if (!isAllowed) {
      return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
    }

    // Fetch image
    const imageResponse = await fetch(imageUrl, {
      next: { revalidate: CACHE_MAX_AGE }, // Next.js cache
    });

    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Image fetch failed' }, { status: 502 });
    }

    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const imageBuffer = await imageResponse.arrayBuffer();

    // Return with aggressive caching
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, immutable`,
        'CDN-Cache-Control': `public, max-age=${CACHE_MAX_AGE}`,
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
