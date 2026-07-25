"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { Chapter } from "@/lib/types";
import { Sidebar } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";
import { BookmarksButton } from "./bookmarks-sheet";
import { IconMenu, IconX } from "./icons";

export function AppShell({
  chapters,
  children,
}: {
  chapters: Chapter[];
  children: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-svh">
      {/* Sidebar — desktop */}
      <aside className="glass-strong sticky top-0 hidden h-svh w-[340px] shrink-0 border-r lg:block">
        <BrandBar />
        <div className="h-[calc(100svh-4rem)]">
          <Sidebar chapters={chapters} />
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
              className="glass-strong fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-[340px] flex-col border-r lg:hidden"
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
                <Sidebar chapters={chapters} onNavigate={() => setDrawerOpen(false)} />
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
          <div className="flex-1" />
          <BookmarksButton chapters={chapters} />
          <ThemeToggle />
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

function BrandBar() {
  return (
    <div className="flex h-16 items-center border-b border-border-base px-5">
      <Link href="/">
        <Brand />
      </Link>
    </div>
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
