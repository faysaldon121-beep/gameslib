import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import News from '@/lib/models/News';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    const news = await News.create(body);

    return NextResponse.json({ success: true, data: news }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'published';

    const skip = (page - 1) * limit;

    const [news, total] = await Promise.all([
      News.find({ status })
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      News.countDocuments({ status }),
    ]);

    return NextResponse.json({
      success: true,
      data: news,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
