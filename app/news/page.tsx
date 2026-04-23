import { NewsService } from '@/lib/services/news-service'; import NewsCard from '@/components/news/NewsCard'; import Pagination from '@/components/ui/Pagination';
export const dynamic = 'force-dynamic';
export default async function NewsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; }> }) {
  const p = await searchParams; const page = parseInt(p.page || '1');
  const res = p.q ? await NewsService.searchNews(p.q, 24, page) : await NewsService.getLatestNews(24, page);
  return ( <div className="min-h-screen bg-black container mx-auto px-4 py-12"><h1 className="text-5xl text-white mb-8 font-black">GAMING NEWS</h1><div className="grid md:grid-cols-3 gap-6">{res.news.map(n => <NewsCard key={n._id} news={n}/>)}</div><Pagination currentPage={page} totalPages={res.pages} /></div> );
}
