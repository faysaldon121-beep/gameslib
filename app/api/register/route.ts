import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();
    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) return NextResponse.json({ error: 'User exists' }, { status: 409 });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ email, password: hashed, name });

    return NextResponse.json({ success: true, user: { id: user._id, email, name } });
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
