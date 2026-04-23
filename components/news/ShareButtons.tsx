'use client';

import { useState } from 'react';
import { ShareIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { NewsDetail } from '@/types/news';

interface ShareButtonsProps {
  news: NewsDetail;
  position?: 'top' | 'bottom';
}

export default function ShareButtons({ news, position = 'top' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gameslib.vercel.app'}/news/${news.slug.current}`;
  const title = news.title;

  const handleShare = async (platform: 'facebook' | 'twitter' | 'reddit') => {
    try {
      await fetch('/api/news/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsId: news._id, platform }),
      });
    } catch (error) {
      console.error('Failed to track share:', error);
    }

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
        break;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className={`sticky ${position === 'top' ? 'top-20' : 'bottom-8'} z-40 flex items-center justify-between gap-4 py-6 ${
      position === 'top' ? 'border-b' : 'border-t'
    } border-purple-500/20 ${position === 'top' ? 'mb-8' : 'mt-12'} bg-black/80 backdrop-blur-sm rounded-xl px-6`}>
      <div className="flex items-center gap-2 text-gray-400">
        <ShareIcon className="w-5 h-5" />
        <span className="font-medium text-sm md:text-base">
          {news.shares?.total?.toLocaleString() || 0} shares
        </span>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={() => handleShare('facebook')}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-lg transition-colors font-medium text-sm"
          aria-label="Share on Facebook"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span className="hidden sm:inline">{news.shares?.facebook || 0}</span>
        </button>

        <button
          onClick={() => handleShare('twitter')}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-black hover:bg-gray-900 text-white rounded-lg transition-colors font-medium border border-gray-700 text-sm"
          aria-label="Share on X"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <span className="hidden sm:inline">{news.shares?.twitter || 0}</span>
        </button>

        <button
          onClick={() => handleShare('reddit')}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-[#FF4500] hover:bg-[#E63E00] text-white rounded-lg transition-colors font-medium text-sm"
          aria-label="Share on Reddit"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
          </svg>
          <span className="hidden sm:inline">{news.shares?.reddit || 0}</span>
        </button>

        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium text-sm"
          aria-label="Copy link"
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Copied!</span>
            </>
          ) : (
            <>
              <ClipboardDocumentIcon className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
