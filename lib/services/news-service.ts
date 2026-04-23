import { client, writeClient } from '@/sanity/lib/client';
import { paginatedNewsQuery, trendingNewsQuery, breakingNewsQuery, featuredNewsQuery, newsBySlugQuery, newsByCategoryQuery, newsByPlatformQuery, searchNewsQuery, relatedNewsQuery, categoriesWithCountQuery, popularTagsQuery } from '@/sanity/lib/queries';
export class NewsService {
  static async getLatestNews(limit=24, page=1) { const start = (page-1)*limit; const end = start+limit; try { const r = await client.fetch(paginatedNewsQuery, { start, end }); return { news: r.news||[], total: r.total||0, pages: Math.ceil((r.total||0)/limit), currentPage: page }; } catch(e) { return { news:[], total: 0, pages: 0, currentPage: 1 }; } }
  static async getTrendingNews(limit=10) { try { return await client.fetch(trendingNewsQuery, { limit }); } catch(e) { return[]; } }
  static async getBreakingNews(limit=3) { try { return await client.fetch(breakingNewsQuery, { limit }); } catch(e) { return[]; } }
  static async getFeaturedNews() { try { return await client.fetch(featuredNewsQuery); } catch(e) { return null; } }
  static async getNewsBySlug(slug: string) { try { return await client.fetch(newsBySlugQuery, { slug }); } catch(e) { return null; } }
  static async getNewsByCategory(category: string, limit=24, page=1) { const start = (page-1)*limit; const end = start+limit; try { const r = await client.fetch(newsByCategoryQuery, { category, start, end }); return { news: r.news||[], total: r.total||0, pages: Math.ceil((r.total||0)/limit), currentPage: page }; } catch(e) { return { news:[], total: 0, pages: 0, currentPage: 1 }; } }
  static async getNewsByPlatform(platform: string, limit=24, page=1) { const start = (page-1)*limit; const end = start+limit; try { const r = await client.fetch(newsByPlatformQuery, { platform, start, end }); return { news: r.news||[], total: r.total||0, pages: Math.ceil((r.total||0)/limit), currentPage: page }; } catch(e) { return { news:[], total: 0, pages: 0, currentPage: 1 }; } }
  static async searchNews(query: string, limit=24, page=1) { const start = (page-1)*limit; const end = start+limit; try { const r = await client.fetch(searchNewsQuery, { query: `*${query}*`, start, end }); return { news: r.news||[], total: r.total||0, pages: Math.ceil((r.total||0)/limit), currentPage: page }; } catch(e) { return { news:[], total: 0, pages: 0, currentPage: 1 }; } }
  static async getRelatedNews(newsId: string, category: string, limit=4) { try { return await client.fetch(relatedNewsQuery, { newsId, category, limit }); } catch(e) { return[]; } }
  static async getCategories() { try { return await client.fetch(categoriesWithCountQuery); } catch(e) { return[]; } }
  static async getPopularTags() { try { return await client.fetch(popularTagsQuery); } catch(e) { return[]; } }
  static async incrementViews(newsId: string) { try { await writeClient.patch(newsId).setIfMissing({ views: 0 }).inc({ views: 1 }).commit(); } catch(e) {} }
  static async incrementShares(newsId: string, platform: string) { try { await writeClient.patch(newsId).setIfMissing({ shares: { total: 0 } }).inc({ [`shares.${platform}`]: 1, 'shares.total': 1 }).commit(); } catch(e) {} }
}
