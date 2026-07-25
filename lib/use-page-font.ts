"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * Loader dinamik font QPC V2 per muka surat (604 fail).
 * Family: `p{n}-v2` — setiap word span guna family muka surat DIA sendiri
 * (satu ayat boleh straddle 2 muka surat). Ikut recipe quran.com.
 */

const loadedPages = new Set<number>();
const pending = new Map<number, Promise<void>>();
const listeners = new Set<() => void>();

export function pageFontFamily(page: number): string {
  return `p${page}-v2`;
}

export function loadPageFont(page: number): Promise<void> {
  if (typeof document === "undefined" || page < 1 || page > 604) {
    return Promise.resolve();
  }
  if (loadedPages.has(page)) return Promise.resolve();

  const existing = pending.get(page);
  if (existing) return existing;

  const face = new FontFace(
    pageFontFamily(page),
    `url(/fonts/qpc/p${page}.ttf) format('truetype')`,
    { display: "swap" }
  );

  const task = face
    .load()
    .then((loaded) => {
      document.fonts.add(loaded);
      loadedPages.add(page);
      pending.delete(page);
      listeners.forEach((l) => l());
    })
    .catch((err) => {
      pending.delete(page);
      throw err;
    });

  pending.set(page, task);
  return task;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/**
 * True bila SEMUA muka surat yang diperlukan dah loaded.
 * Server snapshot = false → SSR render fallback Uthmani, client swap ke glyph.
 */
export function usePagesFont(pages: number[]): boolean {
  const key = pages.join(",");

  const ready = useSyncExternalStore(
    subscribe,
    () => pages.every((p) => loadedPages.has(p)),
    () => false
  );

  useEffect(() => {
    pages.forEach((p) => {
      loadPageFont(p).catch(() => {
        /* fallback Uthmani kekal — jangan crash UI */
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return ready;
}

/** Preload senyap (untuk muka surat bersebelahan). */
export function preloadPageFonts(pages: number[]): void {
  if (typeof window === "undefined") return;
  const run = () => pages.forEach((p) => loadPageFont(p).catch(() => {}));
  if ("requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(run);
  } else {
    setTimeout(run, 300);
  }
}
