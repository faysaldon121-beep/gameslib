// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchSystem } from '@/lib/server/search-system';

export async function POST(request: NextRequest) {
  try {
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

// app/api/search/status/route.ts
import { NextResponse } from 'next/server';
import { searchSystem } from '@/lib/server/search-system';

export async function GET() {
  const status = searchSystem.getStatus();
  const health = await searchSystem.healthCheck();
  
  return NextResponse.json({
    status: health.status,
    ...status,
    health
  });
}

// app/api/search/rebuild/route.ts (Admin only!)
import { NextResponse } from 'next/server';
import { searchSystem } from '@/lib/server/search-system';

export async function POST() {
  // Add authentication middleware here!
  try {
    await searchSystem.rebuildIndex();
    return NextResponse.json({ success: true, message: 'Rebuild initiated' });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Rebuild failed', details: error.message },
      { status: 500 }
    );
  }
}
