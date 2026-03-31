'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, FormEvent } from 'react';

const BlogSearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams(searchParams.toString());
    params.delete('page'); // reset pagination on new search

    if (query.trim()) {
      params.set('q', query.trim());
    } else {
      params.delete('q');
    }

    const search = params.toString();
    router.push(`/blog${search ? `?${search}` : ''}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto flex items-center bg-white/10 rounded-full p-1 backdrop-blur border border-white/20"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search blog posts, reviews, and guides..."
        className="flex-1 bg-transparent border-none text-white placeholder-purple-200 px-4 py-2 text-sm focus:outline-none"
      />
      <button
        type="submit"
        className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-5 py-2 rounded-full text-sm mr-1 transition-colors"
      >
        Search
      </button>
    </form>
  );
};

export default BlogSearchBar;
