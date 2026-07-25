"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useBookmarks } from "@/lib/stores/bookmarks";
import { IconBookOpen, IconChevronRight } from "./icons";

export function ResumeCard() {
  const lastRead = useBookmarks((s) => s.lastRead);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !lastRead) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link
        href={`/surah/${lastRead.chapterId}#ayah-${lastRead.verseKey}`}
        className="glass-card group flex items-center gap-4 rounded-2xl p-4 transition hover:ring-gold-glow"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gold-soft text-gold-2">
          <IconBookOpen size={22} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-medium uppercase tracking-wide text-muted">
            Sambung bacaan
          </span>
          <span className="block truncate font-semibold text-fg-strong">
            {lastRead.chapterName} · Ayat {lastRead.verseKey.split(":")[1]}
          </span>
        </span>
        <IconChevronRight className="shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-gold-2" />
      </Link>
    </motion.div>
  );
}
