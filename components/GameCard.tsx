'use client';

import Link from 'next/link';
import Image from 'next/image';
import { StarIcon, ArrowDownTrayIcon, CalendarIcon } from '@heroicons/react/24/solid';

interface GameCardProps {
  game: {
    _id: string;
    title: string;
    slug: string;
    coverImage: string;
    rating?: number;
    downloads?: number;
    releaseDate?: string;
    genres?: string[];
    platforms?: string[];
    size?: string;
  };
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <Link href={`/games/${game.slug}`} className="group block">
      <article className="bg-g-secondary rounded-lg overflow-hidden border border-g-border hover:border-purple-500 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 h-full flex flex-col">
        <div className="relative aspect-[3/4] overflow-hidden bg-g-bg">
          <Image
            src={game.coverImage}
            alt={game.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          />
          
          {game.rating && (
            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
              <StarIcon className="w-4 h-4 text-yellow-400" />
              <span className="text-white text-sm font-bold">{game.rating.toFixed(1)}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span className="text-sm">Download</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-base font-bold text-g-text mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors leading-tight">
            {game.title}
          </h3>

          {game.genres && game.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {game.genres.slice(0, 2).map((genre) => (
                <span
                  key={genre}
                  className="px-2 py-0.5 bg-purple-600/20 text-purple-400 text-xs rounded"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto pt-2 border-t border-g-border space-y-1 text-xs text-gray-500">
            {game.downloads !== undefined && (
              <div className="flex items-center gap-1">
                <ArrowDownTrayIcon className="w-3 h-3" />
                <span>{game.downloads.toLocaleString()} downloads</span>
              </div>
            )}
            {game.releaseDate && (
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                <span>{new Date(game.releaseDate).getFullYear()}</span>
              </div>
            )}
            {game.size && <div>Size: {game.size}</div>}
          </div>
        </div>
      </article>
    </Link>
  );
}
