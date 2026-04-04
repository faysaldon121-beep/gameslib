import { MetadataRoute } from "next";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gameslib.vercel.app";
  const BASE = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  const games = await Game.find({}, "slug updatedAt isFeatured averageRating").lean();

  const gamePages: MetadataRoute.Sitemap = games.map((game: any) => {
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

  return gamePages;
}
