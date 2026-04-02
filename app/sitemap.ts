import { MetadataRoute } from "next";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";
import BlogPost from "@/models/BlogPost"; // Added BlogPost model
import { GENRES } from "@/lib/utils";

export const revalidate = 3600; // Optional: caches sitemap for 1 hour to reduce DB load

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();
  
  // 1. Handle base URL cleanly (remove trailing slash if present)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gameslib.vercel.app";
  const BASE = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  // 2. Fetch games and blog posts concurrently for better performance
  const [games, blogPosts] = await Promise.all([
    Game.find({}, "slug updatedAt isFeatured averageRating").lean(),
    BlogPost.find({ isPublished: true }, "slug updatedAt isFeatured").lean()
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/games`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 }, // Added Blog static page
    { url: `${BASE}/donate`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/sponsors`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/request`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/top`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 }
  ];

  const gamePages: MetadataRoute.Sitemap = games.map((game: any) => {
    // 3. Safely handle invalid dates to prevent RangeError
    let lastModified = new Date();
    if (game.updatedAt) {
      const date = new Date(game.updatedAt);
      if (!isNaN(date.getTime())) {
        lastModified = date;
      }
    }

    return {
      url: `${BASE}/games/${game.slug}`,
      lastModified,
      changeFrequency: "weekly",
      priority: game.isFeatured ? 0.9 : (game.averageRating || 0) >= 4 ? 0.8 : 0.7,
    };
  });

  // 4. Generate Blog Post pages safely
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post: any) => {
    let lastModified = new Date();
    if (post.updatedAt) {
      const date = new Date(post.updatedAt);
      if (!isNaN(date.getTime())) {
        lastModified = date;
      }
    }

    return {
      url: `${BASE}/blog/${post.slug}`,
      lastModified,
      changeFrequency: "weekly",
      priority: post.isFeatured ? 0.8 : 0.6, // Higher priority if it's a featured post
    };
  });

  const genrePages: MetadataRoute.Sitemap = GENRES.map((genre) => ({
    url: `${BASE}/genre/${genre.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // 5. Return all merged routes
  return [...staticPages, ...gamePages, ...genrePages, ...blogPages];
}
