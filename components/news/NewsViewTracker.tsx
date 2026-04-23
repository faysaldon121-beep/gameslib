'use client';

import { useEffect, useRef } from 'react';

interface NewsViewTrackerProps {
  newsId: string;
}

export default function NewsViewTracker({ newsId }: NewsViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;

    const timer = setTimeout(async () => {
      try {
        await fetch('/api/news/view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newsId }),
        });
        tracked.current = true;
      } catch (error) {
        console.error('Failed to track view:', error);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [newsId]);

  return null;
}
