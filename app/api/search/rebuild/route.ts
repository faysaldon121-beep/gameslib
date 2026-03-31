
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
