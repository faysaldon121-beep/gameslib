import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;

  if (!token || token !== process.env.ADMIN_TOKEN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
