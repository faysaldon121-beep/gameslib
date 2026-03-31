// components/blog/BlogCategories.tsx
'use client';

import React from 'react';

interface BlogCategoriesProps {
  categories?: string[];
  activeCategory?: string | null;
  onCategoryChange?: (category: string | null) => void;
}

const BlogCategories: React.FC<BlogCategoriesProps> = ({
  categories = [],
  activeCategory = null,
  onCategoryChange,
}) => {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        type="button"
        onClick={() => onCategoryChange?.(null)}
        className={`rounded-full px-3 py-1 text-xs border ${
          activeCategory === null
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300'
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onCategoryChange?.(cat)}
          className={`rounded-full px-3 py-1 text-xs border ${
            activeCategory === cat
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default BlogCategories;
