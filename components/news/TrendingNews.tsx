import Link from 'next/link';
import Image from 'next/image';
import { FireIcon, ClockIcon, EyeIcon } from '@heroicons/react/24/outline';
import { NewsBase } from '@/types/news';

interface TrendingNewsProps {
  news: NewsBase[];
}

export default function TrendingNews({ news }: TrendingNewsProps) {
  return (
    <div className="bg-g-secondary p-6 rounded-xl border border-purple-500/20">
      <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
        <FireIcon className="w-6 h-6 text-orange-500" />
        Trending Now
      </h3>
      
      <div className="space-y-4">
        {news.map((item, index) => (
          <Link
            key={item._id}
            href={`/news/${item.slug}`}
            className="group block"
          >
            <div className="flex gap-3 hover:bg-g-bg p-3 rounded-lg transition-all">
              {/* Rank Number */}
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-sm ${
                  index === 0 
                    ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white' 
                    : index === 1
                    ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
                    : index === 2
                    ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white'
                    : 'bg-purple-600/20 text-purple-400'
                }`}>
                  {index + 1}
                </div>
              </div>

              {/* Thumbnail */}
              <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                <Image
                  src={item.featuredImage}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="80px"
                />
                {item.isBreaking && (
                  <div className="absolute top-1 left-1">
                    <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded uppercase">
                      Live
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold text-sm line-clamp-2 group-hover:text-purple-400 transition-colors mb-1">
                  {item.title}
                </h4>
                
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <EyeIcon className="w-3 h-3" />
                    {item.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    {item.readingTime}m
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/news?sort=trending"
        className="block mt-4 text-center text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors"
      >
        View All Trending →
      </Link>
    </div>
  );
}
