import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";
import Game from "@/models/Game";

async function refreshGameRating(gameId: string) {
  const approved = await Review.find({ gameId, isApproved: true }).select("rating").lean();
  const reviewCount = approved.length;
  const averageRating = reviewCount ? approved.reduce((sum: number, review: any) => sum + review.rating, 0) / reviewCount : 0;
  await Game.findByIdAndUpdate(gameId, { reviewCount, averageRating });
}

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const review = await Review.findByIdAndUpdate(params.id, { isApproved: true }, { new: true }).lean() as any;
  if (review?.gameId) await refreshGameRating(String(review.gameId));
  return NextResponse.json({ success: true, review });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const review = await Review.findByIdAndDelete(params.id).lean() as any;
  if (review?.gameId) await refreshGameRating(String(review.gameId));
  return NextResponse.json({ success: true });
}
