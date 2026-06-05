import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "시공사 브랜드 퀴즈",
    short_name: "시공사퀴즈",
    description: "대한민국 도급순위 100위권 시공사 브랜드 학습 대시보드",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0d10",
    theme_color: "#0b0d10",
    lang: "ko-KR",
    categories: ["education", "productivity"],
    icons: [
      { src: "/manifest-icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/manifest-icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/manifest-icon-maskable-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
