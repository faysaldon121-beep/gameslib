import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    if (body.honeypot) return NextResponse.json({ success: true });
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const recent = await Review.findOne({ gameSlug: body.gameSlug, userEmail: body.userEmail, createdAt: { $gte: new Date(Date.now() - 1000 * 60 * 15) } }).lean();
    if (recent) return NextResponse.json({ error: "You have already submitted a recent review" }, { status: 429 });
    const review = await Review.create({
      gameSlug: body.gameSlug,
      gameId: body.gameId,
      userName: body.userName,
      userEmail: body.userEmail,
      rating: body.rating,
      title: body.title,
      body: body.body,
      ipAddress,
      honeypot: body.honeypot || "",
    });
    return NextResponse.json({ success: true, id: review._id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create review" }, { status: 400 });
  }
}
