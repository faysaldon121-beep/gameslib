"use client";

import Image from "next/image";
import { useState } from "react";

export default function ImageCarousel({ images, title, priority = false }: { images: string[]; title: string; priority?: boolean }) {
  const [active, setActive] = useState(0);
  return (
    <div className="space-y-3">
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-g-border bg-g-card">
        <Image src={images[active]} alt={`${title} screenshot ${active + 1}`} fill className="object-cover" priority={priority} />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {images.map((src, index) => (
            <button key={src + index} onClick={() => setActive(index)} className={`relative aspect-video overflow-hidden rounded-lg border ${index === active ? "border-g-purple" : "border-g-border"}`}>
              <Image src={src} alt={`${title} thumbnail ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
