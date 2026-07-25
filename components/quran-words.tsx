"use client";

import { useMemo } from "react";
import type { Word } from "@/lib/types";
import type { ArabicScale } from "@/lib/stores/settings";
import { pageFontFamily, usePagesFont } from "@/lib/use-page-font";
import { cn } from "@/lib/utils";

const SCALE_CLASS: Record<ArabicScale, string> = {
  1: "text-[1.7rem] sm:text-[2rem] leading-[2.1]",
  2: "text-[2.1rem] sm:text-[2.6rem] leading-[2]",
  3: "text-[2.6rem] sm:text-[3.2rem] leading-[1.95]",
};

/**
 * Render perkataan Arab guna glyph QPC V2 per muka surat (code_v2).
 * Setiap word = satu <span> dengan font-family muka surat DIA (ayat boleh
 * merentas 2 muka surat). Sementara font belum siap → fallback teks Uthmani.
 */
export function QuranWords({
  words,
  verseNumber,
  scale = 2,
  className,
}: {
  words: Word[];
  verseNumber: number;
  scale?: ArabicScale;
  className?: string;
}) {
  const pages = useMemo(
    () => Array.from(new Set(words.map((w) => w.page_number))),
    [words]
  );
  const fontReady = usePagesFont(pages);

  return (
    <div
      dir="rtl"
      lang="ar"
      translate="no"
      className={cn("quran-glyphs select-none text-fg-strong", SCALE_CLASS[scale], className)}
    >
      {fontReady ? (
        words.map((w, i) => (
          <span key={w.id}>
            {/* zero-width space = peluang patah baris tanpa jarak tambahan
                (glyph QPC sudah ada spacing sendiri) */}
            {i > 0 && "\u200B"}
            <span
              data-word={w.char_type_name}
              style={{ fontFamily: pageFontFamily(w.page_number) }}
            >
              {w.code_v2}
            </span>
          </span>
        ))
      ) : (
        <span className="font-uthmanic">
          {words
            .filter((w) => w.char_type_name === "word")
            .map((w) => w.text_uthmani)
            .join(" ")}{" "}
          <span className="mx-1 inline-flex items-center justify-center rounded-full border border-gold px-2 align-middle text-[0.5em] text-gold-2">
            {verseNumber}
          </span>
        </span>
      )}
    </div>
  );
}
