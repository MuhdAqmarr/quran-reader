"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { Chapter, Juz } from "@/lib/types";
import { useBookmarks } from "@/lib/stores/bookmarks";
import { cn, parseVerseKey, revelationPlaceMs } from "@/lib/utils";
import { IconSearch, IconX, IconKaaba, IconMosque, IconLayers, IconBookmark, IconBookOpen } from "./icons";
import { StarNumber } from "./ornaments";

type Tab = "surah" | "juzuk" | "penanda";

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f'`-]/g, "");
}

function RevelationIcon({ place }: { place: Chapter["revelation_place"] }) {
  return place === "makkah" ? (
    <IconKaaba size={13} className="text-gold-2/80" />
  ) : (
    <IconMosque size={13} className="text-emerald/90" />
  );
}

export function Sidebar({
  chapters,
  juzs,
  onNavigate,
}: {
  chapters: Chapter[];
  juzs: Juz[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [tab, setTab] = useState<Tab>("surah");
  const [query, setQuery] = useState("");

  const activeId = useMemo(() => {
    const m = pathname.match(/\/surah\/(\d+)/);
    return m ? Number(m[1]) : null;
  }, [pathname]);

  const chapterName = useMemo(() => {
    const map = new Map(chapters.map((c) => [c.id, c.name_simple]));
    return (id: number) => map.get(id) ?? `Surah ${id}`;
  }, [chapters]);

  return (
    <div className="flex h-full flex-col">
      {/* Tabs */}
      <div className="px-4 pt-5">
        <div className="glass-card flex gap-1 rounded-2xl p-1">
          {(
            [
              ["surah", "Surah", IconBookOpen],
              ["juzuk", "Juzuk", IconLayers],
              ["penanda", "Penanda", IconBookmark],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition",
                tab === key ? "text-gold-2" : "text-muted hover:text-fg"
              )}
            >
              {tab === key && (
                <motion.span
                  layoutId="sidebar-tab"
                  className="glass-strong absolute inset-0 rounded-xl ring-gold-glow"
                  transition={{ type: "spring", damping: 26, stiffness: 320 }}
                />
              )}
              <Icon size={15} className="relative" />
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search (surah + juzuk) */}
      {tab !== "penanda" && (
        <div className="px-4 pb-2 pt-3">
          <div className="glass-card flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 focus-within:ring-gold-glow">
            <IconSearch size={17} className="shrink-0 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === "surah" ? "Cari surah…" : "Cari juzuk…"}
              className="w-full bg-transparent text-sm text-fg placeholder:text-muted focus:outline-none"
              aria-label="Cari"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Kosongkan" className="text-muted hover:text-fg">
                <IconX size={15} />
              </button>
            )}
          </div>
        </div>
      )}

      <nav className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-4">
        {tab === "surah" && (
          <SurahList
            chapters={chapters}
            query={query}
            activeId={activeId}
            onNavigate={onNavigate}
          />
        )}
        {tab === "juzuk" && (
          <JuzList juzs={juzs} query={query} chapterName={chapterName} onNavigate={onNavigate} />
        )}
        {tab === "penanda" && (
          <BookmarkList chapterName={chapterName} onNavigate={onNavigate} />
        )}
      </nav>
    </div>
  );
}

