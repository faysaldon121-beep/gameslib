import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import RequestModel from "@/models/Request";

export async function GET() {
  await connectDB();
  const requests = await RequestModel.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ requests });
}

export async function PATCH(req: Request) {
  await connectDB();
  const { id, status } = await req.json();
  const request = await RequestModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
  return NextResponse.json(request);
}
