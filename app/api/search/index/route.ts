// app/api/search/index/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { runtimeSearchManager } from '@/lib/server/runtimeSearchManager';

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

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      ...indexData,
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
