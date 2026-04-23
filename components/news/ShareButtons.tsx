'use client'; import { NewsDetail } from '@/types/news';
export default function ShareButtons({ news }: { news: NewsDetail, position?: string }) { return ( <div className="py-6 flex gap-4"><button className="text-blue-500">Share on Facebook</button><button className="text-blue-400">Share on Twitter</button></div> ); }
