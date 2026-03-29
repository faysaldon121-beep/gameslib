import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Game from '@/models/Game';
import { getValidatedResponse } from '@/lib/downloadSession';
import { extractDownloadLink } from '@/lib/browser-singleton';

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

    const fileResponse = await fetch(downloadUrl, { 
      signal: AbortSignal.timeout(120000) 
    });

    if (!fileResponse.ok) {
      return NextResponse.json(
        { error: `Download server error: ${fileResponse.status}` },
        { status: 503 }
      );
    }

    const response = new NextResponse(fileResponse.body, {
      status: 200,
      headers: {
        'Content-Type':
          fileResponse.headers.get('content-type') || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${game.title
          .replace(/[^a-z0-9]/gi, '_')
          .toLowerCase()}.zip"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    });

    validatedResponse.headers.forEach((value: string, key: string) => {
      if (key.toLowerCase() === 'set-cookie') {
        response.headers.append(key, value);
      }
    });

    return response;
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
