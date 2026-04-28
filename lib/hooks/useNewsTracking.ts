// lib/hooks/useNewsTracking.ts
'use client';

import { useEffect, useRef } from 'react';

interface UseNewsTrackingProps {
  newsId?: string;
  slug?: string;
  trackView?: boolean;
}

export function useNewsTracking({
  newsId,
  slug,
  trackView = true,
}: UseNewsTrackingProps) {
  const hasTrackedView = useRef(false);

  // Track view on mount (only once)
  useEffect(() => {
    if (!trackView || (!newsId && !slug) || hasTrackedView.current) return;

    const trackViewAsync = async () => {
      try {
        const response = await fetch('/api/news/views', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newsId, slug }),
        });

        const data = await response.json();
        
        if (data.success) {
          hasTrackedView.current = true;
          
          // Log if already viewed (optional, for debugging)
          if (data.alreadyViewed) {
            console.log('View already tracked for this IP');
          }
        }
      } catch (error) {
        console.error('Failed to track view:', error);
      }
    };

    // Track after 3 seconds to ensure genuine view
    const timer = setTimeout(trackViewAsync, 3000);
    return () => clearTimeout(timer);
  }, [newsId, slug, trackView]);

  // Share tracking function
  const shareNews = async (platform?: 'twitter' | 'facebook' | 'reddit') => {
    if (!newsId && !slug) return;

    try {
      const response = await fetch('/api/news/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsId, slug, platform }),
      });

      const data = await response.json();
      
      if (!data.success) {
        console.error('Failed to track share:', data.error);
      }
    } catch (error) {
      console.error('Failed to track share:', error);
    }
  };

  return { shareNews };
}
