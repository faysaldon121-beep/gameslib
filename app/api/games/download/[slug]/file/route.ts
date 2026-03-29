import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Game from '@/models/Game';
import { getValidatedResponse } from '@/lib/downloadSession';
import { extractDownloadLink } from '@/lib/puppeteer-extractor';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    // Get game
    const game = await Game.findOne({ slug: params.slug }).select('_id title').lean();
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Validate download session
    const validatedResponse = getValidatedResponse(request, String(game._id));
    if (validatedResponse.status !== 200) {
      return validatedResponse;
    }

    // Extract download link (will use cache if available)
    const downloadUrl = await extractDownloadLink(
      `https://ankergames.net/game/${params.slug}`
    );

    if (!downloadUrl) {
      return NextResponse.json(
        { error: 'Download link unavailable' },
        { status: 503 }
      );
    }

    // Fetch file from download URL
    let fileResponse: Response;
    try {
      fileResponse = await fetch(downloadUrl, {
        timeout: 120000, // 2 minutes
      });
    } catch (fetchErr) {
      console.error('Fetch error:', fetchErr);
      return NextResponse.json(
        { error: 'Failed to download file' },
        { status: 503 }
      );
    }

    if (!fileResponse.ok) {
      return NextResponse.json(
        { error: `Download server error: ${fileResponse.status}` },
        { status: 503 }
      );
    }

    // Stream response
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

    // Append validated cookie
    validatedResponse.headers.forEach((value, key) => {
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
