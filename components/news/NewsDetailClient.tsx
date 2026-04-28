// components/news/NewsDetailClient.tsx
'use client';

import { useNewsTracking } from '@/lib/hooks/useNewsTracking';
import { NewsDetail, NewsBase } from '@/types/news';
import Image from 'next/image';
import { FaTwitter, FaFacebook, FaReddit, FaEye, FaShareAlt } from 'react-icons/fa';

interface NewsDetailClientProps {
  news: NewsDetail;
  relatedNews: NewsBase[];
}

export default function NewsDetailClient({ news, relatedNews }: NewsDetailClientProps) {
  const { shareNews } = useNewsTracking({
    slug: news.slug,
    trackView: true,
  });

  const handleShare = async (platform: 'twitter' | 'facebook' | 'reddit') => {
    await shareNews(platform);

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(news.title)}&url=${encodeURIComponent(window.location.href)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(news.title)}`,
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        {news.isBreaking && (
          <span className="inline-block bg-red-600 text-white px-3 py-1 rounded text-sm font-bold mb-4">
            BREAKING NEWS
          </span>
        )}
        
        <h1 className="text-4xl font-bold mb-4">{news.title}</h1>
        
        <div className="flex items-center gap-4 text-gray-600 mb-6">
          <div className="flex items-center gap-2">
            {news.author.avatar && (
              <Image
                src={news.author.avatar}
                alt={news.author.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <span>{news.author.name}</span>
          </div>
          <span>•</span>
          <time dateTime={news.publishedAt}>
            {new Date(news.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          <span>•</span>
          <span>{news.readingTime} min read</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <FaEye />
            <span>{news.uniqueViews.toLocaleString()} views</span>
          </div>
          <div className="flex items-center gap-2">
            <FaShareAlt />
            <span>{news.shares.total} shares</span>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
        <Image
          src={news.featuredImage.url}
          alt={news.featuredImage.alt}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Share Buttons */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => handleShare('twitter')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          <FaTwitter /> Share on Twitter
        </button>
        <button
          onClick={() => handleShare('facebook')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
        >
          <FaFacebook /> Share on Facebook
        </button>
        <button
          onClick={() => handleShare('reddit')}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
        >
          <FaReddit /> Share on Reddit
        </button>
      </div>

      {/* Content */}
      <div 
        className="prose prose-lg max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: news.content }}
      />

      {/* Tags */}
      {news.tags.length > 0 && (
        <div className="mb-12">
          <h3 className="text-lg font-bold mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {news.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-gray-300 transition"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related News */}
      {relatedNews.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-6">Related News</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedNews.map((related) => (
              <a
                key={related._id}
                href={`/news/${related.slug}`}
                className="group block"
              >
                <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={related.featuredImage.url}
                    alt={related.featuredImage.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-bold group-hover:text-blue-600 transition-colors">
                  {related.title}
                </h4>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {related.excerpt}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
