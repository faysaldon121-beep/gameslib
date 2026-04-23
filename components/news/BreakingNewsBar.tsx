'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BoltIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { NewsBase } from '@/types/news';

interface BreakingNewsBarProps {
  news: NewsBase[];
}

export default function BreakingNewsBar({ news }: BreakingNewsBarProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const[isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (news.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [news.length]);

  if (!isVisible || news.length === 0) return null;

  return (
    <div className="bg-red-600 text-white py-3 relative overflow-hidden z-50">
      <div className="absolute inset-0 bg-gradient-to-r from-red-700 via-red-600 to-red-700 animate-pulse opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 overflow-hidden">
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full flex-shrink-0">
              <BoltIcon className="w-5 h-5 animate-pulse" />
              <span className="font-black text-sm uppercase">Breaking</span>
            </div>
            
            <Link 
              href={`/news/${news[currentIndex].slug.current}`}
              className="flex-1 truncate hover:underline font-medium"
            >
              {news[currentIndex].title}
            </Link>

            {news.length > 1 && (
              <div className="hidden md:flex items-center gap-1">
                {news.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex ? 'bg-white w-4' : 'bg-white/40'
                    }`}
                    aria-label={`Go to news ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="ml-4 p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
