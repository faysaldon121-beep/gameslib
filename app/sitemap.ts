import { MetadataRoute } from "next";
import { GENRES } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gameslib.vercel.app";
  const BASE = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/games`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/donate`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/sponsors`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/request`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/top`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 }
  ];

  const genrePages: MetadataRoute.Sitemap = GENRES.map((genre) => ({
    url: `${BASE}/genre/${genre.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticPages, ...genrePages];
}
