import { MetadataRoute } from "next";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";
import { GENRES } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();
  const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gameslib-chi.vercel.app/";
  const games = await Game.find({}, "slug updatedAt isFeatured averageRating").lean();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/games`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/donate`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/sponsors`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/request`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const gamePages: MetadataRoute.Sitemap = games.map((game: any) => ({
    url: `${BASE}/games/${game.slug}`,
    lastModified: new Date(game.updatedAt),
    changeFrequency: "weekly" as const,
    priority: game.isFeatured ? 0.9 : game.averageRating >= 4 ? 0.8 : 0.7,
  }));

  const genrePages: MetadataRoute.Sitemap = GENRES.map((genre) => ({
    url: `${BASE}/games/genre/${genre.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...gamePages, ...genrePages];
}
