"use client";

import { useCallback, useEffect, useMemo } from "react";
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

  // Baris terakhir sebelum surah baru = jangan regang penuh
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

  const { data, isFetching } = useQuery({
    queryKey: ["page", initialPage],
    queryFn: () => fetchPage(initialPage),
    initialData,
    staleTime: Infinity,
  });

  const fontReady = usePagesFont([initialPage]);
  const rows = useMemo(() => buildRows(data), [data]);
  const centered = initialPage <= 2;

  const juz = data.verses[0]?.juz_number;

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
      if (e.key === "ArrowRight") go(initialPage + 1);
      else if (e.key === "ArrowLeft") go(initialPage - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, initialPage]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-28 sm:px-6">
      {/* Kawalan atas */}
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={() => go(initialPage - 1)}
          disabled={initialPage <= 1}
          className="glass-card inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-fg transition hover:text-gold-2 disabled:pointer-events-none disabled:opacity-40"
        >
          <IconChevronLeft size={16} />
          Sebelum
        </button>

        <div className="text-center">
          <p className="text-sm font-bold text-fg-strong">Muka Surat {initialPage}</p>
          {juz && <p className="text-xs text-muted">Juzuk {juz} · dari 604</p>}
        </div>

        <button
          onClick={() => go(initialPage + 1)}
          disabled={initialPage >= 604}
          className="glass-card inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-fg transition hover:text-gold-2 disabled:pointer-events-none disabled:opacity-40"
        >
          Seterusnya
          <IconChevronRight size={16} />
        </button>
      </div>

      {/* Halaman mushaf */}
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
              <div className="space-y-1 py-2">
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
                  return (
                    <MushafLine
                      key={`l-${row.line}-${i}`}
                      words={row.words}
                      centered={centered}
                      terminal={row.terminal}
                    />
                  );
                })}
              </div>
            )}
          </SurahFrameLite>
        </motion.div>
      </AnimatePresence>

      {isFetching && !fontReady && (
        <p className="mt-4 text-center text-xs text-muted">Memuat…</p>
      )}

      <p className="mt-6 text-center text-[11px] text-muted">
        Mushaf KFGQPC Madinah · Gunakan anak panah ← → untuk selak muka surat
      </p>
    </div>
  );
}

/** Satu baris mushaf — glyph regang penuh (justify) macam cetakan sebenar. */
function MushafLine({
  words,
  centered,
  terminal,
}: {
  words: Word[];
  centered: boolean;
  terminal: boolean;
}) {
  const alignLast = centered || terminal ? "center" : "justify";
  return (
    <div
      dir="rtl"
      lang="ar"
      translate="no"
      className="quran-glyphs select-none text-[1.6rem] leading-[2.15] text-fg-strong sm:text-[2rem]"
      style={{
        textAlign: centered ? "center" : "justify",
        textAlignLast: alignLast as "center" | "justify",
      }}
    >
      {words.map((w, i) => (
        <span key={w.id}>
          {i > 0 && " "}
          <span style={{ fontFamily: pageFontFamily(w.page_number) }}>{w.code_v2}</span>
        </span>
      ))}
    </div>
  );
}

/** Banner nama surah dalam mod baca. */
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

/** Bingkai halaman mushaf ringkas. */
function SurahFrameLite({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass-card relative rounded-3xl px-5 py-6 sm:px-10 sm:py-9">
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
