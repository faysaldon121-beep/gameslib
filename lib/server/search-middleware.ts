// lib/server/search-middleware.ts
// Optional: Express/Next.js middleware for search system initialization

import { NextResponse } from 'next/server';
import { searchSystem } from './search-system';

export async function withSearchSystem<T>(
  handler: () => Promise<T>,
  timeoutMs = 10000
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Search system initialization timeout')), timeoutMs)
  );

  try {
    // Initialize search system if not already
    if (!searchSystem.isInitialized) {
      await Promise.race([
        searchSystem.initialize(),
        timeoutPromise
      ]);
    }

    return await handler();
  } catch (error) {
    console.error('Search middleware error:', error);
    
    // Return graceful degradation
    if (error instanceof Error && error.message.includes('timeout')) {
      throw new Error('Search system is initializing, please retry in a moment');
    }
    
    throw error;
  }
}
