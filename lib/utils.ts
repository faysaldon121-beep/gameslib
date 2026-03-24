import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";


export const GENRES: string[] = [
  // Core genres
  'action',
  'adventure',
  'rpg', // role-playing game
  'strategy',
  'simulation',
  'sports',
  'racing',
  'fighting',
  'shooter',
  'puzzle',
  'horror',
  'survival',
  'sandbox',
  'open world',
  'stealth',
  'indie',
  'casual',
  'educational',
  'music',
  'rhythm',
  'party',
  'trivia',
  'board',
  'card',
  'arcade',
  'platformer',
  'metroidvania',
  'roguelike',
  'roguelite',
  'tactical',
  'turn-based',
  'real-time strategy (rts)',
  'multiplayer online battle arena (moba)',
  'battle royale',
  'first-person shooter (fps)',
  'third-person shooter (tps)',
  'visual novel',
  'point-and-click',
  'text-based',
  'hidden object',
  'building',
  'management',
  'tycoon',
  'farming',
  'life simulation',
  'vehicle simulation',
  'flight simulation',
  'space simulation',
  'sailing',
  'fishing',
  'hunting',
  'sports management',
  'racing simulation',
  'fighting simulation',
  'dance',
  'fitness',
  'vr',
  'massively multiplayer (mmo)',
  'massively multiplayer online role-playing (mmorpg)',
  'massively multiplayer online strategy (mmorts)',
  'massively multiplayer online shooter (mmofps)',
  'massively multiplayer online racing (mmoracing)',
  'co-op',
  'competitive',
  'single-player',
  'multiplayer',
  'online',
  'local multiplayer',
  'cross-platform',
  'story rich',
  'narrative',
  'choice-driven',
  'psychological',
  'comedy',
  'fantasy',
  'sci-fi',
  'cyberpunk',
  'medieval',
  'historical',
  'modern',
  'post-apocalyptic',
  'zombie',
  'vampire',
  'werewolf',
  'superhero',
  'anime',
  'cartoon',
  'realistic',
  'abstract',
  'retro',
  'pixel art',
  'hand-drawn',
  'low poly',
  'voxel',
  'vr supported',
  'steam deck verified',
  'controller support',
  'keyboard and mouse',
  'touch screen',
  'mac compatible',
  'linux compatible'
];
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.slice(0, length)}...` : str;
}


export type Genre = (typeof GENRES)[number];

export const PLATFORMS = ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"] as const;
export type Platform = (typeof PLATFORMS)[number];

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://gameslib.net";
}

export function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function pickSponsorTier(amount: number): "gold" | "silver" | "bronze" {
  if (amount >= 10000) return "gold";
  if (amount >= 5000) return "silver";
  return "bronze";
}
