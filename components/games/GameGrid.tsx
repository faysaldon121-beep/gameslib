import GameCard from "@/components/games/GameCard";

export default function GameGrid({ games }: { games: Array<Record<string, any>> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {games.map((game) => (
        <GameCard key={String(game._id ?? game.slug)} game={game as never} />
      ))}
    </div>
  );
}
