import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { searchSystem } from '@/lib/server/search-system';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Admin authentication ---
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('admin_token')?.value;
    if (!token || token !== process.env.ADMIN_TOKEN_SECRET) {
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }

  // --- Search system warmup ---
  // Only trigger warmup on paths where it's needed (search API, search pages, homepage)
  const shouldWarmup =
    pathname.startsWith('/api/search') ||
    pathname.startsWith('/search') ||
    pathname === '/';

  if (shouldWarmup && !searchSystem.isInitialized) {
    try {
      console.log('Warming up search system...');
      await searchSystem.initialize().catch(console.error);
    } catch (error) {
      console.error('Search system warmup failed:', error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Admin routes
    '/admin/:path*',
    // Search warmup routes
    '/api/search/:path*',
    '/search/:path*',
    '/',
  ],
};
