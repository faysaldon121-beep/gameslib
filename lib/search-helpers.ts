import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";

export interface SearchOptions {
  q?: string;
  genre?: string;
  platform?: string;
  page?: number;
  limit?: number;
  sort?: "relevance" | "rating" | "newest" | "popular";
}

export interface SearchResult {
  games: any[];
  total: number;
  page: number;
  totalPages: number;
}

export async function searchGames(options: SearchOptions): Promise<SearchResult> {
  await connectDB();

  const {
    q,
    genre,
    platform,
    page = 1,
    limit = 18,
    sort = "relevance",
  } = options;

  const skip = (page - 1) * limit;

  // ── Build filter ──
  const filter: any = {};
  if (genre) filter.genre = genre;
  if (platform) filter.platforms = platform;

  // ── With search query ──
  if (q && q.trim().length > 0) {
    const searchQuery = q.trim();

    // Build aggregation pipeline
    const pipeline: any[] = [
      {
        $match: {
          $text: { $search: searchQuery },
          ...filter,
        },
      },
      {
        $addFields: {
          textScore: { $meta: "textScore" },
          // Boost: exact title match gets highest score
          titleBoost: {
            $cond: [
              {
                $regexMatch: {
                  input: "$title",
                  regex: searchQuery,
                  options: "i",
                },
              },
              10,
              0,
            ],
          },
          // Boost: featured games
          featuredBoost: {
            $cond: ["$isFeatured", 5, 0],
          },
          // Boost: highly rated
          ratingBoost: {
            $multiply: ["$averageRating", 0.5],
          },
        },
      },
      {
        $addFields: {
          finalScore: {
            $add: [
              "$textScore",
              "$titleBoost",
              "$featuredBoost",
              "$ratingBoost",
            ],
          },
        },
      },
    ];

    // Sort
    switch (sort) {
      case "rating":
        pipeline.push({ $sort: { averageRating: -1, finalScore: -1 } });
        break;
      case "newest":
        pipeline.push({ $sort: { createdAt: -1, finalScore: -1 } });
        break;
      case "popular":
        pipeline.push({ $sort: { downloadCount: -1, finalScore: -1 } });
        break;
      default: // relevance
        pipeline.push({ $sort: { finalScore: -1, averageRating: -1 } });
    }

    // Count total
    const countPipeline = [
      ...pipeline.slice(0, 1), // only the $match stage
      { $count: "total" },
    ];

    // Add pagination & projection
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });
    pipeline.push({
      $project: {
        title: 1,
        slug: 1,
        shortDescription: 1,
        coverImage: 1,
        genre: 1,
        averageRating: 1,
        reviewCount: 1,
        version: 1,
        platforms: 1,
        isFeatured: 1,
        downloadCount: 1,
        createdAt: 1,
        textScore: 1,
        finalScore: 1,
      },
    });

    const [games, countResult] = await Promise.all([
      Game.aggregate(pipeline),
      Game.aggregate(countPipeline),
    ]);

    const total = countResult.length > 0 ? countResult[0].total : 0;

    return {
      games,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ── Without search query (browse mode) ──
  let sortOption: any = { isFeatured: -1, averageRating: -1 };
  switch (sort) {
    case "rating":
      sortOption = { averageRating: -1 };
      break;
    case "newest":
      sortOption = { createdAt: -1 };
      break;
    case "popular":
      sortOption = { downloadCount: -1 };
      break;
  }

  const [games, total] = await Promise.all([
    Game.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .select(
        "title slug shortDescription coverImage genre averageRating reviewCount version platforms isFeatured downloadCount"
      )
      .lean(),
    Game.countDocuments(filter),
  ]);

  return {
    games,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// For live search suggestions (lightweight)
export async function searchSuggestions(q: string, limit = 8) {
  await connectDB();

  if (!q || q.trim().length < 2) return [];

  const games = await Game.aggregate([
    {
      $match: { $text: { $search: q.trim() } },
    },
    {
      $addFields: { score: { $meta: "textScore" } },
    },
    { $sort: { score: -1 } },
    { $limit: limit },
    {
      $project: {
        title: 1,
        slug: 1,
        coverImage: 1,
        genre: 1,
        averageRating: 1,
      },
    },
  ]);

  return games;
}
