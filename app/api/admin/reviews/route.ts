import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";

export async function GET() {
  await connectDB();
  const reviews = await Review.find({}).sort({ isApproved: 1, createdAt: -1 }).limit(100).lean();
  return NextResponse.json({ reviews });
}
