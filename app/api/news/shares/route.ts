// app/api/news/shares/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { NewsService } from '@/lib/services/news-service';
import { getClientIP } from '@/lib/utils/hash';
import { shareLimiter } from '@/lib/utils/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const clientIP = getClientIP(req);

    // Rate limiting: 5 shares per minute per IP
    try {
      await shareLimiter.check(5, clientIP);
    } catch {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const { newsId, slug, platform } = await req.json();

    if (!newsId && !slug) {
      return NextResponse.json(
        { error: 'newsId or slug is required' },
        { status: 400 }
      );
    }

    // Validate platform
    if (platform && !['twitter', 'facebook', 'reddit'].includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform. Must be twitter, facebook, or reddit' },
        { status: 400 }
      );
    }

    if (newsId) {
      await NewsService.incrementShares(newsId, platform);
    } else {
      await NewsService.incrementSharesBySlug(slug, platform);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Shares API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to increment shares' },
      { status: 500 }
    );
  }
}
