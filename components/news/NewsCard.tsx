'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ClockIcon, EyeIcon, ShareIcon, FireIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { NewsBase } from '@/types/news';

interface NewsCardProps {
  news: NewsBase;
}

export default function NewsCard({ news }: NewsCardProps) {
  return (
    <Link href={`/news/${news.slug.current}`} className="group block">
      <article className="bg-g-secondary rounded-xl overflow-hidden border border-purple-500/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 h-full flex flex-col">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={news.featuredImage}
            alt={news.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {news.isBreaking && (
              <span className="px-3 py-1 text-xs font-black rounded-full uppercase bg-red-600 text-white animate-pulse flex items-center gap-1">
                <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                Breaking
              </span>
            )}
            <span className="px-3 py-1 text-xs font-bold rounded-full uppercase bg-purple-600 text-white">
              {news.category}
            </span>
          </div>

          {news.isTrending && (
            <div className="absolute top-3 right-3">
              <div className="p-2 bg-orange-500 rounded-full">
                <FireIcon className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors leading-snug">
            {news.title}
          </h3>
          
          <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
            {news.excerpt}
          </p>
          
          {news.platforms && news.platforms.length > 0 && (
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {news.platforms.slice(0, 3).map((platform) => (
                <span
                  key={platform}
                  className="px-2 py-0.5 text-xs font-medium bg-blue-600/20 text-blue-400 rounded"
                >
                  {platform}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                <span>{news.readingTime} min</span>
              </div>
              <div className="flex items-center gap-1">
                <EyeIcon className="w-4 h-4" />
                <span>{news.views?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <ShareIcon className="w-4 h-4" />
                <span>{news.shares?.total || 0}</span>
              </div>
            </div>
            
            <span className="text-gray-600">
              {formatDistanceToNow(new Date(news.publishedAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
