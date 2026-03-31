// app/api/search/index/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { runtimeSearchManager } from '@/lib/server/runtimeSearchManager';

// 1. Tell Next.js NOT to statically generate this file at build time (Fixes the 28MB ISR build error)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('📡 Serving search index...');
    const startTime = Date.now();

    const indexData = await runtimeSearchManager.getIndexData();
    
    if (!indexData) {
      return NextResponse.json(
        { error: 'Search index not ready' },
        { status: 503 }
      );
    }

    // 2. Drastically reduce payload size by stripping heavy text fields.
    // FlexSearch already holds the text for searching. We only need UI fields here.
    const lightweightGames = indexData.games.map((game) => ({
      title: game.title,
      slug: game.slug,
      shortDescription: game.shortDescription,
      coverImage: game.coverImage,
      genre: game.genre,
      platforms: game.platforms,
      developer: game.developer,
      publisher: game.publisher,
      releaseDate: game.releaseDate,
      isFeatured: game.isFeatured,
      averageRating: game.averageRating,
      reviewCount: game.reviewCount,
      downloadCount: game.downloadCount,
      tags: game.tags,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
    }));

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      index: indexData.index,      // The serialized FlexSearch dictionary
      games: lightweightGames,     // The shrunk array (~3MB instead of ~28MB)
      metadata: {
        ...indexData.metadata,
        serverResponseTime: responseTime
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'CDN-Cache-Control': 'public, s-maxage=300',
      }
    });

  } catch (error) {
    console.error('❌ Failed to serve search index:', error);
    return NextResponse.json(
      { error: 'Failed to load search index' },
      { status: 500 }
    );
  }
}
