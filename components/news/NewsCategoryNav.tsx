'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const categories =[
  { name: 'All', value: '' },
  { name: 'Breaking', value: 'breaking' },
  { name: 'Reviews', value: 'reviews' },
  { name: 'Trailers', value: 'trailers' },
  { name: 'Updates', value: 'updates' },
  { name: 'eSports', value: 'esports' },
  { name: 'Deals', value: 'deals' },
  { name: 'Rumors', value: 'rumors' },
];

export default function NewsCategoryNav() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || '';

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => (
        <Link
          key={cat.value}
          href={cat.value ? `/news?category=${cat.value}` : '/news'}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
            currentCategory === cat.value
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/50'
              : 'bg-g-secondary text-gray-400 hover:bg-purple-600/20 hover:text-purple-300'
          }`}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
