// app/api/games/download/[slug]/start/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Game from '@/models/Game';
import { generateDownloadSession } from '@/lib/downloadSession';

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const game = await Game.findOne({ slug: params.slug }).select('_id title').lean();

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    await generateDownloadSession(String(game._id));

    return NextResponse.json({ 
      success: true, 
      title: game.title,
      message: 'Secure session created (1 hour expiry).'
    });
  } catch (error) {
    console.error('Download start error:', error);
    return NextResponse.json({ error: 'Failed to prepare download' }, { status: 500 });
  }
}
