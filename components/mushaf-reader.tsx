"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import type { VersesResponse, Word } from "@/lib/types";
import { pageFontFamily, preloadPageFonts, usePagesFont } from "@/lib/use-page-font";
import { SurahNameCalligraphy, OrnamentDivider } from "./ornaments";
import { IconChevronLeft, IconChevronRight, IconSpinner } from "./icons";

const NO_BISMILLAH = new Set([1, 9]);

type Row =
  | { kind: "header"; chapterId: number }
  | { kind: "bismillah" }
  | { kind: "line"; line: number; words: Word[]; terminal: boolean };

/** Susun perkataan satu muka surat → baris ikut line_number + banner surah. */
function buildRows(res: VersesResponse): Row[] {
  const rows: Row[] = [];
  let currentChapter: number | null = null;
  let currentLine: number | null = null;
  let lineWords: Word[] = [];

  const flush = () => {
    if (lineWords.length) {
      rows.push({ kind: "line", line: currentLine!, words: lineWords, terminal: false });
      lineWords = [];
    }
  };

  for (const v of res.verses) {
    const [ch, vn] = v.verse_key.split(":").map(Number);
    if (ch !== currentChapter) {
      flush();
      if (vn === 1) {
        rows.push({ kind: "header", chapterId: ch });
        if (!NO_BISMILLAH.has(ch)) rows.push({ kind: "bismillah" });
      }
      currentChapter = ch;
      currentLine = null;
    }
    for (const w of v.words) {
      if (w.line_number !== currentLine) {
        flush();
        currentLine = w.line_number;
      }
      lineWords.push(w);
    }
  }
  flush();

  rows.forEach((r, i) => {
    if (r.kind === "line") {
      const next = rows[i + 1];
      if (next && next.kind === "header") r.terminal = true;
    }
  });

  return rows;
}

async function fetchPage(page: number): Promise<VersesResponse> {
  const res = await fetch(`/api/page/${page}`);
  if (!res.ok) throw new Error("page");
  return res.json();
}

export function MushafReader({
  initialPage,
  initialData,
}: {
  initialPage: number;
  initialData: VersesResponse;
}) {
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ["page", initialPage],
    queryFn: () => fetchPage(initialPage),
    initialData,
    staleTime: Infinity,
  });

  const fontReady = usePagesFont([initialPage]);
  const rows = useMemo(() => buildRows(data), [data]);
  const centered = initialPage <= 2;
  const juz = data.verses[0]?.juz_number;
  const bodyRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (page: number) => {
      if (page < 1 || page > 604) return;
      router.push(`/mushaf/${page}`);
    },
    [router]
  );

  useEffect(() => {
    preloadPageFonts([initialPage - 1, initialPage + 1]);
  }, [initialPage]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // RTL: kiri = maju (seterusnya), kanan = undur (sebelum)
      if (e.key === "ArrowLeft") go(initialPage + 1);
      else if (e.key === "ArrowRight") go(initialPage - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, initialPage]);

  /**
   * Auto-fit: satu font-size seragam supaya setiap baris penuh lebar
   * (glyph QPC sudah ada spacing sendiri — tiada justify, tiada gap besar).
   */
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (centered || !fontReady || !body) return;

    const fit = () => {
      const lines = body.querySelectorAll<HTMLElement>("[data-fit-line]");
      if (!lines.length) return;
      const avail = body.clientWidth;
      let natural = 0;
      lines.forEach((l) => {
        natural = Math.max(natural, l.scrollWidth);
      });
      if (!avail || !natural) return;
      const current = parseFloat(getComputedStyle(lines[0]).fontSize) || 32;
      const target = Math.max(14, Math.min((current * avail) / natural * 0.99, 60));
      if (Math.abs(target - current) > 0.5) {
        body.style.setProperty("--mushaf-font", `${target}px`);
      }
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(body);
    return () => ro.disconnect();
  }, [centered, fontReady, initialPage, rows]);

  // RTL: arah baca kanan→kiri, jadi "Seterusnya" di kiri, "Sebelum" di kanan.
  const NavBar = (
    <div className="flex items-center justify-between gap-3">
      <button
        onClick={() => go(initialPage + 1)}
        disabled={initialPage >= 604}
        className="glass-card inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-fg transition hover:text-gold-2 disabled:pointer-events-none disabled:opacity-40"
      >
        <IconChevronLeft size={16} />
        Seterusnya
      </button>

      <div className="text-center">
        <p className="text-sm font-bold text-fg-strong">Muka Surat {initialPage}</p>
        {juz && <p className="text-xs text-muted">Juzuk {juz} · dari 604</p>}
      </div>

      <button
        onClick={() => go(initialPage - 1)}
        disabled={initialPage <= 1}
        className="glass-card inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-fg transition hover:text-gold-2 disabled:pointer-events-none disabled:opacity-40"
      >
        Sebelum
        <IconChevronRight size={16} />
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-28 sm:px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={initialPage}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.3 }}
        >
          <SurahFrameLite>
            {!fontReady ? (
              <div className="flex min-h-[60vh] items-center justify-center gap-2 text-muted">
                <IconSpinner size={24} />
                <span>Memuat mushaf…</span>
              </div>
            ) : (
              <div
                ref={bodyRef}
                className="space-y-2 py-2"
                style={
                  centered
                    ? undefined
                    : ({ "--mushaf-font": "clamp(17px, 5.4vw, 40px)" } as React.CSSProperties)
                }
              >
                {rows.map((row, i) => {
                  if (row.kind === "header") {
                    return <MushafBanner key={`h-${i}`} chapterId={row.chapterId} />;
                  }
                  if (row.kind === "bismillah") {
                    return (
                      <p
                        key={`b-${i}`}
                        dir="rtl"
                        translate="no"
                        className="font-uthmanic py-2 text-center text-2xl text-fg-strong sm:text-3xl"
                      >
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                      </p>
                    );
                  }
                  return <MushafLine key={`l-${row.line}-${i}`} words={row.words} centered={centered} />;
                })}
              </div>
            )}
          </SurahFrameLite>
        </motion.div>
      </AnimatePresence>

      {/* Navigasi di bawah */}
      <div className="mt-6">{NavBar}</div>

      <p className="mt-4 text-center text-[11px] text-muted">
        Mushaf KFGQPC Madinah · Gunakan anak panah ← → untuk selak muka surat
      </p>
    </div>
  );
}

