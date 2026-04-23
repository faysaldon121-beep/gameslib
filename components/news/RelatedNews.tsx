import NewsCard from './NewsCard';
import { NewsBase } from '@/types/news';

interface RelatedNewsProps {
  news: NewsBase[];
}

export default function RelatedNews({ news }: RelatedNewsProps) {
  if (news.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t border-purple-500/20">
      <h2 className="text-3xl font-black text-white mb-8">You Might Also Like</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {news.map((item) => (
          <NewsCard key={item._id} news={item} />
        ))}
      </div>
    </section>
  );
}
