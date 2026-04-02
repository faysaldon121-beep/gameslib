import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";
import Blog from "@/models/Blog";
import Topic from "@/models/Topic";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all"; // games | blogs | topics | all
    const limit = Math.min(parseInt(searchParams.get("limit") || "12", 10), 50);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const skip = (page - 1) * limit;
    const search = searchParams.get("q") || "";

    const searchFilter = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { name: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const result = {};

    if (type === "all" || type === "games") {
      result.games = await Game.find(searchFilter)
        .sort({ views: -1, rating: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      result.gamesTotal = await Game.countDocuments(searchFilter);
    }

    if (type === "all" || type === "blogs") {
      result.blogs = await Blog.find(searchFilter)
        .sort({ views: -1, likes: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      result.blogsTotal = await Blog.countDocuments(searchFilter);
    }

    if (type === "all" || type === "topics") {
      result.topics = await Topic.find(searchFilter)
        .sort({ postsCount: -1, followersCount: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      result.topicsTotal = await Topic.countDocuments(searchFilter);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Trending API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trending data" },
      { status: 500 }
    );
  }
}
