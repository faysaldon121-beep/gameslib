// app/api/news/views/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { NewsService } from '@/lib/services/news-service';
import { getClientIP } from '@/lib/utils/hash';
import { viewLimiter } from '@/lib/utils/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const clientIP = getClientIP(req);

    // Rate limiting: 10 views per minute per IP
    try {
      await viewLimiter.check(10, clientIP);
    } catch {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Too many requests.' },
        { status: 429 }
      );
    }

    const { newsId, slug } = await req.json();

    if (!newsId && !slug) {
      return NextResponse.json(
        { error: 'newsId or slug is required' },
        { status: 400 }
      );
    }

    let result;
    if (newsId) {
      result = await NewsService.incrementViews(newsId, clientIP);
    } else {
      result = await NewsService.incrementViewsBySlug(slug, clientIP);
    }

    return NextResponse.json({ 
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Views API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to increment views' },
      { status: 500 }
    );
  }
}
