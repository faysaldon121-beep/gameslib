import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";
import { slugify } from "@/lib/utils";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const game = await Game.findById(params.id).lean();
  if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(game);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const game = await Game.findByIdAndUpdate(
      params.id,
      {
        ...body,
        slug: slugify(body.slug || body.title),
        shortDescription: body.shortDescription || String(body.description || "").slice(0, 140),
        releaseDate: body.releaseDate ? new Date(body.releaseDate) : undefined,
      },
      { new: true, runValidators: true },
    ).lean();
    return NextResponse.json(game);
  } catch {
    return NextResponse.json({ error: "Failed to update game" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await connectDB();
  await Game.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
