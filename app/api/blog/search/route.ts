// app/api/blog/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchBlogPosts } from '@/lib/server/blogSearchManager';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '10');
  const page = parseInt(searchParams.get('page') || '1');
  const category = searchParams.get('category') || undefined;
  const tags = searchParams.get('tags')?.split(',').filter(Boolean) || undefined;

  try {
    const { results, total } = await searchBlogPosts(query, { 
      limit, 
      page,
      category,
      tags,
      publishedOnly: true 
    });
    
    return NextResponse.json({ 
      results, 
      total, 
      page, 
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', message: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
