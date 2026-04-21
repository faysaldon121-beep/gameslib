'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Genre page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-g-bg flex items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-g-text mb-4">
          Something went wrong!
        </h2>
        <p className="text-g-muted mb-8">
          {error.message || 'An error occurred while loading this genre page'}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="bg-g-secondary hover:bg-g-border text-g-text px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
