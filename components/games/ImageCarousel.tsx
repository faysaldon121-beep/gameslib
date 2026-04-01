"use client";

import { useState } from "react";

export default function ImageCarousel({ images, title, priority = false }: { images: string[]; title: string; priority?: boolean }) {
  const [active, setActive] = useState(0);
  return (
    <div className="space-y-3">
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-g-border bg-g-card">
        <img
          src={"/api/image-proxy?url=" + encodeURIComponent(images[active])}
          alt={`${title} screenshot ${active + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
          // priority is not supported on img, but you can add loading="eager" if needed
          loading={priority ? "eager" : "lazy"}
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {images.map((src, index) => (
            <button
              key={src + index}
              onClick={() => setActive(index)}
              className={`relative aspect-video overflow-hidden rounded-lg border ${index === active ? "border-g-purple" : "border-g-border"}`}
            >
              <img
                src={"/api/image-proxy?url=" + encodeURIComponent(src)}
                alt={`${title} thumbnail ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
