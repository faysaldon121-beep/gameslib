import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";
import { slugify } from "@/lib/utils";

export async function GET() {
  await connectDB();
  const games = await Game.find({}).sort({ updatedAt: -1 }).select("title slug genre version isFeatured averageRating createdAt").lean();
  return NextResponse.json({ games });
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const game = await Game.create({
      ...body,
      slug: slugify(body.slug || body.title),
      shortDescription: body.shortDescription || String(body.description || "").slice(0, 140),
      releaseDate: body.releaseDate ? new Date(body.releaseDate) : undefined,
    });
    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create game" }, { status: 400 });
  }
}
