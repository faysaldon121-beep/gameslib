import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gameslib.net";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/games?*page=", "/*?*sort=", "/_next/"] },
      { userAgent: ["GPTBot", "Claude-Web", "CCBot", "PerplexityBot"], disallow: "/" },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
