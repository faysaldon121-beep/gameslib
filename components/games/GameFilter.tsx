"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function GameFilter({ genres, platforms }: { genres: string[]; platforms: string[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/games?${params.toString()}`);
  };

  return (
    <div className="card p-5 space-y-5 sticky top-24">
      <div>
        <h3 className="font-semibold text-g-text mb-2">Genre</h3>
        <select className="input" value={searchParams.get("genre") ?? ""} onChange={(e) => update("genre", e.target.value)}>
          <option value="">All genres</option>
          {genres.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
        </select>
      </div>
      <div>
        <h3 className="font-semibold text-g-text mb-2">Platform</h3>
        <select className="input" value={searchParams.get("platform") ?? ""} onChange={(e) => update("platform", e.target.value)}>
          <option value="">All platforms</option>
          {platforms.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
        </select>
      </div>
      <button className="btn-secondary w-full justify-center" onClick={() => router.push("/games")}>Reset filters</button>
    </div>
  );
}