/**
 * Satu baris mushaf — glyph dirender rapat (concatenated) mengikut reka bentuk
 * font QPC per muka surat. Saiz font di-auto-fit supaya baris penuh lebar.
 */
function MushafLine({ words, centered }: { words: Word[]; centered: boolean }) {
  if (centered) {
    return (
      <div
        dir="rtl"
        lang="ar"
        translate="no"
        className="quran-glyphs select-none whitespace-nowrap py-1 text-center text-fg-strong"
        style={{ fontSize: "clamp(1.4rem, 5.5vw, 2.2rem)", lineHeight: 2, textAlign: "center" }}
      >
        {words.map((w) => (
          <span key={w.id} style={{ fontFamily: pageFontFamily(w.page_number) }}>
            {w.code_v2}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      data-fit-line
      dir="rtl"
      lang="ar"
      translate="no"
      className="quran-glyphs select-none whitespace-nowrap text-center text-fg-strong"
      style={{ fontSize: "var(--mushaf-font)", lineHeight: 2.05, textAlign: "center" }}
    >
      {words.map((w) => (
        <span key={w.id} style={{ fontFamily: pageFontFamily(w.page_number) }}>
          {w.code_v2}
        </span>
      ))}
    </div>
  );
}

function MushafBanner({ chapterId }: { chapterId: number }) {
  return (
    <div className="my-3 flex items-center justify-center gap-3 py-1">
      <span className="h-px flex-1 bg-[var(--gold-border)]" />
      <span className="glass-card rounded-xl px-6 py-2">
        <SurahNameCalligraphy id={chapterId} className="text-3xl text-gold-gradient sm:text-4xl" />
      </span>
      <span className="h-px flex-1 bg-[var(--gold-border)]" />
    </div>
  );
}

function SurahFrameLite({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass-card relative rounded-3xl px-4 py-6 sm:px-10 sm:py-9">
      <div
        className="pointer-events-none absolute inset-3 rounded-2xl border opacity-40"
        style={{ borderColor: "var(--gold-border)" }}
        aria-hidden
      />
      <div className="relative">{children}</div>
      <OrnamentDivider className="mt-6" />
    </div>
  );
}
