// app/api/games/download/[slug]/file/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Game from '@/models/Game';
import { validateDownloadSession } from '@/lib/downloadSession';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Validate session cookie (single-use, expires in 1hr)
    const gameId = await validateDownloadSession(request);
    if (!gameId) {
      return NextResponse.json({ error: 'Invalid or expired session. Please try again.' }, { status: 401 });
    }

    await connectDB();
    const game = await Game.findById(gameId).select('title downloadLinks').lean();

    if (!game || !game.downloadLinks?.[0]?.url) {
      return NextResponse.json({ error: 'Download unavailable' }, { status: 404 });
    }

    // Proxy the actual download (hides real URL)
    const fileResponse = await fetch(game.downloadLinks[0].url);

    if (!fileResponse.ok) {
      return NextResponse.json({ error: 'File temporarily unavailable' }, { status: 503 });
    }

    return new NextResponse(fileResponse.body, {
      headers: {
        'Content-Type': fileResponse.headers.get('content-type') || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${game.title.replace(/[^a-z0-9]/gi, '_')}.zip"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Download proxy error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
