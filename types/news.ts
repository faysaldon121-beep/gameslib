export interface NewsAuthor { name: string; avatar?: { asset: { _ref: string; _type: string; }; }; bio?: string; social?: { twitter?: string; linkedin?: string; }; }
export interface NewsShares { facebook: number; twitter: number; reddit: number; total: number; }
export interface NewsSEO { metaTitle?: string; metaDescription?: string; focusKeyword?: string; canonicalUrl?: string; }
export interface NewsBase { _id: string; _type: 'news'; _createdAt: string; _updatedAt: string; title: string; slug: { current: string; _type: 'slug'; }; excerpt: string; featuredImage: string; category: string; platforms?: string[]; tags?: string[]; author: NewsAuthor; readingTime: number; views: number; shares: NewsShares; isBreaking: boolean; isFeatured: boolean; isTrending: boolean; isPublished: boolean; publishedAt: string; }
export interface NewsDetail extends NewsBase { content: any; seo?: NewsSEO; videoEmbed?: string; sourceUrl?: string; relatedGames?: Array<{ _id: string; title: string; slug: { current: string }; coverImage: string; }>; }
export interface NewsPagination { news: NewsBase[]; total: number; pages: number; currentPage: number; }
