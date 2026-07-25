"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { Chapter } from "@/lib/types";
import { revelationPlaceMs } from "@/lib/utils";
import { IconSearch, IconCommand } from "./icons";
import { StarNumber } from "./ornaments";

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f'`-]/g, "");
}

export function CommandPalette({
  chapters,
  open,
  onClose,
}: {
  chapters: Chapter[];
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && <PaletteInner chapters={chapters} onClose={onClose} />}
    </AnimatePresence>
  );
}

/** Mount segar setiap kali dibuka → tiada reset state dalam effect. */
function PaletteInner({ chapters, onClose }: { chapters: Chapter[]; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return chapters.slice(0, 8);
    return chapters
      .filter((c) =>
        normalize(`${c.id} ${c.name_simple} ${c.translated_name.name} ${c.name_arabic}`).includes(q)
      )
      .slice(0, 12);
  }, [chapters, query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-idx="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (id: number) => {
    onClose();
    router.push(`/surah/${id}`);
  };

  const onQueryChange = (v: string) => {
    setQuery(v);
    setActive(0);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) go(results[active].id);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]">
      <motion.div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="glass-strong relative w-full max-w-xl overflow-hidden rounded-2xl border ring-gold-glow"
        initial={{ opacity: 0, y: -16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.98 }}
        transition={{ duration: 0.18 }}
      >
        <div className="flex items-center gap-3 border-b border-border-base px-4 py-3.5">
          <IconSearch size={19} className="shrink-0 text-gold-2" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Cari surah… (nama, nombor, terjemahan)"
            className="w-full bg-transparent text-fg placeholder:text-muted focus:outline-none"
          />
          <kbd className="hidden shrink-0 rounded-md border border-border-base px-1.5 py-0.5 text-[10px] text-muted sm:block">
            ESC
          </kbd>
        </div>

        <ul ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-muted">Tiada surah dijumpai.</li>
          ) : (
            results.map((c, i) => (
              <li key={c.id} data-idx={i}>
                <button
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(c.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    i === active ? "glass-card ring-gold-glow" : "hover:bg-surface-hover"
                  }`}
                >
                  <StarNumber value={c.id} size={34} className="text-gold-2" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold text-fg-strong">{c.name_simple}</span>
                      <span className="font-uthmanic text-lg leading-none text-gold-2" translate="no">
                        {c.name_arabic}
                      </span>
                    </span>
                    <span className="text-xs text-muted">
                      {c.translated_name.name} · {revelationPlaceMs(c.revelation_place)} ·{" "}
                      {c.verses_count} ayat
                    </span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="flex items-center justify-between border-t border-border-base px-4 py-2 text-[11px] text-muted">
          <span className="flex items-center gap-1.5">
            <IconCommand size={12} /> Palet arahan
          </span>
          <span className="hidden gap-3 sm:flex">
            <span>↑↓ pilih</span>
            <span>↵ buka</span>
          </span>
        </div>
      </motion.div>
    </div>
  );
}
