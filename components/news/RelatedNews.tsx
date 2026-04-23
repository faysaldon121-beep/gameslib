import NewsCard from './NewsCard'; import { NewsBase } from '@/types/news';
export default function RelatedNews({ news }: { news: NewsBase[] }) { return ( <section className="mt-16"><h2 className="text-3xl font-black text-white mb-8">Related</h2><div className="grid md:grid-cols-2 gap-6">{news.map(n => <NewsCard key={n._id} news={n} />)}</div></section> ); }
