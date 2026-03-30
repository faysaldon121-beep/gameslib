// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { runtimeSearchManager } from '@/lib/server/runtimeSearchManager';

export async function GET() {
  try {
    const status = runtimeSearchManager.getStatus();
    
    return NextResponse.json({
      status: 'ok',
      search: {
        isReady: status.isReady,
        isBuilding: status.isBuilding,
        totalGames: status.totalGames,
        lastUpdated: new Date(status.lastUpdated).toISOString(),
        nextCheck: new Date(status.nextCheck).toISOString(),
        memoryUsage: `${status.memoryUsage.toFixed(2)}MB`
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
