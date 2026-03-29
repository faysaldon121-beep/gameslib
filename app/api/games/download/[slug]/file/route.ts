import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Game from '@/models/Game';
import { getValidatedResponse } from '@/lib/downloadSession';
import { extractDownloadLink } from '@/lib/puppeteer-extractor.js';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    await connectDB();

    const game = await Game.findOne({ slug }).select('_id title').lean();
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const validatedResponse = getValidatedResponse(request, String(game._id));
    if (validatedResponse.status !== 200) {
      return validatedResponse;
    }

    const downloadUrl = await extractDownloadLink(
      slug,
      `https://ankergames.net/game/${slug}`
    );

    if (!downloadUrl) {
      return NextResponse.json(
        { error: 'Download link unavailable' },
        { status: 503 }
      );
    }

    // Just return the URL to the client
    return NextResponse.json({ 
      success: true,
      downloadUrl,
      title: game.title 
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
