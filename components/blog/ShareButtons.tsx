'use client';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="mt-8 pt-8 border-t border-g-border">
      <h3 className="text-lg font-bold text-g-text mb-4">Share this article</h3>
      <div className="flex gap-4">
        <a
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#1DA1F2] text-white px-4 py-2 rounded hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          Twitter
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#4267B2] text-white px-4 py-2 rounded hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          Facebook
        </a>
        <a
          href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#0077b5] text-white px-4 py-2 rounded hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          LinkedIn
        </a>
      </div>
    </div>
  );
}
