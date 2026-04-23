import { NextRequest, NextResponse } from 'next/server';
import { NewsService } from '@/lib/services/news-service';

export async function POST(request: NextRequest) {
  try {
    const { newsId } = await request.json();

    if (!newsId || typeof newsId !== 'string') {
      return NextResponse.json(
        { error: 'Valid news ID required' },
        { status: 400 }
      );
    }

    await NewsService.incrementViews(newsId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to track view:', error);
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    );
  }
}
