import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";

export async function GET(_: Request, { params }: { params: { gameSlug: string } }) {
  try {
    await connectDB();
    const reviews = await Review.find({ gameSlug: params.gameSlug, isApproved: true }).sort({ helpfulVotes: -1, createdAt: -1 }).lean();
    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
