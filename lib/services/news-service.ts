import dbConnect from '@/lib/db/mongodb';
import News, { INews } from '@/lib/models/News';
import { NewsBase } from '@/types/news';

export class NewsService {
  // Get latest news with pagination
  static async getLatestNews(limit = 24, page = 1) {
    await dbConnect();

    const skip = (page - 1) * limit;

    const [news, total] = await Promise.all([
      News.find({ status: 'published' })
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      News.countDocuments({ status: 'published' }),
    ]);

    return {
      news: news.map(this.formatNews),
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // Get news by category
  static async getNewsByCategory(category: string, limit = 24, page = 1) {
    await dbConnect();

    const skip = (page - 1) * limit;

    const [news, total] = await Promise.all([
      News.find({ status: 'published', category: category.toLowerCase() })
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      News.countDocuments({ status: 'published', category: category.toLowerCase() }),
    ]);

    return {
      news: news.map(this.formatNews),
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // Get news by platform
  static async getNewsByPlatform(platform: string, limit = 24, page = 1) {
    await dbConnect();

    const skip = (page - 1) * limit;

    const [news, total] = await Promise.all([
      News.find({ status: 'published', platforms: platform })
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      News.countDocuments({ status: 'published', platforms: platform }),
    ]);

    return {
      news: news.map(this.formatNews),
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // Search news
  static async searchNews(query: string, limit = 24, page = 1) {
    await dbConnect();

    const skip = (page - 1) * limit;

    const searchQuery = {
      status: 'published',
      $text: { $search: query },
    };

    const [news, total] = await Promise.all([
      News.find(searchQuery)
        .sort({ score: { $meta: 'textScore' }, publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      News.countDocuments(searchQuery),
    ]);

    return {
      news: news.map(this.formatNews),
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // Get trending news (by views)
  static async getTrendingNews(limit = 10) {
    await dbConnect();

    const news = await News.find({ status: 'published' })
      .sort({ views: -1, publishedAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    return news.map(this.formatNews);
  }

  // Get featured news
  static async getFeaturedNews() {
    await dbConnect();

    const news = await News.findOne({
      status: 'published',
      isFeatured: true,
    })
      .sort({ publishedAt: -1 })
      .lean()
      .exec();

    return news ? this.formatNews(news) : null;
  }

  // Get breaking news
  static async getBreakingNews(limit = 3) {
    await dbConnect();

    const news = await News.find({
      status: 'published',
      isBreaking: true,
    })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    return news.map(this.formatNews);
  }

  // Get news by slug
  static async getNewsBySlug(slug: string) {
    await dbConnect();

    const news = await News.findOne({ slug, status: 'published' }).lean().exec();

    if (!news) return null;

    // Increment views
    await News.findByIdAndUpdate(news._id, { $inc: { views: 1 } });

    return this.formatNews(news);
  }

  // Get related news
  static async getRelatedNews(newsId: string, category: string, tags: string[], limit = 4) {
    await dbConnect();

    const news = await News.find({
      _id: { $ne: newsId },
      status: 'published',
      $or: [{ category }, { tags: { $in: tags } }],
    })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    return news.map(this.formatNews);
  }

  // Get categories with count
  static async getCategories() {
    await dbConnect();

    const categories = await News.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { category: '$_id', count: 1, _id: 0 } },
    ]);

    return categories;
  }

  // Get popular tags
  static async getPopularTags(limit = 20) {
    await dbConnect();

    const tags = await News.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { tag: '$_id', _id: 0 } },
    ]);

    return tags.map((t: any) => t.tag);
  }

  // Increment share count
  static async incrementShares(slug: string, platform?: string) {
    await dbConnect();

    const updateQuery: any = { $inc: { 'shares.total': 1 } };

    if (platform && ['twitter', 'facebook', 'reddit'].includes(platform)) {
      updateQuery.$inc[`shares.${platform}`] = 1;
    }

    await News.findOneAndUpdate({ slug }, updateQuery);
  }

  // Format news for response
  private static formatNews(news: any): NewsBase {
    return {
      _id: news._id.toString(),
      title: news.title,
      slug: news.slug,
      excerpt: news.excerpt,
      category: news.category,
      platforms: news.platforms || [],
      tags: news.tags || [],
      author: news.author,
      featuredImage: news.featuredImage,
      isBreaking: news.isBreaking || false,
      isFeatured: news.isFeatured || false,
      readingTime: news.readingTime,
      views: news.views || 0,
      shares: news.shares || { total: 0 },
      publishedAt: news.publishedAt?.toISOString() || news.createdAt?.toISOString(),
    };
  }
}
