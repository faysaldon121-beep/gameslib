import { NextRequest, NextResponse } from 'next/server';
import { NewsService } from '@/lib/services/news-service';

const VALID_PLATFORMS = ['facebook', 'twitter', 'reddit'] as const;
type SharePlatform = (typeof VALID_PLATFORMS)[number];

export async function POST(request: NextRequest) {
  try {
    const { newsId, platform } = await request.json();

    if (!newsId || typeof newsId !== 'string') {
      return NextResponse.json(
        { error: 'Valid news ID required' },
        { status: 400 }
      );
    }

    if (!platform || !VALID_PLATFORMS.includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform. Must be: facebook, twitter, or reddit' },
        { status: 400 }
      );
    }

    await NewsService.incrementShares(newsId, platform as SharePlatform);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to track share:', error);
    return NextResponse.json(
      { error: 'Failed to track share' },
      { status: 500 }
    );
  }
}
