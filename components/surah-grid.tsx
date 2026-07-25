"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Chapter } from "@/lib/types";
import { cn, revelationPlaceMs } from "@/lib/utils";
import { IconSearch, IconX } from "./icons";
import { StarNumber, SurahNameCalligraphy } from "./ornaments";

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f'`-]/g, "");
}

export function SurahGrid({ chapters }: { chapters: Chapter[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return chapters;
    return chapters.filter((c) =>
      normalize(`${c.id} ${c.name_simple} ${c.translated_name.name} ${c.name_arabic}`).includes(q)
    );
  }, [chapters, query]);

  return (
    <div>
      <div className="mx-auto mb-7 max-w-xl">
        <div className="glass-card flex items-center gap-3 rounded-2xl px-4 py-3 focus-within:ring-gold-glow">
          <IconSearch size={19} className="shrink-0 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari surah… (nama, nombor, terjemahan)"
            className="w-full bg-transparent text-fg placeholder:text-muted focus:outline-none"
            aria-label="Cari surah"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Kosongkan" className="text-muted hover:text-fg">
              <IconX size={16} />
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-muted">Tiada surah dijumpai untuk “{query}”.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.012, 0.3) }}
            >
              <Link
                href={`/surah/${c.id}`}
                className={cn(
                  "glass-card group flex items-center gap-3.5 rounded-2xl p-4 transition",
                  "hover:-translate-y-0.5 hover:ring-gold-glow"
                )}
              >
                <StarNumber value={c.id} size={44} className="text-gold-2" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="truncate font-bold text-fg-strong">{c.name_simple}</h3>
                    <SurahNameCalligraphy id={c.id} className="text-2xl leading-none text-gold-2" />
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted">
                    {c.translated_name.name}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                    <span>{revelationPlaceMs(c.revelation_place)}</span>
                    <span className="opacity-40">•</span>
                    <span>{c.verses_count} ayat</span>
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
