import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const genre = searchParams.get("genre");
    const platform = searchParams.get("platform");
    const featured = searchParams.get("featured");
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "18"));
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const filter: Record<string, any> = {};
    if (genre) filter.genre = genre;
    if (platform) filter.platforms = platform;
    if (featured) filter.isFeatured = true;
    const [games, total] = await Promise.all([
      Game.find(filter).sort({ isFeatured: -1, averageRating: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).select("title slug shortDescription coverImage genre averageRating reviewCount version platforms isFeatured").lean(),
      Game.countDocuments(filter),
    ]);
    return NextResponse.json({ games, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });
  }
}
