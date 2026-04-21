import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';

export async function GET() {
  try {
    await connectDB();
    
    const posts = await BlogPost.find({ isPublished: true })
      .sort({ publishedAt: -1 })
      .limit(20)
      .lean();

    const siteUrl = 'https://gameslib.vercel.app';
    
    const rssItems = posts.map((post: any) => `
      <item>
        <title><![CDATA[${post.title}]]></title>
        <link>${siteUrl}/blog/${post.slug}</link>
        <guid>${siteUrl}/blog/${post.slug}</guid>
        <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
        <description><![CDATA[${post.excerpt}]]></description>
        <category>${post.category}</category>
        ${post.tags.map((tag: string) => `<category>${tag}</category>`).join('')}
      </item>
    `).join('');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
        <channel>
          <title>Gameslib Gaming Blog</title>
          <link>${siteUrl}/blog</link>
          <description>Latest gaming news, reviews, and tutorials.</description>
          <language>en-us</language>
          <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
          <atom:link href="${siteUrl}/blog/rss.xml" rel="self" type="application/rss+xml"/>
          ${rssItems}
        </channel>
      </rss>`;

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new NextResponse('Error generating RSS feed', { status: 500 });
  }
}
