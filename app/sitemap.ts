import { MetadataRoute } from "next";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";
import { GENRES } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();
  
  // 1. Handle base URL cleanly (remove trailing slash if present)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gameslib.vercel.app";
  const BASE = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  // 2. Fetch games
  const games = await Game.find({}, "slug updatedAt isFeatured averageRating").lean();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/games`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/donate`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/sponsors`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/request`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const gamePages: MetadataRoute.Sitemap = games.map((game: any) => {
    // 3. Fix: Safely handle invalid dates to prevent RangeError
    let lastModified = new Date();
    if (game.updatedAt) {
      const date = new Date(game.updatedAt);
      // Only use the date if it's valid
      if (!isNaN(date.getTime())) {
        lastModified = date;
      }
    }

    return {
      url: `${BASE}/game/${game.slug}`, // Fixed: matches /game/[slug] route
      lastModified,
      changeFrequency: "weekly",
      priority: game.isFeatured ? 0.9 : (game.averageRating || 0) >= 4 ? 0.8 : 0.7,
    };
  });

  const genrePages: MetadataRoute.Sitemap = GENRES.map((genre) => ({
    url: `${BASE}/genre/${genre.toLowerCase()}`, // Fixed: matches /genre/[slug] route
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticPages, ...gamePages, ...genrePages];
}
