import { NextRequest, NextResponse } from "next/server";
import { searchSuggestions } from "@/lib/search-helpers";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "8");

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchSuggestions(q, limit);

    return NextResponse.json(
      { results },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Search API error:", error);

    return NextResponse.json(
      { results: [], error: "Search failed" },
      { status: 500 }
    );
  }
}
