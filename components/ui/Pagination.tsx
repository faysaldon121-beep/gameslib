'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  const pages = [];
  const showPages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
  let endPage = Math.min(totalPages, startPage + showPages - 1);

  if (endPage - startPage < showPages - 1) {
    startPage = Math.max(1, endPage - showPages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <nav className="flex items-center justify-center gap-2 my-12" aria-label="Pagination">
      {currentPage > 1 ? (
        <Link href={createPageURL(currentPage - 1)} className="flex items-center gap-2 px-5 py-2.5 bg-g-secondary hover:bg-purple-600 text-g-text hover:text-white rounded-lg transition-colors font-medium">
          <ChevronLeftIcon className="w-4 h-4" />
          Previous
        </Link>
      ) : (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-g-secondary text-gray-600 rounded-lg opacity-50 cursor-not-allowed">
          <ChevronLeftIcon className="w-4 h-4" />
          Previous
        </div>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={createPageURL(page)}
          className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
            page === currentPage
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/50'
              : 'bg-g-secondary hover:bg-purple-600 text-g-text hover:text-white'
          }`}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages ? (
        <Link href={createPageURL(currentPage + 1)} className="flex items-center gap-2 px-5 py-2.5 bg-g-secondary hover:bg-purple-600 text-g-text hover:text-white rounded-lg transition-colors font-medium">
          Next
          <ChevronRightIcon className="w-4 h-4" />
        </Link>
      ) : (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-g-secondary text-gray-600 rounded-lg opacity-50 cursor-not-allowed">
          Next
          <ChevronRightIcon className="w-4 h-4" />
        </div>
      )}
    </nav>
  );
}
