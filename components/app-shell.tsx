"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { Chapter, Juz } from "@/lib/types";
import { useBookmarks } from "@/lib/stores/bookmarks";
import { useMounted } from "@/lib/use-mounted";
import { hijriToday } from "@/lib/hijri";
import { Sidebar } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";
import { BookmarksButton } from "./bookmarks-sheet";
import { CommandPalette } from "./command-palette";
import { IconMenu, IconX, IconSearch, IconChevronRight } from "./icons";

export function AppShell({
  chapters,
  juzs,
  children,
}: {
  chapters: Chapter[];
  juzs: Juz[];
  children: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  // ⌘K / Ctrl+K → palet arahan
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-svh">
      {/* Sidebar — desktop */}
      <aside className="glass-strong sticky top-0 hidden h-svh w-[340px] shrink-0 border-r lg:block">
        <div className="relative flex h-16 items-center border-b border-border-base px-5">
          <Link href="/">
            <Brand />
          </Link>
          <GoldHairline />
        </div>
        <div className="h-[calc(100svh-4rem)]">
          <Sidebar chapters={chapters} juzs={juzs} />
        </div>
      </aside>

      {/* Sidebar — mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              className="glass-strong fixed inset-y-0 left-0 z-50 flex w-[88%] max-w-[340px] flex-col border-r lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="flex h-16 items-center justify-between border-b border-border-base px-5">
                <Brand />
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Tutup"
                  className="grid h-9 w-9 place-items-center rounded-full text-muted transition hover:text-fg"
                >
                  <IconX size={18} />
                </button>
              </div>
              <div className="min-h-0 flex-1">
                <Sidebar chapters={chapters} juzs={juzs} onNavigate={() => setDrawerOpen(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass-strong sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 sm:px-6">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Buka senarai surah"
            className="grid h-10 w-10 place-items-center rounded-full text-fg transition hover:text-gold-2 lg:hidden"
          >
            <IconMenu size={20} />
          </button>

          <Link href="/" className="lg:hidden">
            <Brand compact />
          </Link>

          <Breadcrumb chapters={chapters} />

          <div className="flex-1" />

          {/* ⌘K pill */}
          <button
            onClick={() => setCmdOpen(true)}
            className="glass-card hidden items-center gap-2 rounded-full py-2 pl-3.5 pr-2.5 text-sm text-muted transition hover:text-fg hover:ring-gold-glow md:flex"
            aria-label="Cari surah"
          >
            <IconSearch size={15} />
            <span>Cari…</span>
            <kbd className="rounded-md border border-border-base px-1.5 py-0.5 text-[10px] font-medium">
              ⌘K
            </kbd>
          </button>
          <button
            onClick={() => setCmdOpen(true)}
            aria-label="Cari surah"
            className="glass-card grid h-10 w-10 place-items-center rounded-full text-fg transition hover:text-gold-2 md:hidden"
          >
            <IconSearch size={18} />
          </button>

          <HijriDate />
          <BookmarksButton chapters={chapters} />
          <ThemeToggle />

          <GoldHairline />
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <CommandPalette chapters={chapters} open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}

/** Garis emas halus di bawah bar (aksen). */
function GoldHairline() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
      style={{
        background:
          "linear-gradient(90deg, transparent, var(--gold-border) 20%, var(--gold-2) 50%, var(--gold-border) 80%, transparent)",
        opacity: 0.6,
      }}
    />
  );
}

/** Breadcrumb konteks — tunjuk apa yang sedang dibaca. */
function Breadcrumb({ chapters }: { chapters: Chapter[] }) {
  const pathname = usePathname();
  const lastRead = useBookmarks((s) => s.lastRead);
  const mounted = useMounted();

  const info = useMemo(() => {
    const surah = pathname.match(/\/surah\/(\d+)/);
    if (surah) {
      const id = Number(surah[1]);
      const c = chapters.find((ch) => ch.id === id);
      return c ? { label: c.name_simple, sub: c.translated_name.name, id } : null;
    }
    const mushaf = pathname.match(/\/mushaf\/(\d+)/);
    if (mushaf) return { label: "Mod Baca", sub: `Muka Surat ${mushaf[1]}`, id: null };
    return null;
  }, [pathname, chapters]);

  if (!info) return null;

  const ayah =
    mounted && info.id && lastRead?.chapterId === info.id
      ? `Ayat ${lastRead.verseKey.split(":")[1]}`
      : info.sub;

  return (
    <div className="hidden min-w-0 items-center gap-2 sm:flex">
      <IconChevronRight size={15} className="shrink-0 text-muted" />
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-fg-strong">{info.label}</span>
        <span className="block truncate text-[11px] text-gold-2">{ayah}</span>
      </span>
    </div>
  );
}

function HijriDate() {
  const mounted = useMounted();
  const date = mounted ? hijriToday() : "";
  if (!date) return null;
  return (
    <span className="glass-card hidden items-center rounded-full px-3 py-2 text-xs font-medium text-muted xl:flex">
      {date}
    </span>
  );
}

function Brand({ compact }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="text-gold-2">
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden>
          <g stroke="currentColor" strokeWidth="1.3" fill="none">
            <rect x="8" y="8" width="16" height="16" rx="2" />
            <rect x="8" y="8" width="16" height="16" rx="2" transform="rotate(45 16 16)" />
          </g>
          <circle cx="16" cy="16" r="3" fill="currentColor" />
        </svg>
      </span>
      {!compact && (
        <span className="text-base font-extrabold tracking-tight text-fg-strong">
          Quran<span className="text-gold-gradient">Explorer</span>
        </span>
      )}
    </span>
  );
}
