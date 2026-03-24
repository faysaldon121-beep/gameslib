import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import RequestModel from "@/models/Request";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.gameName || !body.userEmail) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    const recent = await RequestModel.findOne({ userEmail: body.userEmail, gameName: body.gameName, createdAt: { $gte: new Date(Date.now() - 1000 * 60 * 30) } }).lean();
    if (recent) return NextResponse.json({ error: "Duplicate request too soon" }, { status: 429 });
    const created = await RequestModel.create({ gameName: body.gameName, userEmail: body.userEmail, message: body.message || "" });
    return NextResponse.json({ success: true, id: created._id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}
