'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function NewsSearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/news?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search gaming news, reviews, guides..."
          className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-full text-white placeholder-white/60 focus:outline-none focus:border-purple-400 transition-all"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold transition-all flex items-center gap-2"
        >
          <MagnifyingGlassIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>
    </form>
  );
}
