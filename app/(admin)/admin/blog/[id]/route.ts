import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const data = await req.json();
    
    if (data.isPublished && !data.publishedAt) {
      data.publishedAt = new Date();
    }

    const updatedPost = await BlogPost.findByIdAndUpdate(params.id, data, { new: true });
    return NextResponse.json(updatedPost);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    await BlogPost.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
