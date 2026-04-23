'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function NewsSearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/news?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search breaking news, reviews, trailers..."
          className="w-full px-6 py-4 pr-14 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-purple-400 focus:bg-white/20 transition-all text-lg"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors shadow-lg"
          aria-label="Search"
        >
          <MagnifyingGlassIcon className="w-5 h-5 text-white" />
        </button>
      </div>
    </form>
  );
}
