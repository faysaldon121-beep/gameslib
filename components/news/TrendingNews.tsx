import Link from 'next/link';
import Image from 'next/image';
import { FireIcon, EyeIcon, ShareIcon } from '@heroicons/react/24/solid';
import { NewsBase } from '@/types/news';

interface TrendingNewsProps {
  news: NewsBase[];
}

export default function TrendingNews({ news }: TrendingNewsProps) {
  if (news.length === 0) return null;

  return (
    <div className="bg-g-secondary p-6 rounded-xl border border-orange-500/20">
      <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
        <FireIcon className="w-6 h-6 text-orange-500" />
        Trending Now
      </h3>
      
      <div className="space-y-4">
        {news.slice(0, 5).map((item, index) => (
          <Link
            key={item._id}
            href={`/news/${item.slug.current}`}
            className="flex gap-3 group"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center font-black text-white text-sm shadow-lg">
              {index + 1}
            </div>
            
            <div className="flex-shrink-0 w-20 h-20 relative rounded-lg overflow-hidden">
              <Image
                src={item.featuredImage}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform"
                sizes="80px"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white line-clamp-2 group-hover:text-purple-400 transition-colors mb-1 leading-tight">
                {item.title}
              </h4>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <EyeIcon className="w-3 h-3" />
                  <span>{item.views?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShareIcon className="w-3 h-3" />
                  <span>{item.shares?.total || 0}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
