
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
