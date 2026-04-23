import { NextResponse } from 'next/server'; import { NewsService } from '@/lib/services/news-service';
export async function POST(req: Request) { try { const { newsId } = await req.json(); await NewsService.incrementViews(newsId); return NextResponse.json({ success: true }); } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }); } }
