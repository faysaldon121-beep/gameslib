'use server';

import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';

const COOKIE_PREFIX = 'blog_view_';
const COOKIE_MAX_AGE = 24 * 60 * 60; // 24 hours

export async function trackBlogView(slug: string): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const viewCookie = cookieStore.get(`${COOKIE_PREFIX}${slug}`);
    
    // If already viewed, return false
    if (viewCookie) {
      return false;
    }

    // Mark as viewed
    cookieStore.set(`${COOKIE_PREFIX}${slug}`, '1', {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });

    // Increment view count in database
    await connectDB();
    await BlogPost.findOneAndUpdate(
      { slug, isPublished: true },
      { $inc: { views: 1 } },
      { timestamps: false }
    );

    return true;
  } catch (error) {
    console.error('Error tracking view:', error);
    return false;
  }
}

export async function hasViewedBlog(slug: string): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const viewCookie = cookieStore.get(`${COOKIE_PREFIX}${slug}`);
    return !!viewCookie;
  } catch (error) {
    console.error('Error checking view:', error);
    return false;
  }
}
