'use client';

import { useEffect } from 'react';
import { trackBlogView } from '@/lib/actions/view-tracker';

interface ViewTrackerProps {
  slug: string;
  hasViewed: boolean;
}

export default function ViewTracker({ slug, hasViewed }: ViewTrackerProps) {
  useEffect(() => {
    if (!hasViewed) {
      trackBlogView(slug).catch(console.error);
    }
  }, [slug, hasViewed]);

  return null;
}
