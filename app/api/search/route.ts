import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";
import Review from "@/models/Review";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    if (!q) return NextResponse.json({ games: [] });

    const reviewGameSlugs = await Review.find({ isApproved: true, $text: { $search: q } }).limit(10).distinct("gameSlug");
    const games = await Game.find({
      $or: [
        { $text: { $search: q } },
        { slug: { $in: reviewGameSlugs } },
      ],
    })
      .sort({ isFeatured: -1, averageRating: -1 })
      .limit(10)
      .select("title slug genre coverImage shortDescription averageRating")
      .lean();

    return NextResponse.json({ games });
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
