"use client";

import { useState } from "react";
import { colorFor, slugFor } from "@/data/brands";

function isLight(hex: string): boolean {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return l > 0.6;
}

export default function BrandLogo({
  brand,
  size = "lg",
}: {
  brand: string;
  size?: "sm" | "md" | "lg";
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const color = colorFor(brand);
  const fg = isLight(color) ? "#0b0d10" : "#ffffff";
  const slug = slugFor(brand);

  const dims =
    size === "lg" ? "h-28 px-8 text-3xl rounded-2xl" :
    size === "md" ? "h-16 px-5 text-xl rounded-xl" :
                    "h-10 px-3 text-sm rounded-lg";

  if (!imgFailed) {
    return (
      <div
        className={`relative ${dims} flex items-center justify-center font-black tracking-tighter break-keep overflow-hidden`}
        style={{ background: color, color: fg }}
      >
        {/* public/logos/{slug}.png 가 있으면 이미지 사용, 없으면 onError 로 텍스트 폴백 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/logos/${slug}.png`}
          alt={brand}
          onError={() => setImgFailed(true)}
          className="absolute inset-0 w-full h-full object-contain p-3"
        />
      </div>
    );
  }

  return (
    <div
      className={`${dims} flex items-center justify-center font-black tracking-tighter break-keep`}
      style={{ background: color, color: fg }}
    >
      {brand}
    </div>
  );
}
