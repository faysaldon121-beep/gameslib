'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  BoltIcon,
  StarIcon,
  EyeIcon,
  BookOpenIcon,
  BriefcaseIcon,
  TrophyIcon,
  ArrowPathIcon,
  FilmIcon,
} from '@heroicons/react/24/outline';

const categories = [
  { name: 'All', slug: '', icon: ArrowPathIcon },
  { name: 'Breaking', slug: 'breaking', icon: BoltIcon },
  { name: 'Reviews', slug: 'reviews', icon: StarIcon },
  { name: 'Previews', slug: 'previews', icon: EyeIcon },
  { name: 'Guides', slug: 'guides', icon: BookOpenIcon },
  { name: 'Industry', slug: 'industry', icon: BriefcaseIcon },
  { name: 'Esports', slug: 'esports', icon: TrophyIcon },
  { name: 'Updates', slug: 'updates', icon: ArrowPathIcon },
  { name: 'Trailers', slug: 'trailers', icon: FilmIcon },
];

export default function NewsCategoryNav() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || '';

  return (
    <div className="bg-g-secondary rounded-xl p-4 border border-purple-500/20">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = currentCategory === category.slug;

          return (
            <Link
              key={category.slug}
              href={category.slug ? `/news?category=${category.slug}` : '/news'}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'bg-g-bg text-gray-400 hover:bg-purple-600/20 hover:text-purple-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {category.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
