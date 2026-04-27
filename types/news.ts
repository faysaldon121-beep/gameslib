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
    bio?: string;
  };
  featuredImage: string;
  isBreaking: boolean;
  isFeatured: boolean;
  readingTime: number;
  views: number;
  shares: {
    total: number;
    twitter?: number;
    facebook?: number;
    reddit?: number;
  };
  publishedAt: string;
}
