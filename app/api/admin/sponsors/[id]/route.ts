import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Sponsor from "@/models/Sponsor";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const sponsor = await Sponsor.findByIdAndUpdate(params.id, { ...body, expiryDate: new Date(body.expiryDate) }, { new: true, runValidators: true }).lean();
    return NextResponse.json(sponsor);
  } catch {
    return NextResponse.json({ error: "Failed to update sponsor" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await connectDB();
  await Sponsor.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
