"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import type { Chapter } from "@/lib/types";
import { cn, revelationPlaceMs } from "@/lib/utils";
import { IconSearch, IconX } from "./icons";
import { StarNumber } from "./ornaments";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f'`-]/g, "");
}

export function Sidebar({
  chapters,
  onNavigate,
}: {
  chapters: Chapter[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const activeId = useMemo(() => {
    const m = pathname.match(/\/surah\/(\d+)/);
    return m ? Number(m[1]) : null;
  }, [pathname]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return chapters;
    return chapters.filter((c) => {
      const hay = normalize(
        `${c.id} ${c.name_simple} ${c.translated_name.name} ${c.name_arabic}`
      );
      return hay.includes(q) || String(c.id) === q;
    });
  }, [chapters, query]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pt-5">
        <h2 className="text-lg font-extrabold tracking-tight text-fg-strong">
          Senarai <span className="text-gold-gradient">Surah</span>
        </h2>
        <span className="text-xs font-medium text-muted">{chapters.length} surah</span>
      </div>

      <div className="px-4 pb-3 pt-4">
        <div className="glass-card flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 focus-within:ring-gold-glow">
          <IconSearch size={17} className="shrink-0 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari surah…"
            className="w-full bg-transparent text-sm text-fg placeholder:text-muted focus:outline-none"
            aria-label="Cari surah"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Kosongkan carian"
              className="shrink-0 text-muted transition hover:text-fg"
            >
              <IconX size={15} />
            </button>
          )}
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-4">
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted">
              Tiada surah dijumpai.
            </p>
          ) : (
            <ul className="space-y-1">
              {filtered.map((c) => {
                const active = c.id === activeId;
                return (
                  <li key={c.id}>
                    <Link
                      href={`/surah/${c.id}`}
                      onClick={onNavigate}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition",
                        active
                          ? "glass-strong ring-gold-glow"
                          : "hover:bg-surface-hover"
                      )}
                    >
                      <StarNumber
                        value={c.id}
                        size={36}
                        className={active ? "text-gold-2" : "text-muted group-hover:text-gold-2"}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span
                            className={cn(
                              "truncate font-semibold",
                              active ? "text-fg-strong" : "text-fg"
                            )}
                          >
                            {c.name_simple}
                          </span>
                          <span
                            className="font-uthmanic text-lg leading-none text-gold-2"
                            translate="no"
                          >
                            {c.name_arabic}
                          </span>
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                          <span className="truncate">{c.translated_name.name}</span>
                          <span className="opacity-40">•</span>
                          <span className="shrink-0">{c.verses_count} ayat</span>
                          <span className="opacity-40">•</span>
                          <span className="shrink-0">{revelationPlaceMs(c.revelation_place)}</span>
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}
