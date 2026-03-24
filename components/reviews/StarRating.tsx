"use client";

import { Star } from "lucide-react";

export default function StarRating({ rating, onChange, size = 18 }: { rating: number; onChange?: (value: number) => void; size?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((value) => (
        <button key={value} type="button" onClick={() => onChange?.(value)} className={onChange ? "cursor-pointer" : "cursor-default"}>
          <Star size={size} fill={value <= rating ? "currentColor" : "transparent"} className={value <= rating ? "text-g-gold" : "text-g-muted"} />
        </button>
      ))}
    </div>
  );
}
