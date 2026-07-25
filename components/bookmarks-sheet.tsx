"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { Chapter } from "@/lib/types";
import { useBookmarks } from "@/lib/stores/bookmarks";
import { parseVerseKey } from "@/lib/utils";
import { IconBookmark, IconX } from "./icons";
import { StarNumber } from "./ornaments";

export function BookmarksButton({ chapters }: { chapters: Chapter[] }) {
  const [open, setOpen] = useState(false);
  const bookmarks = useBookmarks((s) => s.bookmarks);
  const toggleBookmark = useBookmarks((s) => s.toggleBookmark);
  const count = Object.keys(bookmarks).length;

  const chapterName = useMemo(() => {
    const m = new Map(chapters.map((c) => [c.id, c.name_simple]));
    return (id: number) => m.get(id) ?? `Surah ${id}`;
  }, [chapters]);

  const items = useMemo(
    () =>
      Object.entries(bookmarks)
        .sort((a, b) => b[1] - a[1])
        .map(([verseKey]) => ({ verseKey, ...parseVerseKey(verseKey) })),
    [bookmarks]
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ayat ditanda"
        className="glass-card relative grid h-10 w-10 place-items-center rounded-full text-fg transition hover:text-gold-2 hover:ring-gold-glow"
      >
        <IconBookmark size={18} filled={count > 0} />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold-2 px-1 text-[10px] font-bold text-black">
            {count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="glass-strong fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              role="dialog"
              aria-label="Ayat ditanda"
            >
              <header className="flex items-center justify-between border-b border-border-base px-5 py-4">
                <h3 className="flex items-center gap-2 font-bold text-fg-strong">
                  <IconBookmark size={18} className="text-gold-2" filled />
                  Ayat Ditanda
                  <span className="text-sm font-normal text-muted">({count})</span>
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Tutup"
                  className="grid h-9 w-9 place-items-center rounded-full text-muted transition hover:text-fg"
                >
                  <IconX size={18} />
                </button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gold-soft text-gold-2">
                      <IconBookmark size={26} />
                    </span>
                    <p className="text-muted">
                      Belum ada ayat ditanda.
                      <br />
                      Tekan ikon penanda pada mana-mana ayat.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {items.map((it) => (
                      <li key={it.verseKey}>
                        <div className="glass-card group flex items-center gap-3 rounded-2xl p-3 transition hover:ring-gold-glow">
                          <Link
                            href={`/surah/${it.chapter}#ayah-${it.verseKey}`}
                            onClick={() => setOpen(false)}
                            className="flex min-w-0 flex-1 items-center gap-3"
                          >
                            <StarNumber value={it.verse} size={38} className="text-gold-2" />
                            <span className="min-w-0">
                              <span className="block truncate font-semibold text-fg-strong">
                                {chapterName(it.chapter)}
                              </span>
                              <span className="font-mono text-xs text-gold-2">{it.verseKey}</span>
                            </span>
                          </Link>
                          <button
                            onClick={() => toggleBookmark(it.verseKey)}
                            aria-label="Buang penanda"
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition hover:text-red-400"
                          >
                            <IconX size={16} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
