import Link from 'next/link';
import Image from 'next/image';
import { ClockIcon, EyeIcon, ShareIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { NewsBase } from '@/types/news';
import { formatDistanceToNow } from 'date-fns';

interface NewsCardProps {
  news: NewsBase;
}

export default function NewsCard({ news }: NewsCardProps) {
  return (
    <Link
      href={`/news/${news.slug}`}
      className="group bg-g-secondary rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/10"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
  src={news.featuredImage.url}
  alt={news.featuredImage.alt || news.title}
  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
/>
        
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {news.isBreaking && (
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-black rounded-full uppercase animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              Breaking
            </span>
          )}
          <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full uppercase">
            {news.category}
          </span>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Platforms */}
        {news.platforms && news.platforms.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {news.platforms.slice(0, 3).map((platform) => (
              <span
                key={platform}
                className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-xs font-semibold rounded"
              >
                {platform}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="text-white font-bold text-lg line-clamp-2 group-hover:text-purple-400 transition-colors mb-2">
          {news.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-400 text-sm line-clamp-2 mb-4">
          {news.excerpt}
        </p>

        {/* Meta info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <ClockIcon className="w-3.5 h-3.5" />
              {news.readingTime}m
            </span>
            <span className="flex items-center gap-1">
              <EyeIcon className="w-3.5 h-3.5" />
              {news.views.toLocaleString()}
            </span>
            {news.shares && (
              <span className="flex items-center gap-1">
                <ShareIcon className="w-3.5 h-3.5" />
                {news.shares.total}
              </span>
            )}
          </div>
          
          <span className="flex items-center gap-1 text-purple-400">
            <CalendarIcon className="w-3.5 h-3.5" />
            {formatDistanceToNow(new Date(news.publishedAt), { addSuffix: true })}
          </span>
        </div>

        {/* Author */}
        {news.author && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-800">
            {news.author.avatar && (
              <div className="relative w-6 h-6 rounded-full overflow-hidden">
                <Image
                  src={news.author.avatar}
                  alt={news.author.name}
                  fill
                  className="object-cover"
                  sizes="24px"
                />
              </div>
            )}
            <span className="text-xs text-gray-400 font-medium">
              {news.author.name}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
