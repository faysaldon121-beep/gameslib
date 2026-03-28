// app/api/games/download/[slug]/route.ts

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const slug = params.slug;

    if (!slug) {
      return NextResponse.json({ message: "Slug is required" }, { status: 400 });
    }

    // Find the game but only select the title and downloadLinks fields for security
    const game = await Game.findOne({ slug }).select("title downloadLinks").lean();

    if (!game) {
      return NextResponse.json({ message: "Game not found" }, { status: 404 });
    }

    const downloadUrl = game.downloadLinks?.[0]?.url;

    if (!downloadUrl) {
      return NextResponse.json({ message: "Download link not available for this game" }, { status: 404 });
    }

    // Return only the data the client needs
    return NextResponse.json({
      title: game.title,
      downloadUrl: downloadUrl,
    });

  } catch (error) {
    console.error("API Download Route Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
