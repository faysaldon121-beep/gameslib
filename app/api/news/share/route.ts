import { NextResponse } from 'next/server'; import { NewsService } from '@/lib/services/news-service';
export async function POST(req: Request) { try { const { newsId, platform } = await req.json(); await NewsService.incrementShares(newsId, platform); return NextResponse.json({ success: true }); } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }); } }
