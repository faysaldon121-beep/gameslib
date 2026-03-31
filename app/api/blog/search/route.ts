import { NextRequest, NextResponse } from 'next/server';
import { blogSearchManager } from '@/lib/server/blogSearchManager';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const start = Date.now();
    const data = await blogSearchManager.getIndexData();

    if (!data) {
      return NextResponse.json(
        { error: 'Blog search index not ready' },
        { status: 503 }
      );
    }

    const lightweightPosts = data.posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      category: post.category,
      tags: post.tags,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
    }));

    const responseTime = Date.now() - start;

    return NextResponse.json(
      {
        index: data.index,
        posts: lightweightPosts,
        metadata: {
          ...data.metadata,
          serverResponseTime: responseTime,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'CDN-Cache-Control': 'public, s-maxage=300',
        },
      }
    );
  } catch (error) {
    console.error('❌ Failed to serve blog search index:', error);
    return NextResponse.json(
      { error: 'Failed to load blog search index' },
      { status: 500 }
    );
  }
}