function SurahList({
  chapters,
  query,
  activeId,
  onNavigate,
}: {
  chapters: Chapter[];
  query: string;
  activeId: number | null;
  onNavigate?: () => void;
}) {
  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return chapters;
    return chapters.filter(
      (c) =>
        normalize(`${c.id} ${c.name_simple} ${c.translated_name.name} ${c.name_arabic}`).includes(q) ||
        String(c.id) === q
    );
  }, [chapters, query]);

  if (filtered.length === 0) {
    return <p className="px-4 py-6 text-center text-sm text-muted">Tiada surah dijumpai.</p>;
  }

  return (
    <ul className="space-y-1">
      {filtered.map((c) => {
        const active = c.id === activeId;
        return (
          <li key={c.id}>
            <Link
              href={`/surah/${c.id}`}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl py-2.5 pl-4 pr-3 transition",
                active ? "glass-strong ring-gold-glow" : "hover:bg-surface-hover"
              )}
            >
              {active && (
                <span
                  className="absolute inset-y-2 left-0 w-[3px] rounded-full"
                  style={{ background: "linear-gradient(180deg, var(--gold-1), var(--gold-3))" }}
                  aria-hidden
                />
              )}
              <StarNumber
                value={c.id}
                size={36}
                className={active ? "text-gold-2" : "text-muted group-hover:text-gold-2"}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className={cn("truncate font-semibold", active ? "text-fg-strong" : "text-fg")}>
                    {c.name_simple}
                  </span>
                  <span className="font-uthmanic text-lg leading-none text-gold-2" translate="no">
                    {c.name_arabic}
                  </span>
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                  <RevelationIcon place={c.revelation_place} />
                  <span>{revelationPlaceMs(c.revelation_place)}</span>
                  <span className="opacity-40">•</span>
                  <span>{c.verses_count} ayat</span>
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function JuzList({
  juzs,
  query,
  chapterName,
  onNavigate,
}: {
  juzs: Juz[];
  query: string;
  chapterName: (id: number) => string;
  onNavigate?: () => void;
}) {
  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return juzs;
    return juzs.filter((j) => String(j.juz_number).includes(q));
  }, [juzs, query]);

  return (
    <ul className="space-y-1">
      {filtered.map((j) => {
        const chapterIds = Object.keys(j.verse_mapping).map(Number).sort((a, b) => a - b);
        const first = chapterIds[0];
        const last = chapterIds[chapterIds.length - 1];
        const startAyah = j.verse_mapping[String(first)]?.split("-")[0] ?? "1";
        const span =
          first === last ? chapterName(first) : `${chapterName(first)} – ${chapterName(last)}`;

        return (
          <li key={j.juz_number}>
            <Link
              href={`/surah/${first}#ayah-${first}:${startAyah}`}
              onClick={onNavigate}
              className="group flex items-center gap-3 rounded-xl py-2.5 pl-3 pr-3 transition hover:bg-surface-hover"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gold-soft text-sm font-bold text-gold-2">
                {j.juz_number}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-fg">Juzuk {j.juz_number}</span>
                <span className="block truncate text-xs text-muted">{span}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function BookmarkList({
  chapterName,
  onNavigate,
}: {
  chapterName: (id: number) => string;
  onNavigate?: () => void;
}) {
  const bookmarks = useBookmarks((s) => s.bookmarks);
  const toggleBookmark = useBookmarks((s) => s.toggleBookmark);

  const items = useMemo(
    () =>
      Object.entries(bookmarks)
        .sort((a, b) => b[1] - a[1])
        .map(([verseKey]) => ({ verseKey, ...parseVerseKey(verseKey) })),
    [bookmarks]
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-soft text-gold-2">
          <IconBookmark size={22} />
        </span>
        <p className="text-sm text-muted">
          Belum ada ayat ditanda. Tekan ikon penanda pada mana-mana ayat.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {items.map((it) => (
        <li key={it.verseKey}>
          <div className="group flex items-center gap-2 rounded-xl pl-3 pr-2 transition hover:bg-surface-hover">
            <Link
              href={`/surah/${it.chapter}#ayah-${it.verseKey}`}
              onClick={onNavigate}
              className="flex min-w-0 flex-1 items-center gap-3 py-2.5"
            >
              <StarNumber value={it.verse} size={34} className="text-gold-2" />
              <span className="min-w-0">
                <span className="block truncate font-semibold text-fg">{chapterName(it.chapter)}</span>
                <span className="font-mono text-xs text-gold-2">{it.verseKey}</span>
              </span>
            </Link>
            <button
              onClick={() => toggleBookmark(it.verseKey)}
              aria-label="Buang penanda"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted transition hover:text-red-400"
            >
              <IconX size={14} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
