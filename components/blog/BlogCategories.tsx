'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Category {
  name: string;
  count: number;
}

interface BlogCategoriesProps {
  categories: Category[];
}

const BlogCategories: React.FC<BlogCategoriesProps> = ({ categories }) => {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');

  if (!categories || categories.length === 0) {
    return null;
  }

  const buildHref = (categoryName: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page'); // reset pagination on category change

    if (categoryName) {
      params.set('category', categoryName);
    } else {
      params.delete('category');
    }

    const qs = params.toString();
    return `/blog${qs ? `?${qs}` : ''}`;
  };

  return (
    <div className="bg-g-secondary p-6 rounded-lg">
      <h3 className="text-lg font-bold mb-4 text-g-text">Categories</h3>
      <div className="flex flex-wrap gap-2">
        <Link
          href={buildHref(null)}
          className={`px-3 py-1 rounded-full text-sm border ${
            !activeCategory
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-g-border text-g-text border-g-border hover:bg-purple-600 hover:text-white'
          } transition-colors`}
        >
          All ({categories.reduce((sum, c) => sum + c.count, 0)})
        </Link>

        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={buildHref(cat.name)}
            className={`px-3 py-1 rounded-full text-sm border ${
              activeCategory === cat.name
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-g-border text-g-text border-g-border hover:bg-purple-600 hover:text-white'
            } transition-colors`}
          >
            {cat.name} ({cat.count})
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BlogCategories;
