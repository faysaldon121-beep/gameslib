'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BoltIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { NewsBase } from '@/types/news';

interface BreakingNewsBarProps {
  news: NewsBase[];
}

export default function BreakingNewsBar({ news }: BreakingNewsBarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (news.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [news.length]);

  if (!isVisible || news.length === 0) return null;

  const currentNews = news[currentIndex];

  return (
    <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-600 border-b border-red-500 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 py-3 relative z-10">
        <div className="flex items-center justify-between gap-4">
          {/* Breaking Label */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <BoltIcon className="w-5 h-5 text-white animate-pulse" />
            <span className="font-black text-white uppercase tracking-wider text-sm">
              Breaking News
            </span>
          </div>

          {/* News Content */}
          <Link
            href={`/news/${currentNews.slug}`}
            className="flex-1 group"
          >
            <p className="text-white font-semibold text-sm md:text-base line-clamp-1 group-hover:underline">
              {currentNews.title}
            </p>
          </Link>

          {/* Indicators */}
          {news.length > 1 && (
            <div className="hidden md:flex items-center gap-1.5">
              {news.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-white w-6'
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`View breaking news ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
            aria-label="Close breaking news"
          >
            <XMarkIcon className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
