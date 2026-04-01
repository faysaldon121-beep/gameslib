import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import Badge from "@/components/ui/Badge";

interface GameCardProps {
  game: {
    title: string;
    slug: string;
    shortDescription?: string;
    coverImage?: string;
    genre: string;
    averageRating?: number;
    reviewCount?: number;
    version?: string;
    platforms?: string[];
    isFeatured?: boolean;
  };
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <Link href={`/games/${game.slug}`} className="card overflow-hidden group block">
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={game.coverImage) || "https://placehold.co/800x450/0f0f1a/7c3aed?text=No+Image"}
          alt={game.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="genre">{game.genre}</Badge>
          {game.isFeatured && <Badge variant="featured">Featured</Badge>}
        </div>
        <h3 className="font-bold text-g-text line-clamp-1 group-hover:text-g-purple transition-colors">{game.title}</h3>
        <p className="text-sm text-g-muted mt-2 line-clamp-2 min-h-[40px]">{game.shortDescription || "No summary available."}</p>
        <div className="flex items-center justify-between mt-4 text-xs text-g-muted">
          <span>{game.version ? `v${game.version}` : "v1.0"}</span>
          {game.averageRating ? (
            <span className="inline-flex items-center gap-1 text-g-gold font-semibold">
              <Star size={13} fill="currentColor" /> {game.averageRating.toFixed(1)}
            </span>
          ) : (
            <span>New</span>
          )}
        </div>
      </div>
    </Link>
  );
}
