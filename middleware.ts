import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isAdminAuthenticated(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  return !!token && token === process.env.ADMIN_TOKEN_SECRET;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow admin login page + login api
  const isAdminLoginPage = pathname.startsWith("/admin/login");
  const isAdminLoginApi = pathname.startsWith("/api/admin/login");

  const isAdminArea =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (isAdminArea && !isAdminLoginPage && !isAdminLoginApi) {
    if (!isAdminAuthenticated(request)) {
      // For API requests: return 401 JSON
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // For pages: redirect to /admin/login
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
