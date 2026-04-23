import { client, writeClient } from '@/sanity/lib/client';
import {
  paginatedNewsQuery,
  trendingNewsQuery,
  breakingNewsQuery,
  featuredNewsQuery,
  newsBySlugQuery,
  newsByCategoryQuery,
  newsByPlatformQuery,
  searchNewsQuery,
  relatedNewsQuery,
  categoriesWithCountQuery,
  popularTagsQuery,
} from '@/sanity/lib/queries';
import { NewsBase, NewsDetail, NewsPagination } from '@/types/news';

export class NewsService {
  // Get latest news with pagination
  static async getLatestNews(limit: number = 24, page: number = 1): Promise<NewsPagination> {
    const start = (page - 1) * limit;
    const end = start + limit;

    try {
      const result = await client.fetch(paginatedNewsQuery, { start, end });

      return {
        news: result.news || [],
        total: result.total || 0,
        pages: Math.ceil((result.total || 0) / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error('Error fetching latest news:', error);
      return { news: [], total: 0, pages: 0, currentPage: 1 };
    }
  }

  // Get trending news
  static async getTrendingNews(limit: number = 10): Promise<NewsBase[]> {
    try {
      return await client.fetch(trendingNewsQuery, { limit });
    } catch (error) {
      console.error('Error fetching trending news:', error);
      return [];
    }
  }

  // Get breaking news
  static async getBreakingNews(limit: number = 3): Promise<NewsBase[]> {
    try {
      return await client.fetch(breakingNewsQuery, { limit });
    } catch (error) {
      console.error('Error fetching breaking news:', error);
      return [];
    }
  }

  // Get featured news
  static async getFeaturedNews(): Promise<NewsBase | null> {
    try {
      return await client.fetch(featuredNewsQuery);
    } catch (error) {
      console.error('Error fetching featured news:', error);
      return null;
    }
  }

  // Get news by slug
  static async getNewsBySlug(slug: string): Promise<NewsDetail | null> {
    try {
      return await client.fetch(newsBySlugQuery, { slug });
    } catch (error) {
      console.error('Error fetching news by slug:', error);
      return null;
    }
  }

  // Get news by category
  static async getNewsByCategory(
    category: string,
    limit: number = 24,
    page: number = 1
  ): Promise<NewsPagination> {
    const start = (page - 1) * limit;
    const end = start + limit;

    try {
      const result = await client.fetch(newsByCategoryQuery, { category, start, end });

      return {
        news: result.news || [],
        total: result.total || 0,
        pages: Math.ceil((result.total || 0) / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error('Error fetching news by category:', error);
      return { news: [], total: 0, pages: 0, currentPage: 1 };
    }
  }

  // Get news by platform
  static async getNewsByPlatform(
    platform: string,
    limit: number = 24,
    page: number = 1
  ): Promise<NewsPagination> {
    const start = (page - 1) * limit;
    const end = start + limit;

    try {
      const result = await client.fetch(newsByPlatformQuery, { platform, start, end });

      return {
        news: result.news || [],
        total: result.total || 0,
        pages: Math.ceil((result.total || 0) / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error('Error fetching news by platform:', error);
      return { news: [], total: 0, pages: 0, currentPage: 1 };
    }
  }

  // Search news - FIXED: Changed parameter name to searchTerm
  static async searchNews(
    query: string,
    limit: number = 24,
    page: number = 1
  ): Promise<NewsPagination> {
    const start = (page - 1) * limit;
    const end = start + limit;

    try {
      const result = await client.fetch(searchNewsQuery, {
        searchTerm: `*${query}*`,  // Changed from 'query' to 'searchTerm'
        start,
        end,
      });

      return {
        news: result.news || [],
        total: result.total || 0,
        pages: Math.ceil((result.total || 0) / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error('Error searching news:', error);
      return { news: [], total: 0, pages: 0, currentPage: 1 };
    }
  }

  // Get related news
  static async getRelatedNews(
    newsId: string,
    category: string,
    limit: number = 4
  ): Promise<NewsBase[]> {
    try {
      return await client.fetch(relatedNewsQuery, { newsId, category, limit });
    } catch (error) {
      console.error('Error fetching related news:', error);
      return [];
    }
  }

  // Get categories with count
  static async getCategories(): Promise<Array<{ category: string; count: number }>> {
    try {
      return await client.fetch(categoriesWithCountQuery);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Get popular tags
  static async getPopularTags(): Promise<string[]> {
    try {
      return await client.fetch(popularTagsQuery);
    } catch (error) {
      console.error('Error fetching popular tags:', error);
      return [];
    }
  }

  // Increment views
  static async incrementViews(newsId: string): Promise<void> {
    try {
      await writeClient
        .patch(newsId)
        .setIfMissing({ views: 0 })
        .inc({ views: 1 })
        .commit({ autoGenerateArrayKeys: true });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }

  // Increment shares
  static async incrementShares(
    newsId: string,
    platform: 'facebook' | 'twitter' | 'reddit'
  ): Promise<void> {
    try {
      await writeClient
        .patch(newsId)
        .setIfMissing({ shares: { facebook: 0, twitter: 0, reddit: 0, total: 0 } })
        .inc({
          [`shares.${platform}`]: 1,
          'shares.total': 1,
        })
        .commit({ autoGenerateArrayKeys: true });
    } catch (error) {
      console.error('Error incrementing shares:', error);
    }
  }
}
