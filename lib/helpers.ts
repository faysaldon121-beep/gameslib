// lib/helpers.ts
import groupBy from "lodash/groupBy";
import truncate from "lodash/truncate";
import orderBy from "lodash/orderBy";

// Group games by genre for homepage
export function getGamesByGenre(games: any[], perGenre = 6) {
  const grouped = groupBy(games, "genre");

  return Object.entries(grouped).map(([genre, genreGames]) => ({
    genre,
    games: genreGames.slice(0, perGenre),
    total: genreGames.length,
  }));
}

// Truncate description safely
export function truncateText(text: string, length = 120): string {
  return truncate(text, { length, separator: " " });
}

// Sort games with multiple criteria
export function sortGames(games: any[], sortBy: string) {
  switch (sortBy) {
    case "rating":
      return orderBy(games, ["averageRating"], ["desc"]);
    case "newest":
      return orderBy(games, ["createdAt"], ["desc"]);
    case "popular":
      return orderBy(games, ["downloadCount"], ["desc"]);
    case "title":
      return orderBy(games, ["title"], ["asc"]);
    default:
      return orderBy(games, ["isFeatured", "averageRating"], ["desc", "desc"]);
  }
}
