import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Quran Explorer — Baca, Dengar, Hayati",
    short_name: "Quran Explorer",
    description:
      "Al-Quran digital: mushaf rasmi KFGQPC, terjemahan Bahasa Melayu, tafsir, dan bacaan audio pelbagai qari.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "ms",
    dir: "ltr",
    background_color: "#06080f",
    theme_color: "#06080f",
    categories: ["books", "education", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Mula Membaca",
        short_name: "Baca",
        url: "/surah/1",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Mod Baca Mushaf",
        short_name: "Mushaf",
        url: "/mushaf/1",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
