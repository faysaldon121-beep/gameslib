import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Sponsor from "@/models/Sponsor";

export async function GET() {
  await connectDB();
  const sponsors = await Sponsor.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ sponsors });
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const sponsor = await Sponsor.create({
      ...body,
      expiryDate: new Date(body.expiryDate),
    });
    return NextResponse.json(sponsor, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create sponsor" }, { status: 400 });
  }
}
