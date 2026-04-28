// types/news.ts
export interface NewsBase {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  platforms: string[];
  tags: string[];
  author: {
    name: string;
    avatar?: string;
  };
  featuredImage: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
  };
  isBreaking: boolean;
  isFeatured: boolean;
  readingTime: number;
  views: number;
  uniqueViews: number;
  shares: {
    total: number;
    twitter: number;
    facebook: number;
    reddit: number;
  };
  publishedAt: string;
}

export interface NewsDetail extends NewsBase {
  content: string;
  gallery?: Array<{
    url: string;
    alt: string;
    caption?: string;
  }>;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    ogImage?: string;
    ogTitle?: string;
    ogDescription?: string;
    twitterCard?: 'summary' | 'summary_large_image';
    canonicalUrl?: string;
    noIndex?: boolean;
    noFollow?: boolean;
  };
}
