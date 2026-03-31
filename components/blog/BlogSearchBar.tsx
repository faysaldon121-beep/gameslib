'use client';

import React from 'react';

interface BlogSearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
}

const BlogSearchBar: React.FC<BlogSearchBarProps> = ({ value = '', onChange }) => {
  return (
    <div className="w-full max-w-xl mb-6">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Search blog posts..."
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default BlogSearchBar;
