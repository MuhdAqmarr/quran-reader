# Quran Explorer

Al-Quran digital moden — mushaf rasmi KFGQPC, terjemahan Bahasa Melayu, tafsir, dan bacaan audio pelbagai qari. Dibina dengan Next.js.

## Ciri-ciri

- **Reader ayat-demi-ayat** — setiap ayat kad tersendiri: teks Arab (glyph mushaf QPC V2), terjemahan Melayu (Basmeih) + English (Saheeh International, toggle), nombor muka surat & juzuk.
- **Mod Baca (mushaf)** — paparan 15-baris autentik seperti cetakan Madinah, 604 muka surat, navigasi papan kekunci/butang.
- **Audio pelbagai qari** — 7 qari (Al-Afasy, As-Sudais, AbdulBaset, Al-Husary, Al-Minshawi, Ash-Shuraym, Al-Shatri). Main satu ayat atau berterusan satu surah dengan sorotan ayat automatik (sinkron ikut *timing* audio) + kawalan skrin kunci (MediaSession).
- **Tafsir** — Ibn Kathir (English) & Tafsir Muyassar (Arab), dimuat atas permintaan.
- **Penanda & sambung bacaan** — tanda ayat kegemaran, teruskan dari tempat terakhir dibaca.
- **Dark & light mode**, reka bentuk glass + gradient + corak Islamik, responsif mobile.

## Integriti teks

**Tiada satu ayat pun dijana/ditaip oleh AI.** Semua teks Arab, terjemahan, tafsir dan *timing* audio di-*fetch* terus dari **[Quran.com API v4](https://api-docs.quran.com/)** (teks digital rasmi KFGQPC Madinah Mushaf). Font mushaf ialah **KFGQPC QPC V2** (604 fail, satu per muka surat) — perkataan dirender guna kod glyph `code_v2` yang dipadankan dengan font muka surat berkenaan.

## Teknologi

- **Next.js 16** (App Router) + TypeScript — frontend + backend (route handlers `app/api/*` sebagai proksi + cache; tiada server Express berasingan).
- Tailwind CSS v4 · Framer Motion · Zustand · TanStack Query · next-themes · isomorphic-dompurify.

## Setup

```bash
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start   # produksi
```

Font QPC (604 fail) berada di `public/fonts/qpc/`. Font Uthmani (`UthmanicHafs1Ver18.woff2`) & nama surah (`sura_names.woff2`) di `public/fonts/`.

## Struktur

```
app/
  (app)/         shell (sidebar + topbar) + landing + surah/[id] + mushaf/[page]
  api/           verses, page, tafsir, audio (proksi + cache seminggu)
components/       ayah-card, quran-words, mushaf-reader, audio-player, sidebar, …
lib/
  quran-api.ts   fetcher server-only
  constants.ts   ID terjemahan/tafsir (39 Basmeih, 20 Saheeh, 169/16 tafsir)
  reciters.ts    7 qari
  stores/        player, settings, bookmarks (Zustand + persist)
  use-page-font.ts  loader FontFace per muka surat (on-demand + preload)
```

## Kredit

- Teks & terjemahan: **Quran.com API** (KFGQPC Madinah Mushaf · Terjemahan Abdullah Muhammad Basmeih · Saheeh International).
- Tafsir: Ibn Kathir (Abridged), Tafsir Muyassar — via Quran.com.
- Audio: Quran.com / QuranicAudio.
- Font: **King Fahd Glorious Quran Printing Complex (KFGQPC)**.

## Nota

Tafsir Bahasa Melayu belum tersedia dalam sumber data terbuka — buat masa ini tafsir dipaparkan dalam English/Arab dengan label bahasa yang jelas. Struktur sedia untuk *plug-in* dataset tafsir Melayu jika ada.
