'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function NewsDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('News detail error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <ExclamationTriangleIcon className="w-20 h-20 text-red-500 mx-auto mb-6" />
        
        <h2 className="text-4xl font-black text-white mb-4">Article Not Found</h2>
        
        <p className="text-gray-400 mb-8">
          The news article you're looking for doesn't exist or has been removed.
        </p>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/news"
            className="bg-g-secondary hover:bg-g-border text-g-text px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to News
          </Link>
        </div>
      </div>
    </div>
  );
}
