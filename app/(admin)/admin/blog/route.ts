import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';

export async function GET() {
  try {
    await connectDB();
    // Fetch all posts, including drafts, sorted by newest
    const posts = await BlogPost.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();
    
    // Auto-generate publishedAt if it's being published now
    if (data.isPublished && !data.publishedAt) {
      data.publishedAt = new Date();
    }

    const newPost = await BlogPost.create(data);
    return NextResponse.json(newPost, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
