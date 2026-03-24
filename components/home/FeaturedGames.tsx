import GameGrid from "@/components/games/GameGrid";

export default function FeaturedGames({ games }: { games: Array<Record<string, any>> }) {
  return <GameGrid games={games} />;
}
