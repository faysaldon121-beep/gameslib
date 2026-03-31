'use client';

import React, { useState, useMemo } from 'react';

export interface BlogPostSummary {
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  publishedAt?: string;
}

interface BlogSearchBarProps {
  posts: BlogPostSummary[];
  onResultsChange?: (results: BlogPostSummary[]) => void;
}

const BlogSearchBar: React.FC<BlogSearchBarProps> = ({ posts, onResultsChange }) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;

    return posts.filter((post) => {
      const haystack =
        `${post.title} ${post.excerpt} ${post.category || ''} ${(post.tags || []).join(' ')}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [posts, query]);

  // Notify parent whenever results change
  React.useEffect(() => {
    onResultsChange?.(filtered);
  }, [filtered, onResultsChange]);

  return (
    <div className="w-full max-w-xl mb-6">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search blog posts..."
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default BlogSearchBar;
