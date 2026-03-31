// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchSystem } from '@/lib/server/search-system';

export const runtime = 'nodejs'; // forces Node runtime

export async function POST(request: NextRequest) {
  try {
    await searchSystem.initialize();
    const { query, limit, offset, genre, platform, minRating, featuredOnly } = 
      await request.json();
    
    if (!query || typeof query !== 'string' || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const results = await searchSystem.search(query, {
      limit: limit || 20,
      offset: offset || 0,
      genre,
      platform,
      minRating,
      featuredOnly
    });

    return NextResponse.json({
      success: true,
      query,
      count: results.length,
      results
    });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return NextResponse.json(
        { error: 'Search system initializing, please retry' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Search failed', details: error.message },
      { status: 500 }
    );
  }
}

