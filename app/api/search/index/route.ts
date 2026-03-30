// app/api/search/index/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { runtimeSearchManager } from '@/lib/server/runtimeSearchManager';

export async function GET(request: NextRequest) {
  try {
    console.log('📡 Serving search index...');
    const startTime = Date.now();

    // Get the current index data
    const indexData = await runtimeSearchManager.getIndexData();
    
    if (!indexData) {
      return NextResponse.json(
        { error: 'Search index not ready' },
        { status: 503 }
      );
    }

    const responseTime = Date.now() - startTime;
    console.log(`📡 Index served in ${responseTime}ms`);

    return NextResponse.json({
      ...indexData,
      metadata: {
        ...indexData.metadata,
        serverResponseTime: responseTime
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5min cache
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

// Force rebuild endpoint for admin
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'rebuild') {
      await runtimeSearchManager.forceRebuild();
      return NextResponse.json({ message: 'Index rebuilt successfully' });
    }
    
    if (action === 'status') {
      const status = runtimeSearchManager.getStatus();
      return NextResponse.json(status);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('❌ Admin action failed:', error);
    return NextResponse.json(
      { error: 'Action failed' },
      { status: 500 }
    );
  }
}
