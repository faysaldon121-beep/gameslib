// app/api/games/download/[slug]/file/route.ts (full)
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Game from '@/models/Game';
import { getValidatedResponse } from '@/lib/downloadSession';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const game = await Game.findOne({ slug: params.slug }).select('_id title downloadLinks').lean();
    if (!game || !game.downloadLinks?.[0]?.url) {
      return NextResponse.json({ error: 'Game/download unavailable' }, { status: 404 });
    }

    const validatedResponse = getValidatedResponse(request, String(game._id));
    if (validatedResponse.status !== 200) {
      return validatedResponse;
    }
fetch(game.downloadLinks[0].url).then(resp=>resp).catch(err=>console.log(err));
    const fileResponse = await fetch(game.downloadLinks[0].url);
    if (!fileResponse.ok) {
      return NextResponse.json({ error: 'File unavailable' }, { status: 503 });
    }

    const response = new NextResponse(fileResponse.body, {
      status: 200,
      headers: {
        'Content-Type': fileResponse.headers.get('content-type') || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${game.title.replace(/[^a-z0-9]/gi, '_')}.zip"`,
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
