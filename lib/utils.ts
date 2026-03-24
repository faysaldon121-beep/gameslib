import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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

export const GENRES = [
  "Action", "RPG", "Strategy", "Sports", "Horror",
  "Simulation", "Adventure", "Puzzle", "Racing", "Shooter",
] as const;

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
